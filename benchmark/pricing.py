"""
Model API pricing (USD per 1M tokens).

Update this file when provider prices change. Benchmark outputs record
which pricing snapshot was used (PRICING_VERSION + per-model rates).

Sources (verify before trusting historical files):
  OpenAI: https://openai.com/api/pricing/
  Anthropic: https://www.anthropic.com/pricing
  Google Gemini: https://ai.google.dev/gemini-api/docs/pricing

If a configured model is missing here, the benchmark still runs but marks
cost fields as unavailable (null) rather than guessing.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

# Bump when rates change so old spreadsheets stay interpretable.
PRICING_VERSION = "2026-08-28b"

# Prices are USD per 1,000,000 tokens.
# cached_input: discounted rate for cache-read / cached prompt tokens when billed separately.
# cache_write: Anthropic cache-write tokens when applicable.
MODEL_PRICING: Dict[str, Dict[str, float]] = {
    # OpenAI
    "gpt-4o-mini": {
        "input": 0.15,
        "output": 0.60,
        "cached_input": 0.075,
    },
    "gpt-4o": {
        "input": 2.50,
        "output": 10.00,
        "cached_input": 1.25,
    },
    "gpt-4.1-mini": {
        "input": 0.40,
        "output": 1.60,
        "cached_input": 0.10,
    },
    "gpt-4.1": {
        "input": 2.00,
        "output": 8.00,
        "cached_input": 0.50,
    },
    # Anthropic Claude
    "claude-sonnet-4-6": {
        "input": 3.00,
        "output": 15.00,
        "cached_input": 0.30,
        "cache_write": 3.75,
    },
    "claude-sonnet-5": {
        "input": 3.00,
        "output": 15.00,
        "cached_input": 0.30,
        "cache_write": 3.75,
    },
    "claude-sonnet-4-5": {
        "input": 3.00,
        "output": 15.00,
        "cached_input": 0.30,
        "cache_write": 3.75,
    },
    "claude-sonnet-4-5-20250929": {
        "input": 3.00,
        "output": 15.00,
        "cached_input": 0.30,
        "cache_write": 3.75,
    },
    "claude-sonnet-4-20250514": {
        "input": 3.00,
        "output": 15.00,
        "cached_input": 0.30,
        "cache_write": 3.75,
    },
    "claude-sonnet-4-0": {
        "input": 3.00,
        "output": 15.00,
        "cached_input": 0.30,
        "cache_write": 3.75,
    },
    "claude-3-5-sonnet-20241022": {
        "input": 3.00,
        "output": 15.00,
        "cached_input": 0.30,
        "cache_write": 3.75,
    },
    "claude-3-5-haiku-20241022": {
        "input": 0.80,
        "output": 4.00,
        "cached_input": 0.08,
        "cache_write": 1.00,
    },
    "claude-haiku-4-5-20251001": {
        "input": 1.00,
        "output": 5.00,
        "cached_input": 0.10,
        "cache_write": 1.25,
    },
    # Google Gemini (paid tier; thinking tokens billed as output)
    "gemini-3.6-flash": {
        "input": 0.30,
        "output": 2.50,
        "cached_input": 0.03,
    },
    "gemini-2.5-flash": {
        "input": 0.30,
        "output": 2.50,
        "cached_input": 0.03,
    },
    "gemini-2.5-pro": {
        "input": 1.25,
        "output": 10.00,
        "cached_input": 0.125,
    },
    "gemini-2.0-flash": {
        "input": 0.10,
        "output": 0.40,
        "cached_input": 0.025,
    },
}


def resolve_pricing(model: str) -> Optional[Dict[str, float]]:
    """Return pricing for an exact model id, or prefix match for dated variants."""
    if not model:
        return None
    if model in MODEL_PRICING:
        return dict(MODEL_PRICING[model])
    # Allow gpt-4o-mini-2024-07-18 → gpt-4o-mini
    for key, rates in MODEL_PRICING.items():
        if model.startswith(key) or key.startswith(model):
            return dict(rates)
    return None


def estimate_cost_usd(
    model: str,
    *,
    input_tokens: Optional[int] = None,
    output_tokens: Optional[int] = None,
    cached_input_tokens: Optional[int] = None,
    cache_write_tokens: Optional[int] = None,
    provider: str = "",
) -> Dict[str, Any]:
    """
    Estimate cost from API-reported token usage.

    OpenAI: prompt_tokens typically includes cached tokens; bill non-cached at
    input rate and cached at cached_input rate when both are present.

    Anthropic: input_tokens is usually non-cached input; cache_read and
    cache_creation are separate fields — do not subtract from input_tokens.

    Gemini: promptTokenCount typically includes cachedContentTokenCount when
    present — treat like OpenAI (subtract cached from input for billing).
    """
    rates = resolve_pricing(model)
    if not rates:
        return {
            "pricing_found": False,
            "pricing_version": PRICING_VERSION,
            "rates": None,
            "estimated_input_cost_usd": None,
            "estimated_output_cost_usd": None,
            "estimated_cache_cost_usd": None,
            "estimated_total_cost_usd": None,
        }

    inp = input_tokens or 0
    out = output_tokens or 0
    cached = cached_input_tokens or 0
    cache_write = cache_write_tokens or 0

    input_rate = rates.get("input", 0.0)
    output_rate = rates.get("output", 0.0)
    cached_rate = rates.get("cached_input", input_rate)
    cache_write_rate = rates.get("cache_write", 0.0)

    if provider in ("openai", "gemini") and cached > 0:
        # Cached tokens reported as a subset of prompt/input tokens.
        billable_input = max(inp - cached, 0)
        input_cost = billable_input * input_rate / 1_000_000
        cache_cost = cached * cached_rate / 1_000_000
        if cache_write:
            cache_cost += cache_write * cache_write_rate / 1_000_000
    else:
        # Anthropic (and fallback): input_tokens are non-cached; cache is additive.
        input_cost = inp * input_rate / 1_000_000
        cache_cost = 0.0
        if cached:
            cache_cost += cached * cached_rate / 1_000_000
        if cache_write:
            cache_cost += cache_write * cache_write_rate / 1_000_000

    output_cost = out * output_rate / 1_000_000
    total = input_cost + output_cost + cache_cost

    return {
        "pricing_found": True,
        "pricing_version": PRICING_VERSION,
        "rates": rates,
        "estimated_input_cost_usd": input_cost,
        "estimated_output_cost_usd": output_cost,
        "estimated_cache_cost_usd": cache_cost,
        "estimated_total_cost_usd": total,
    }
