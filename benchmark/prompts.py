"""Load shared Explore prompts from the text files next to the edge-function module."""

from __future__ import annotations

from pathlib import Path

PROMPT_VERSION = "explore-schema-v1"

_SHARED = (
    Path(__file__).resolve().parents[1]
    / "supabase"
    / "functions"
    / "_shared"
    / "explore"
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
