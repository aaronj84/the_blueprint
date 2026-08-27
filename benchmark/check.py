"""Configuration / dry-run checks — no paid LLM calls."""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import List, Tuple

import httpx

from .config import BenchmarkConfig, api_key_for, model_has_pricing
from .prompts import prompts_in_sync
from .questions import parse_questions_maybe_json
from .sql_safety import validate_sql


CheckResult = Tuple[str, bool, str]


def git_commit(repo_root: Path) -> str:
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=str(repo_root),
            stderr=subprocess.DEVNULL,
            text=True,
        )
        return out.strip()
    except Exception:  # noqa: BLE001
        return ""


def check_supabase(cfg: BenchmarkConfig) -> CheckResult:
    if not cfg.supabase_url or not cfg.supabase_service_role_key:
        return (
            "supabase",
            False,
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
        )
    # Lightweight connectivity: hit REST root with service role
    try:
        url = cfg.supabase_url.rstrip("/") + "/rest/v1/"
        res = httpx.get(
            url,
            headers={
                "apikey": cfg.supabase_service_role_key,
                "Authorization": f"Bearer {cfg.supabase_service_role_key}",
            },
            timeout=15.0,
        )
        if res.status_code >= 400:
            return ("supabase", False, f"REST probe failed: HTTP {res.status_code}")
        return ("supabase", True, f"reachable ({cfg.supabase_url})")
    except Exception as exc:  # noqa: BLE001
        return ("supabase", False, str(exc))


def check_explore_readonly(cfg: BenchmarkConfig) -> CheckResult:
    """Execute a trivial read-only probe via explore_readonly (no LLM)."""
    if not cfg.supabase_url or not cfg.supabase_service_role_key:
        return ("explore_readonly", False, "missing Supabase credentials")
    sql = validate_sql("SELECT 1 AS ok")
    url = cfg.supabase_url.rstrip("/") + "/rest/v1/rpc/explore_readonly"
    try:
        res = httpx.post(
            url,
            headers={
                "apikey": cfg.supabase_service_role_key,
                "Authorization": f"Bearer {cfg.supabase_service_role_key}",
                "Content-Type": "application/json",
            },
            json={"query": sql},
            timeout=30.0,
        )
        if res.status_code >= 400:
            return (
                "explore_readonly",
                False,
                f"RPC failed HTTP {res.status_code}: {res.text[:300]} "
                "(re-run supabase/migrate_explore.sql in the SQL editor)",
            )
        return ("explore_readonly", True, "SELECT 1 ok")
    except Exception as exc:  # noqa: BLE001
        return ("explore_readonly", False, str(exc))


def run_checks(cfg: BenchmarkConfig, *, include_network: bool = True) -> List[CheckResult]:
    results: List[CheckResult] = []

    # Questions file
    if not cfg.questions_path.is_file():
        results.append(("questions_file", False, f"not found: {cfg.questions_path}"))
    else:
        try:
            qs = parse_questions_maybe_json(cfg.questions_path)
            if not qs:
                results.append(("questions_file", False, "file parsed but contains no questions"))
            else:
                results.append(
                    ("questions_file", True, f"{len(qs)} question(s) in {cfg.questions_path}")
                )
        except Exception as exc:  # noqa: BLE001
            results.append(("questions_file", False, str(exc)))

    # Prompts sync
    ok, msg = prompts_in_sync()
    results.append(("prompts_sync", ok, msg))

    # API keys + models
    for provider in cfg.providers:
        key = api_key_for(cfg, provider)
        if key:
            results.append((f"{provider}_api_key", True, "present"))
        else:
            env_name = "OPENAI_API_KEY" if provider == "openai" else "ANTHROPIC_API_KEY"
            results.append((f"{provider}_api_key", False, f"{env_name} not set"))

        model = cfg.models.get(provider, "")
        if model:
            priced = model_has_pricing(model)
            results.append(
                (
                    f"{provider}_model",
                    True,
                    f"{model}" + ("" if priced else " (pricing unknown — costs will be blank)"),
                )
            )
            if not priced:
                results.append(
                    (
                        f"{provider}_pricing",
                        False,
                        f"no entry in pricing.py for {model} — update MODEL_PRICING",
                    )
                )
            else:
                results.append((f"{provider}_pricing", True, f"rates found for {model}"))
        else:
            results.append((f"{provider}_model", False, "model not configured"))

    # Output dir writable
    try:
        cfg.output_dir.mkdir(parents=True, exist_ok=True)
        probe = cfg.output_dir / ".write_probe"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink(missing_ok=True)
        results.append(("output_dir", True, str(cfg.output_dir)))
    except Exception as exc:  # noqa: BLE001
        results.append(("output_dir", False, str(exc)))

    # SQL safety smoke
    try:
        validate_sql("SELECT count(*) FROM shots LIMIT 10")
        try:
            validate_sql("DELETE FROM shots")
            results.append(("sql_safety", False, "DELETE was incorrectly allowed"))
        except ValueError:
            results.append(("sql_safety", True, "rejects non-SELECT / forbidden keywords"))
    except Exception as exc:  # noqa: BLE001
        results.append(("sql_safety", False, str(exc)))

    if include_network:
        results.append(check_supabase(cfg))
        results.append(check_explore_readonly(cfg))

    return results


def print_check_report(results: List[CheckResult]) -> int:
    """Print results; return process exit code (0 = all critical checks passed)."""
    critical_prefixes = (
        "questions_file",
        "prompts_sync",
        "output_dir",
        "sql_safety",
        "supabase",
        "explore_readonly",
    )
    # API keys are critical only for selected providers
    failed_critical = False
    print("Benchmark configuration check\n")
    for name, ok, detail in results:
        mark = "OK" if ok else "FAIL"
        print(f"  [{mark:4}] {name}: {detail}")
        if not ok:
            if name.startswith(critical_prefixes) or name.endswith("_api_key"):
                # pricing unknown is soft-fail
                if name.endswith("_pricing"):
                    continue
                failed_critical = True
            if name.endswith("_model") and not ok:
                failed_critical = True
    print()
    if failed_critical:
        print("Configuration check failed. Fix the items above before a live run.")
        return 1
    print("Configuration check passed. Safe to run a live benchmark when ready.")
    return 0
