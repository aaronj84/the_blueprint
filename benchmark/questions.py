"""Parse benchmark question files and optional future assertion specs."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class BenchmarkQuestion:
    """One benchmark case. Assertions are optional and unused in v1."""

    question_id: str
    question: str
    expected: Dict[str, Any] = field(default_factory=dict)
    # Future: expected_player, expected_number, required_sql_filter, forbidden_behavior, ...


def parse_questions_file(path: Path) -> List[BenchmarkQuestion]:
    """
    Plain-text format:
      - one question per line
      - blank lines ignored
      - lines starting with # are comments
      - leading/trailing whitespace trimmed
    """
    text = path.read_text(encoding="utf-8")
    questions: List[BenchmarkQuestion] = []
    n = 0
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        n += 1
        questions.append(
            BenchmarkQuestion(
                question_id=f"Q{n:03d}",
                question=stripped,
            )
        )
    return questions


def parse_questions_maybe_json(path: Path) -> List[BenchmarkQuestion]:
    """
    Prefer .txt line format. If the file is JSON/JSONL with richer specs,
    accept that too so assertions can be added later without rewriting the harness.
    """
    suffix = path.suffix.lower()
    if suffix in (".json", ".jsonl"):
        import json

        raw = path.read_text(encoding="utf-8").strip()
        items: List[Any]
        if suffix == ".jsonl":
            items = [json.loads(line) for line in raw.splitlines() if line.strip()]
        else:
            data = json.loads(raw)
            items = data if isinstance(data, list) else data.get("questions", [])
        out: List[BenchmarkQuestion] = []
        for i, item in enumerate(items, start=1):
            if isinstance(item, str):
                out.append(BenchmarkQuestion(question_id=f"Q{i:03d}", question=item.strip()))
            elif isinstance(item, dict):
                q = str(item.get("question") or "").strip()
                if not q:
                    continue
                qid = str(item.get("id") or item.get("question_id") or f"Q{i:03d}")
                expected = {k: v for k, v in item.items() if k not in ("question", "id", "question_id")}
                out.append(BenchmarkQuestion(question_id=qid, question=q, expected=expected))
        return out
    return parse_questions_file(path)
