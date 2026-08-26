"""LLM provider adapters — OpenAI and Anthropic — with normalized usage."""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import httpx


@dataclass
class TokenUsage:
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    cached_input_tokens: Optional[int] = None
    cache_write_tokens: Optional[int] = None
    reasoning_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    raw: Optional[Dict[str, Any]] = None

    def as_dict(self) -> Dict[str, Any]:
        return {
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "cached_input_tokens": self.cached_input_tokens,
            "cache_write_tokens": self.cache_write_tokens,
            "reasoning_tokens": self.reasoning_tokens,
            "total_tokens": self.total_tokens,
        }


@dataclass
class ChatResult:
    content: str
    model: str
    usage: TokenUsage
    latency_ms: int
    provider: str
    retries: int = 0


def _sleep_backoff(attempt: int) -> None:
    time.sleep(min(8.0, 0.5 * (2 ** (attempt - 1))))


def _openai_usage(raw: Optional[Dict[str, Any]]) -> TokenUsage:
    if not raw:
        return TokenUsage()
    details = raw.get("prompt_tokens_details") or {}
    completion_details = raw.get("completion_tokens_details") or {}
    u = TokenUsage(raw=raw)
    if "prompt_tokens" in raw:
        u.input_tokens = int(raw["prompt_tokens"])
    if "completion_tokens" in raw:
        u.output_tokens = int(raw["completion_tokens"])
    if "total_tokens" in raw:
        u.total_tokens = int(raw["total_tokens"])
    if "cached_tokens" in details:
        u.cached_input_tokens = int(details["cached_tokens"])
    if "reasoning_tokens" in completion_details:
        u.reasoning_tokens = int(completion_details["reasoning_tokens"])
    return u


def _anthropic_usage(raw: Optional[Dict[str, Any]]) -> TokenUsage:
    if not raw:
        return TokenUsage()
    u = TokenUsage(raw=raw)
    if "input_tokens" in raw:
        u.input_tokens = int(raw["input_tokens"])
    if "output_tokens" in raw:
        u.output_tokens = int(raw["output_tokens"])
    if "cache_read_input_tokens" in raw:
        u.cached_input_tokens = int(raw["cache_read_input_tokens"])
    if "cache_creation_input_tokens" in raw:
        u.cache_write_tokens = int(raw["cache_creation_input_tokens"])
    if u.input_tokens is not None and u.output_tokens is not None:
        u.total_tokens = u.input_tokens + u.output_tokens
    return u


class OpenAIProvider:
    id = "openai"

    def __init__(self, api_key: str, max_retries: int = 2, timeout: float = 120.0):
        self.api_key = api_key
        self.max_retries = max_retries
        self.timeout = timeout

    def complete(
        self,
        *,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.1,
        json_object: bool = False,
    ) -> ChatResult:
        body: Dict[str, Any] = {
            "model": model,
            "temperature": temperature,
            "messages": messages,
        }
        if json_object:
            body["response_format"] = {"type": "json_object"}

        started = time.time()
        last_err: Optional[Exception] = None
        retries = 0

        with httpx.Client(timeout=self.timeout) as client:
            for attempt in range(self.max_retries + 1):
                if attempt > 0:
                    retries = attempt
                    _sleep_backoff(attempt)
                try:
                    res = client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json=body,
                    )
                    if res.status_code in (429,) or res.status_code >= 500:
                        last_err = RuntimeError(f"OpenAI HTTP {res.status_code}: {res.text[:500]}")
                        continue
                    if res.status_code >= 400:
                        raise RuntimeError(f"OpenAI HTTP {res.status_code}: {res.text[:800]}")
                    data = res.json()
                    content = (data.get("choices") or [{}])[0].get("message", {}).get("content") or ""
                    if not content:
                        raise RuntimeError("Empty OpenAI response")
                    return ChatResult(
                        content=content,
                        model=str(data.get("model") or model),
                        usage=_openai_usage(data.get("usage")),
                        latency_ms=int((time.time() - started) * 1000),
                        provider=self.id,
                        retries=retries,
                    )
                except (httpx.TimeoutException, httpx.TransportError) as exc:
                    last_err = exc
                    continue
        raise last_err or RuntimeError("OpenAI request failed")


