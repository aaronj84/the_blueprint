#!/usr/bin/env bash
# Convenience wrapper around the Explore LLM benchmark.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PY="${ROOT}/benchmark/.venv/bin/python"
if [[ ! -x "$PY" ]]; then
  echo "Create the venv first:" >&2
  echo "  python3 -m venv benchmark/.venv && benchmark/.venv/bin/pip install -r benchmark/requirements.txt" >&2
  exit 1
fi
exec "$PY" -m benchmark "$@"
