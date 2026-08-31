"""Read-only SQL validation — must stay aligned with:
  supabase/functions/_shared/explore/sql.ts
  supabase/migrate_explore.sql
"""

from __future__ import annotations

import re
from typing import Any, Dict, Tuple

FORBIDDEN = re.compile(
    r"\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|call|execute|do|set\s+|reset|"
    r"notify|listen|unlisten|vacuum|analyze|reindex|cluster|comment|security|owner|policy|function|"
    r"procedure|trigger|extension|schema|database|role|user|password)\b",
    re.I,
)


_PUBLIC_RELATIONS = re.compile(
    r"\bpublic\.(teams|seasons|players|games|rosters|shots|"
    r"v_brighton_shots|v_brighton_shots_official|v_brighton_games)\b",
    re.I,
)
_RAW_STAT_TABLES = re.compile(r"\b(from|join)\s+(public\.)?(shots|games)\b", re.I)
_VIEW_STAT = re.compile(r"\bv_brighton_(shots|shots_official|games)\b", re.I)


def validate_sql(sql: str) -> str:
    cleaned = (sql or "").strip()
    cleaned = re.sub(r";\s*$", "", cleaned)
    if not cleaned:
        raise ValueError("Model returned empty SQL")
    if re.search(r";\s*\S", cleaned):
        raise ValueError("Multiple SQL statements are not allowed")
    if not re.match(r"^\s*(with|select)\b", cleaned, re.I):
        raise ValueError("Only SELECT queries are allowed")
    if FORBIDDEN.search(cleaned):
        raise ValueError("Forbidden keyword in SQL")
    # Match explore_readonly / sql.ts: strip public. so explore.* views apply.
    cleaned = _PUBLIC_RELATIONS.sub(r"\1", cleaned)
    if not re.search(r"\blimit\b", cleaned, re.I):
        cleaned = f"SELECT * FROM ({cleaned}) AS explore_q LIMIT 100"
    return cleaned


def uses_raw_stat_tables(sql: str) -> bool:
    """Optional guardrail: True when SQL bypasses v_brighton_* for raw shots/games."""
    if _VIEW_STAT.search(sql or ""):
        return False
    return bool(_RAW_STAT_TABLES.search(sql or ""))



def parse_plan(raw: str) -> Dict[str, Any]:
    text = raw.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.I)
    text = re.sub(r"\s*```$", "", text)
    import json

    parsed = json.loads(text)
    if not parsed or not isinstance(parsed.get("sql"), str):
        raise ValueError("Invalid model response")
    viz = parsed.get("viz")
    if viz not in ("pitch", "none", "table"):
        viz = "table"
    return {
        "sql": parsed["sql"],
        "answer": (str(parsed.get("answer") or "").strip() or "Here is what I found."),
        "viz": viz,
    }


def is_safe_select(sql: str) -> Tuple[bool, str]:
    try:
        validate_sql(sql)
        return True, ""
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)
