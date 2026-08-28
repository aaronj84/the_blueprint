"""Load shared Explore prompts from the text files next to the edge-function module."""

from __future__ import annotations

import re
from pathlib import Path

PROMPT_VERSION = "explore-schema-v2"

# Canonical list — must match exclusions.ts and migrate_explore.sql explore.* views.
EXCLUDED_EXPLORE_OPPONENTS = ("Raya Vallecano SC",)

_SHARED = (
    Path(__file__).resolve().parents[1]
    / "supabase"
    / "functions"
    / "_shared"
    / "explore"
)

_MIGRATE_EXPLORE = (
    Path(__file__).resolve().parents[1] / "supabase" / "migrate_explore.sql"
)


def _read(name: str) -> str:
    path = _SHARED / name
    if not path.is_file():
        raise FileNotFoundError(f"Missing shared prompt file: {path}")
    return path.read_text(encoding="utf-8").strip()


def load_schema_prompt() -> str:
    return _read("schema_prompt.txt")


def load_narrate_prompt() -> str:
    return _read("narrate_prompt.txt")


def shared_prompt_dir() -> Path:
    return _SHARED


def extract_ts_prompt_export(ts_source: str, export_name: str) -> str:
    """Extract `export const NAME = \`...\`;` from prompts.ts for sync checks."""
    marker = f"export const {export_name} ="
    idx = ts_source.find(marker)
    if idx < 0:
        raise ValueError(f"Could not find {export_name} in prompts.ts")
    rest = ts_source[idx + len(marker) :].lstrip()
    if rest.startswith("`"):
        end = 1
        while end < len(rest):
            if rest[end] == "`" and rest[end - 1] != "\\":
                return rest[1:end]
            end += 1
        raise ValueError(f"Unclosed template for {export_name}")
    # Single-line string form: `export const X = \`...\`;` already handled;
    # also support: export const X =\n  `...`;
    raise ValueError(f"Unsupported prompt literal form for {export_name}")


def _parse_ts_string_array(ts_source: str, export_name: str) -> tuple[str, ...]:
    """Parse `export const NAME = ["a", "b"] as const;`."""
    marker = f"export const {export_name} ="
    idx = ts_source.find(marker)
    if idx < 0:
        raise ValueError(f"Could not find {export_name}")
    rest = ts_source[idx + len(marker) :]
    m = re.search(r"\[(.*?)\]", rest, re.S)
    if not m:
        raise ValueError(f"Could not parse array for {export_name}")
    return tuple(re.findall(r'"([^"]+)"', m.group(1)))


def prompts_in_sync() -> tuple[bool, str]:
    ts_path = _SHARED / "prompts.ts"
    if not ts_path.is_file():
        return False, f"Missing {ts_path}"
    ts = ts_path.read_text(encoding="utf-8")
    try:
        schema_ts = extract_ts_prompt_export(ts, "SCHEMA_PROMPT").strip()
        narrate_ts = extract_ts_prompt_export(ts, "NARRATE_PROMPT").strip()
    except ValueError as exc:
        return False, str(exc)
    schema_txt = load_schema_prompt()
    narrate_txt = load_narrate_prompt()
    if schema_ts != schema_txt:
        return False, "SCHEMA_PROMPT in prompts.ts does not match schema_prompt.txt"
    if narrate_ts != narrate_txt:
        return False, "NARRATE_PROMPT in prompts.ts does not match narrate_prompt.txt"
    return True, "prompts in sync"


def exclusions_in_sync() -> tuple[bool, str]:
    """Verify excluded opponents agree across TS, prompts, and migrate_explore.sql."""
    excl_path = _SHARED / "exclusions.ts"
    if not excl_path.is_file():
        return False, f"Missing {excl_path}"
    try:
        ts_list = _parse_ts_string_array(
            excl_path.read_text(encoding="utf-8"), "EXCLUDED_EXPLORE_OPPONENTS"
        )
    except ValueError as exc:
        return False, str(exc)

    if ts_list != EXCLUDED_EXPLORE_OPPONENTS:
        return (
            False,
            f"exclusions.ts {ts_list!r} != benchmark EXCLUDED_EXPLORE_OPPONENTS "
            f"{EXCLUDED_EXPLORE_OPPONENTS!r}",
        )

    schema = load_schema_prompt()
    if not _MIGRATE_EXPLORE.is_file():
        return False, f"Missing {_MIGRATE_EXPLORE}"
    migrate = _MIGRATE_EXPLORE.read_text(encoding="utf-8")

    for name in EXCLUDED_EXPLORE_OPPONENTS:
        if name not in schema:
            return False, f"schema_prompt.txt missing exclusion {name!r}"
        if f"'{name}'" not in migrate:
            return False, f"migrate_explore.sql missing literal '{name}'"
        if f'Never include opponent "{name}"' not in schema:
            return False, f"schema_prompt.txt missing EXCLUSIONS line for {name!r}"

    return True, f"exclusions in sync ({', '.join(EXCLUDED_EXPLORE_OPPONENTS)})"
