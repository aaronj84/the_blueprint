"""
Golden-test harness for Explore scope consistency.

Computes / verifies hardcoded numeric answers against v_brighton_* views,
and optionally grades live model runs.

Usage:
  python -m benchmark.golden --verify          # DB truth vs golden.json (no LLM)
  python -m benchmark.golden --compute         # print view-computed totals to refresh goldens
  python -m benchmark.golden --run --providers openai   # LLM + auto-grade
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

if __name__ == "__main__" and __package__ is None:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    __package__ = "benchmark"

from .config import build_config, api_key_for
from .pipeline import execute_readonly_sql, run_explore_analysis
from .prompts import KNOWN_FRIENDLY_OPPONENTS, PROMPT_VERSION
from .sql_safety import uses_raw_stat_tables, validate_sql

ROOT = Path(__file__).resolve().parent
DEFAULT_GOLDEN = ROOT / "golden.json"


@dataclass
class GradeResult:
    case_id: str
    ok: bool
    detail: str
    expected: Any = None
    observed: Any = None


def _load_golden(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _rpc(cfg, sql: str) -> List[Any]:
    rows, err, _ms = execute_readonly_sql(
        supabase_url=cfg.supabase_url,
        service_role_key=cfg.supabase_service_role_key,
        sql=validate_sql(sql),
    )
    if err:
        raise RuntimeError(err)
    return rows


def verify_semantic_layer(cfg) -> List[GradeResult]:
    """Structural checks: Raya is friendly, excluded from official, views exist."""
    out: List[GradeResult] = []

    rows = _rpc(
        cfg,
        """
        SELECT opponent_name, stat_scope, is_tracked
        FROM v_brighton_games
        WHERE opponent_name = 'Raya Vallecano SC'
        LIMIT 5
        """,
    )
    if not rows:
        out.append(
            GradeResult(
                "raya_present",
                False,
                "Raya Vallecano SC not found on v_brighton_games",
            )
        )
    else:
        scope = rows[0].get("stat_scope")
        out.append(
            GradeResult(
                "raya_friendly",
                scope == "friendly",
                f"stat_scope={scope!r}",
                expected="friendly",
                observed=scope,
            )
        )

    rows = _rpc(
        cfg,
        """
        SELECT count(*)::int AS n
        FROM v_brighton_shots_official
        WHERE opponent_name = 'Raya Vallecano SC'
        """,
    )
    n = int(rows[0]["n"]) if rows else -1
    out.append(
        GradeResult(
            "raya_excluded_official",
            n == 0,
            f"official view rows for Raya={n}",
            expected=0,
            observed=n,
        )
    )

    rows = _rpc(
        cfg,
        """
        SELECT count(*)::int AS n
        FROM v_brighton_shots
        WHERE opponent_name = 'Raya Vallecano SC'
        """,
    )
    n_all = int(rows[0]["n"]) if rows else -1
    out.append(
        GradeResult(
            "raya_visible_all_shots",
            n_all > 0,
            f"v_brighton_shots rows for Raya={n_all}",
            expected=">0",
            observed=n_all,
        )
    )

    rows = _rpc(
        cfg,
        """
        SELECT count(*)::int AS untracked
        FROM v_brighton_games
        WHERE is_tracked = false
        """,
    )
    untracked = int(rows[0]["untracked"]) if rows else 0
    out.append(
        GradeResult(
            "untracked_games_visible",
            True,
            f"untracked games on v_brighton_games={untracked}",
            observed=untracked,
        )
    )
    return out


def compute_player_totals(cfg) -> Dict[str, Any]:
    """View-computed truth for refreshing golden.json."""
    official = _rpc(
        cfg,
        """
        SELECT player_name, count(*)::int AS shots
        FROM v_brighton_shots_official
        WHERE is_brighton_shot
        GROUP BY player_name
        ORDER BY shots DESC, player_name
        LIMIT 30
        """,
    )
    all_tracked = _rpc(
        cfg,
        """
        SELECT player_name, count(*)::int AS shots
        FROM v_brighton_shots
        WHERE is_brighton_shot
        GROUP BY player_name
        ORDER BY shots DESC, player_name
        LIMIT 30
        """,
    )
    last4 = _rpc(
        cfg,
        """
        SELECT game_date::text, opponent_name, is_tracked,
               shots_for, shots_against, goals_for, goals_against, stat_scope
        FROM v_brighton_games
        WHERE stat_scope IN ('official','preseason')
        ORDER BY game_date DESC
        LIMIT 4
        """,
    )
    return {
        "prompt_version": PROMPT_VERSION,
        "player_shots_official": official,
        "player_shots_all_tracked": all_tracked,
        "last_four_official_preseason": last4,
    }


def _extract_int(text: str, patterns: List[str]) -> Optional[int]:
    for pat in patterns:
        m = re.search(pat, text or "", re.I)
        if m:
            return int(m.group(1))
    return None


def _row_number(rows: List[Any], key_candidates: List[str]) -> Optional[int]:
    if not rows:
        return None
    row = rows[0]
    if not isinstance(row, dict):
        return None
    for k in key_candidates:
        if k in row and row[k] is not None:
            try:
                return int(row[k])
            except (TypeError, ValueError):
                continue
    # single numeric column
    for v in row.values():
        if isinstance(v, bool):
            continue
        if isinstance(v, (int, float)):
            return int(v)
        if isinstance(v, str) and v.isdigit():
            return int(v)
    return None


def grade_case(
    case: Dict[str, Any],
    *,
    answer: str,
    sql: Optional[str],
    rows: List[Any],
) -> GradeResult:
    case_id = str(case.get("id") or case.get("question_id") or "?")
    expected = case.get("expected_number")
    key = case.get("result_key") or "shots"
    observed = _row_number(rows, [key, "shots", "total", "count", "n", "goals"])
    if observed is None:
        observed = _extract_int(
            answer,
            [
                rf"\b(\d+)\s+{re.escape(key)}\b",
                r"\b(\d+)\s+shots?\b",
                r"\b(\d+)\s+goals?\b",
                r"\btotal(?:ing)?\s+(\d+)\b",
                r"\b(\d+)\b",
            ],
        )

    require_view = case.get("require_view")
    if require_view and sql and require_view.lower() not in sql.lower():
        return GradeResult(
            case_id,
            False,
            f"SQL did not use required view {require_view!r}",
            expected=expected,
            observed=observed,
        )

    if case.get("forbid_raw_stats") and sql and uses_raw_stat_tables(sql):
        return GradeResult(
            case_id,
            False,
            "SQL used raw shots/games instead of v_brighton_*",
            expected=expected,
            observed=observed,
        )

    if expected is None:
        return GradeResult(case_id, True, "no numeric expectation", observed=observed)

    ok = observed == int(expected)
    return GradeResult(
        case_id,
        ok,
        "match" if ok else f"expected {expected}, got {observed}",
        expected=expected,
        observed=observed,
    )


def verify_golden_numbers(cfg, golden: Dict[str, Any]) -> List[GradeResult]:
    """Compare hardcoded expected_number values to live view SQL in each case."""
    out: List[GradeResult] = []
    for case in golden.get("cases", []):
        sql = case.get("truth_sql")
        if not sql:
            continue
        rows = _rpc(cfg, sql)
        key = case.get("result_key") or "shots"
        observed = _row_number(rows, [key, "shots", "total", "count", "n", "goals"])
        expected = case.get("expected_number")
        case_id = str(case.get("id"))
        if expected is None:
            out.append(GradeResult(case_id, True, "no expected_number", observed=observed))
            continue
        ok = observed == int(expected)
        out.append(
            GradeResult(
                case_id,
                ok,
                "truth_sql match" if ok else f"truth_sql expected {expected}, got {observed}",
                expected=expected,
                observed=observed,
            )
        )
    return out


def verify_regression_stability(cfg, golden: Dict[str, Any]) -> List[GradeResult]:
    """Same player total for 'this season' vs 'overall' when both map to official scope."""
    out: List[GradeResult] = []
    pair = golden.get("regression_pair")
    if not pair:
        return out
    player = pair["player_name"]
    season_sql = pair["season_sql"]
    overall_sql = pair["overall_sql"]
    season_n = _row_number(_rpc(cfg, season_sql), ["shots", "n", "total"])
    overall_n = _row_number(_rpc(cfg, overall_sql), ["shots", "n", "total"])
    expected = pair.get("expected_number")
    ok = season_n == overall_n and (expected is None or season_n == int(expected))
    out.append(
        GradeResult(
            "regression_season_vs_overall",
            bool(ok),
            f"{player}: season={season_n} overall={overall_n} expected={expected}",
            expected=expected,
            observed={"season": season_n, "overall": overall_n},
        )
    )
    return out


def run_llm_grades(cfg, golden: Dict[str, Any], providers: List[str]) -> List[GradeResult]:
    out: List[GradeResult] = []
    for provider in providers:
        key = api_key_for(cfg, provider)
        if not key:
            out.append(GradeResult(f"{provider}_key", False, "missing API key"))
            continue
        model = cfg.models[provider]
        for case in golden.get("cases", []):
            if not case.get("question"):
                continue
            result = run_explore_analysis(
                provider_id=provider,
                model=model,
                api_key=key,
                question=case["question"],
                supabase_url=cfg.supabase_url,
                service_role_key=cfg.supabase_service_role_key,
                plan_temperature=cfg.plan_temperature,
                narrate_temperature=cfg.narrate_temperature,
            )
            grade = grade_case(
                case,
                answer=result.answer,
                sql=result.sql,
                rows=result.rows,
            )
            grade.case_id = f"{provider}:{grade.case_id}"
            if not result.success:
                grade = GradeResult(
                    grade.case_id,
                    False,
                    f"pipeline failed: {result.error}",
                    expected=case.get("expected_number"),
                )
            out.append(grade)
    return out


def _print_results(results: List[GradeResult]) -> int:
    failed = 0
    for r in results:
        mark = "OK" if r.ok else "FAIL"
        if not r.ok:
            failed += 1
        print(f"  [{mark:4}] {r.case_id}: {r.detail}")
    print()
    print(f"{len(results) - failed}/{len(results)} passed")
    return 1 if failed else 0


def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Golden tests for Explore semantic layer")
    p.add_argument("--golden", type=Path, default=DEFAULT_GOLDEN)
    p.add_argument("--verify", action="store_true", help="Verify DB + golden numbers (no LLM)")
    p.add_argument("--compute", action="store_true", help="Print view-computed totals")
    p.add_argument("--run", action="store_true", help="Run LLM cases and auto-grade")
    p.add_argument("--providers", default="openai", help="Comma-separated providers for --run")
    args = p.parse_args(argv)

    cfg = build_config(
        questions=str(ROOT / "questions.smoke.txt"),
        runs=1,
        providers=args.providers,
        concurrency=1,
    )

    if args.compute:
        data = compute_player_totals(cfg)
        print(json.dumps(data, indent=2, default=str))
        return 0

    if not args.verify and not args.run:
        args.verify = True

    golden = _load_golden(args.golden) if args.golden.is_file() else {"cases": []}
    results: List[GradeResult] = []
    results.extend(verify_semantic_layer(cfg))
    if args.golden.is_file():
        results.extend(verify_golden_numbers(cfg, golden))
        results.extend(verify_regression_stability(cfg, golden))
    if args.run:
        providers = [x.strip() for x in args.providers.split(",") if x.strip()]
        results.extend(run_llm_grades(cfg, golden, providers))

    return _print_results(results)


if __name__ == "__main__":
    raise SystemExit(main())
