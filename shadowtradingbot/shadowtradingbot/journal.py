"""Append-only JSONL journal. Secrets are stripped before anything is written."""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

_SECRET = re.compile(
    r"(rh-api-[0-9a-fA-F-]{8,})|((?:api[_-]?key|private[_-]?key|signature)\s*[=:]\s*)(\S+)",
    re.IGNORECASE,
)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _scrub(value: Any) -> Any:
    if isinstance(value, Decimal):
        return format(value, "f")
    if isinstance(value, dict):
        return {str(k): _scrub(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_scrub(v) for v in value]
    if isinstance(value, str):
        return _SECRET.sub(
            lambda match: match.group(1) and "rh-api-redacted" or f"{match.group(2)}redacted",
            value,
        )
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    return _scrub(str(value))


class Journal:
    """One JSON object per line. The file is created owner-read/write only."""

    def __init__(self, path: Path, mode: str):
        self.path = path
        self.mode = mode
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            fd = os.open(self.path, os.O_CREAT | os.O_APPEND | os.O_WRONLY, 0o600)
            os.close(fd)

    def write(self, kind: str, **fields: Any) -> dict[str, Any]:
        record = _scrub({"ts": _now(), "kind": kind, "mode": self.mode, **fields})
        line = json.dumps(record, separators=(",", ":"), default=str)
        fd = os.open(self.path, os.O_APPEND | os.O_WRONLY, 0o600)
        try:
            os.write(fd, (line + "\n").encode("utf-8"))
        finally:
            os.close(fd)
        return record
