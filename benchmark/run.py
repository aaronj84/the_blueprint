#!/usr/bin/env python3
"""
Explore LLM benchmark CLI.

Exercises the same production pipeline as the explore-shots Edge Function:
  question → SQL plan (LLM) → validate → explore_readonly → narrate (LLM)

Usage:
  python -m benchmark --check
  python -m benchmark --questions ./benchmark/questions.txt --runs 1
  python -m benchmark --questions ./benchmark/questions.txt --runs 5 --providers openai,anthropic
"""

from __future__ import annotations

import argparse
import json
import sys
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Allow `python benchmark/run.py` as well as `python -m benchmark`
if __name__ == "__main__" and __package__ is None:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    __package__ = "benchmark"

from .check import git_commit, print_check_report, run_checks
from .config import REPO_ROOT, api_key_for, build_config
from .pipeline import ExploreResult, run_explore_analysis
from .pricing import MODEL_PRICING, PRICING_VERSION
from .questions import BenchmarkQuestion, parse_questions_maybe_json
from .spreadsheet import TOOL_VERSION, row_from_result, timestamp_slug, write_csv, write_workbook


def _parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Benchmark OpenAI vs Anthropic on the Explore analysis pipeline",
    )
    p.add_argument(
        "--questions",
        help="Path to questions .txt (or .json/.jsonl with optional assertions)",
    )
    p.add_argument("--runs", type=int, default=1, help="Repetitions per question/model (default 1)")
    p.add_argument(
        "--providers",
        default="openai,anthropic",
        help="Comma-separated providers: openai,anthropic",
    )
    p.add_argument("--output", help="Output directory (default: ./benchmark-results)")
    p.add_argument("--concurrency", type=int, default=2, help="Max parallel executions (default 2)")
    p.add_argument(
        "--check",
        action="store_true",
        help="Validate configuration without running paid LLM calls",
    )
    p.add_argument(
        "--check-offline",
        action="store_true",
        help="Like --check but skip Supabase network probes",
    )
    return p.parse_args(argv)


def _run_one(
    *,
    q: BenchmarkQuestion,
    run_number: int,
    provider: str,
    model: str,
    api_key: str,
    supabase_url: str,
    service_key: str,
    plan_temperature: float,
    narrate_temperature: float,
) -> Tuple[str, str, int, ExploreResult]:
    result = run_explore_analysis(
        provider_id=provider,
        model=model,
        api_key=api_key,
        question=q.question,
        supabase_url=supabase_url,
        service_role_key=service_key,
        plan_temperature=plan_temperature,
        narrate_temperature=narrate_temperature,
    )
    return q.question_id, provider, run_number, result