class AnthropicProvider:
    id = "anthropic"

    def __init__(self, api_key: str, max_retries: int = 2, timeout: float = 120.0):
        self.api_key = api_key
        self.max_retries = max_retries
        self.timeout = timeout

    def complete(
        self,
        *,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.1,
        json_object: bool = False,
    ) -> ChatResult:
        system_parts = [m["content"] for m in messages if m.get("role") == "system"]
        system = "\n\n".join(system_parts)
        if json_object:
            system = (
                f"{system}\n\nRespond with a single JSON object only. No markdown fences."
                if system
                else "Respond with a single JSON object only. No markdown fences."
            )

        normalized: List[Dict[str, str]] = []
        for m in messages:
            role = m.get("role")
            if role not in ("user", "assistant"):
                continue
            if normalized and normalized[-1]["role"] == role:
                normalized[-1]["content"] += "\n\n" + m["content"]
            else:
                normalized.append({"role": role, "content": m["content"]})
        if not normalized:
            raise RuntimeError("Anthropic requires at least one user message")
        if normalized[0]["role"] != "user":
            normalized.insert(0, {"role": "user", "content": "(continue)"})

        body: Dict[str, Any] = {
            "model": model,
            "max_tokens": 4096,
            "temperature": temperature,
            "messages": normalized,
        }
        if system:
            body["system"] = system

        started = time.time()
        last_err: Optional[Exception] = None
        retries = 0

        with httpx.Client(timeout=self.timeout) as client:
            for attempt in range(self.max_retries + 1):
                if attempt > 0:
                    retries = attempt
                    _sleep_backoff(attempt)
                try:
                    res = client.post(
                        "https://api.anthropic.com/v1/messages",
                        headers={
                            "x-api-key": self.api_key,
                            "anthropic-version": "2023-06-01",
                            "Content-Type": "application/json",
                        },
                        json=body,
                    )
                    if res.status_code in (429,) or res.status_code >= 500:
                        last_err = RuntimeError(f"Anthropic HTTP {res.status_code}: {res.text[:500]}")
                        continue
                    if res.status_code >= 400:
                        raise RuntimeError(f"Anthropic HTTP {res.status_code}: {res.text[:800]}")
                    data = res.json()
                    blocks = data.get("content") or []
                    text = "".join(
                        b.get("text", "") for b in blocks if isinstance(b, dict) and b.get("type") == "text"
                    )
                    if not text:
                        raise RuntimeError("Empty Anthropic response")
                    return ChatResult(
                        content=text,
                        model=str(data.get("model") or model),
                        usage=_anthropic_usage(data.get("usage")),
                        latency_ms=int((time.time() - started) * 1000),
                        provider=self.id,
                        retries=retries,
                    )
                except (httpx.TimeoutException, httpx.TransportError) as exc:
                    last_err = exc
                    continue
        raise last_err or RuntimeError("Anthropic request failed")


def create_provider(provider_id: str, api_key: str, max_retries: int = 2):
    if provider_id == "openai":
        return OpenAIProvider(api_key, max_retries=max_retries)
    if provider_id == "anthropic":
        return AnthropicProvider(api_key, max_retries=max_retries)
    raise ValueError(f"Unknown provider: {provider_id}")


def add_usage(a: TokenUsage, b: TokenUsage) -> TokenUsage:
    def _sum(x: Optional[int], y: Optional[int]) -> Optional[int]:
        if x is None and y is None:
            return None
        return (x or 0) + (y or 0)

    return TokenUsage(
        input_tokens=_sum(a.input_tokens, b.input_tokens),
        output_tokens=_sum(a.output_tokens, b.output_tokens),
        cached_input_tokens=_sum(a.cached_input_tokens, b.cached_input_tokens),
        cache_write_tokens=_sum(a.cache_write_tokens, b.cache_write_tokens),
        reasoning_tokens=_sum(a.reasoning_tokens, b.reasoning_tokens),
        total_tokens=_sum(a.total_tokens, b.total_tokens),
    )
