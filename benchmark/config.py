"""Configuration loading for the Explore LLM benchmark."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

from .pricing import MODEL_PRICING, resolve_pricing

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = REPO_ROOT / "benchmark-results"
DEFAULT_QUESTIONS = Path(__file__).resolve().parent / "questions.example.txt"

DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "anthropic": "claude-sonnet-4-20250514",
}


@dataclass
class BenchmarkConfig:
    questions_path: Path
    runs: int
    providers: List[str]
    models: Dict[str, str]
    output_dir: Path
    concurrency: int
    openai_api_key: Optional[str]
    anthropic_api_key: Optional[str]
    supabase_url: Optional[str]
    supabase_service_role_key: Optional[str]
    plan_temperature: float = 0.1
    narrate_temperature: float = 0.2


def _load_dotenv(path: Path) -> None:
    """Minimal .env loader (no dependency). Does not override existing env."""
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


def load_env() -> None:
    _load_dotenv(REPO_ROOT / ".env")
    _load_dotenv(Path(__file__).resolve().parent / ".env")


def build_config(
    *,
    questions: Optional[str] = None,
    runs: int = 1,
    providers: Optional[str] = None,
    output: Optional[str] = None,
    concurrency: int = 2,
) -> BenchmarkConfig:
    load_env()
    provider_list = [
        p.strip().lower()
        for p in (providers or "openai,anthropic").split(",")
        if p.strip()
    ]
    models = {
        "openai": os.environ.get("BENCHMARK_OPENAI_MODEL")
        or os.environ.get("EXPLORE_OPENAI_MODEL")
        or DEFAULT_MODELS["openai"],
        "anthropic": os.environ.get("BENCHMARK_ANTHROPIC_MODEL")
        or DEFAULT_MODELS["anthropic"],
    }
    return BenchmarkConfig(
        questions_path=Path(questions).expanduser() if questions else DEFAULT_QUESTIONS,
        runs=max(1, int(runs)),
        providers=provider_list,
        models=models,
        output_dir=Path(output).expanduser() if output else DEFAULT_OUTPUT_DIR,
        concurrency=max(1, int(concurrency)),
        openai_api_key=os.environ.get("OPENAI_API_KEY"),
        anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY"),
        supabase_url=os.environ.get("SUPABASE_URL"),
        supabase_service_role_key=os.environ.get("SUPABASE_SERVICE_ROLE_KEY"),
    )


def api_key_for(cfg: BenchmarkConfig, provider: str) -> Optional[str]:
    if provider == "openai":
        return cfg.openai_api_key
    if provider == "anthropic":
        return cfg.anthropic_api_key
    return None


def known_pricing_models() -> List[str]:
    return sorted(MODEL_PRICING.keys())


def model_has_pricing(model: str) -> bool:
    return resolve_pricing(model) is not None