def run_benchmark(cfg) -> int:
    questions = parse_questions_maybe_json(cfg.questions_path)
    if not questions:
        print("No questions to run.", file=sys.stderr)
        return 1

    jobs = []
    for run_number in range(1, cfg.runs + 1):
        for q in questions:
            for provider in cfg.providers:
                model = cfg.models[provider]
                key = api_key_for(cfg, provider)
                if not key:
                    print(f"Missing API key for {provider}", file=sys.stderr)
                    return 1
                jobs.append((q, run_number, provider, model, key))

    total = len(jobs)
    print(
        f"Running {total} executions "
        f"({len(questions)} questions × {len(cfg.providers)} providers × {cfg.runs} runs) "
        f"concurrency={cfg.concurrency}"
    )

    result_rows: List[Dict[str, Any]] = []
    completed = 0
    stamp = datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")

    def _safe_job(job):
        q, run_number, provider, model, key = job
        try:
            return _run_one(
                q=q,
                run_number=run_number,
                provider=provider,
                model=model,
                api_key=key,
                supabase_url=cfg.supabase_url,
                service_key=cfg.supabase_service_role_key,
                plan_temperature=cfg.plan_temperature,
                narrate_temperature=cfg.narrate_temperature,
            )
        except Exception as exc:  # noqa: BLE001
            # Should be rare — pipeline already catches most errors
            from .providers import TokenUsage
            from .prompts import PROMPT_VERSION

            err = ExploreResult(
                success=False,
                answer="",
                viz="table",
                sql=None,
                columns=[],
                rows=[],
                sql_execution_success=None,
                sql_error=None,
                sql_execution_ms=None,
                error=f"{exc}\n{traceback.format_exc()[-500:]}",
                error_kind="other",
                llm_calls=[],
                total_usage=TokenUsage(),
                total_llm_latency_ms=0,
                total_latency_ms=0,
                prompt_version=PROMPT_VERSION,
                model=model,
                provider=provider,
                plan_temperature=cfg.plan_temperature,
                narrate_temperature=cfg.narrate_temperature,
                cost={},
            )
            return q.question_id, provider, run_number, err

    with ThreadPoolExecutor(max_workers=cfg.concurrency) as pool:
        futures = {pool.submit(_safe_job, job): job for job in jobs}
        for fut in as_completed(futures):
            qid, provider, run_number, result = fut.result()
            # recover question text
            qtext = next(q.question for q in questions if q.question_id == qid)
            row = row_from_result(
                question_id=qid,
                question=qtext,
                run_number=run_number,
                result=result,
                timestamp=stamp,
            )
            result_rows.append(row)
            completed += 1
            status = "ok" if result.success else f"FAIL:{result.error_kind}"
            print(
                f"  [{completed}/{total}] {qid} {provider} run={run_number} "
                f"{status} {result.total_latency_ms}ms"
            )

    # Stable sort for spreadsheet readability
    result_rows.sort(key=lambda r: (r["Question ID"], r["Run #"], r["Provider"]))

    slug = timestamp_slug()
    cfg.output_dir.mkdir(parents=True, exist_ok=True)
    xlsx_path = cfg.output_dir / f"llm-benchmark-{slug}.xlsx"
    csv_path = cfg.output_dir / f"llm-benchmark-{slug}.csv"

    pricing_used = {
        cfg.models[p]: MODEL_PRICING.get(cfg.models[p]) or "unknown"
        for p in cfg.providers
    }
    metadata = {
        "benchmark_timestamp": stamp,
        "tool_version": TOOL_VERSION,
        "git_commit": git_commit(REPO_ROOT),
        "questions_file": str(cfg.questions_path),
        "question_count": len(questions),
        "runs": cfg.runs,
        "providers": ",".join(cfg.providers),
        "openai_model": cfg.models.get("openai", ""),
        "anthropic_model": cfg.models.get("anthropic", ""),
        "plan_temperature": cfg.plan_temperature,
        "narrate_temperature": cfg.narrate_temperature,
        "prompt_version": "explore-schema-v1",
        "pricing_version": PRICING_VERSION,
        "pricing_rates_used": pricing_used,
        "supabase_url": cfg.supabase_url or "",
        "concurrency": cfg.concurrency,
        "total_executions": len(result_rows),
        "successful_executions": sum(1 for r in result_rows if r["Success"]),
    }

    try:
        write_workbook(path=xlsx_path, result_rows=result_rows, metadata=metadata)
        write_csv(csv_path, result_rows)
    except Exception as exc:  # noqa: BLE001
        print(f"Failed to write spreadsheet: {exc}", file=sys.stderr)
        # Still dump JSON fallback
        fallback = cfg.output_dir / f"llm-benchmark-{slug}.json"
        fallback.write_text(json.dumps(result_rows, indent=2, default=str), encoding="utf-8")
        print(f"Wrote JSON fallback: {fallback}")
        return 1

    print(f"\nWrote {xlsx_path}")
    print(f"Wrote {csv_path}")
    return 0


def main(argv: Optional[List[str]] = None) -> int:
    args = _parse_args(argv)
    cfg = build_config(
        questions=args.questions,
        runs=args.runs,
        providers=args.providers,
        output=args.output,
        concurrency=args.concurrency,
    )

    if args.check or args.check_offline:
        results = run_checks(cfg, include_network=not args.check_offline)
        return print_check_report(results)

    # Preflight critical checks before spending money
    pre = run_checks(cfg, include_network=True)
    bad = [r for r in pre if not r[1] and not r[0].endswith("_pricing")]
    # soft: pricing unknown is ok
    critical_fail = [
        r
        for r in bad
        if r[0].endswith("_api_key")
        or r[0] in ("questions_file", "supabase", "explore_readonly", "output_dir", "prompts_sync")
    ]
    if critical_fail:
        print_check_report(pre)
        print("Aborting live run due to failed preflight checks.", file=sys.stderr)
        return 1

    return run_benchmark(cfg)


if __name__ == "__main__":
    raise SystemExit(main())
