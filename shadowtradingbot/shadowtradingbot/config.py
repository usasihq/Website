"""Environment configuration. Secrets are read, never logged."""

from __future__ import annotations

import os
import re
import stat
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path

from shadowtradingbot.errors import ConfigError
from shadowtradingbot.safety import Limits, resolve_limits

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SYMBOL_RE = re.compile(r"^[A-Z0-9]{2,15}-USD$")


def project_root() -> Path:
    return PROJECT_ROOT


def load_local_env(path: Path | None = None) -> None:
    """Load KEY=value lines into the environment without overriding exports.

    Existing variables win, so a stale file cannot hide a shell export.
    Values are never printed.
    """
    env_path = path if path is not None else project_root() / ".env"
    if not env_path.exists():
        return
    _warn_if_shared(env_path)
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if not key or not key.replace("_", "").isalnum():
            continue
        os.environ.setdefault(key, value.strip().strip("'\""))


def _warn_if_shared(path: Path) -> None:
    try:
        mode = stat.S_IMODE(path.stat().st_mode)
    except OSError:
        return
    if mode & 0o077:
        print(
            f"warning: {path} is readable by other users. Run: chmod 600 {path}",
            flush=True,
        )


def _decimal_env(name: str, default: str) -> Decimal:
    raw = os.environ.get(name, default).strip()
    try:
        return Decimal(raw)
    except InvalidOperation as exc:
        raise ConfigError(f"{name}={raw!r} is not a decimal") from exc


def _int_env(name: str, default: int) -> int:
    raw = os.environ.get(name, str(default)).strip()
    try:
        return int(raw)
    except ValueError as exc:
        raise ConfigError(f"{name}={raw!r} is not an integer") from exc


@dataclass(frozen=True)
class Config:
    symbol: str
    mode: str
    confirmed: bool
    demo: bool
    quote_source: str
    limits: Limits
    dip_pct: Decimal
    take_profit_pct: Decimal
    window: int
    interval_seconds: float
    ticks: int | None
    journal_path: Path
    state_path: Path
    paper_cash: Decimal
    fee_ratio: Decimal

    @property
    def paper(self) -> bool:
        return self.mode == "paper"


def build_config(
    *,
    live: bool,
    confirmed: bool,
    demo: bool,
    quotes: bool,
    symbol: str | None,
    interval: float | None,
    ticks: int | None,
    command: str | None = None,
) -> Config:
    """Build a config. Live trading and live cancel both require --confirm."""
    trading = command is None
    cancelling = command == "cancel-all"
    if live and not confirmed and (trading or cancelling):
        raise ConfigError(
            "Refusing to trade live. Paper mode is the default. "
            "To send real orders, run: python bot.py --live --confirm"
        )
    if demo and quotes:
        raise ConfigError("choose either --demo or --quotes, not both")
    if live and demo and trading:
        raise ConfigError("the demo tape cannot place live orders")
    if live and confirmed:
        mode = "live"
        quote_source = "robinhood"
    else:
        mode = "paper"
        if demo:
            quote_source = "demo"
        elif quotes:
            quote_source = "robinhood"
        else:
            quote_source = "auto"

    chosen = (symbol or os.environ.get("SHADOW_SYMBOL", "BTC-USD")).strip().upper()
    if not SYMBOL_RE.match(chosen):
        raise ConfigError(f"symbol {chosen!r} must look like BTC-USD")

    limits = resolve_limits(
        _decimal_env("SHADOW_MAX_NOTIONAL_USD", "1"),
        _int_env("SHADOW_MAX_POSITIONS", 1),
        _decimal_env("SHADOW_DAILY_LOSS_USD", "0.50"),
    )
    dip = _decimal_env("SHADOW_DIP_PCT", "0.01")
    take_profit = _decimal_env("SHADOW_TAKE_PROFIT_PCT", "0.015")
    window = _int_env("SHADOW_WINDOW", 20)
    if dip <= 0 or dip >= 1:
        raise ConfigError("SHADOW_DIP_PCT must be between 0 and 1")
    if take_profit <= 0 or take_profit >= 1:
        raise ConfigError("SHADOW_TAKE_PROFIT_PCT must be between 0 and 1")
    if window < 2:
        raise ConfigError("SHADOW_WINDOW must be at least 2")

    if interval is None:
        interval = float(os.environ.get("SHADOW_INTERVAL_SECONDS", "30"))
    if interval < 0:
        raise ConfigError("interval must be >= 0")
    if ticks is not None and ticks < 1:
        raise ConfigError("--ticks must be at least 1")

    journal = Path(os.environ.get("SHADOW_JOURNAL", project_root() / "logs" / "journal.jsonl"))
    state = Path(
        os.environ.get(
            "SHADOW_STATE",
            project_root() / "logs" / f"{mode}-state.json",
        )
    )
    paper_cash = _decimal_env("SHADOW_PAPER_CASH", "10")
    if paper_cash <= 0:
        raise ConfigError("SHADOW_PAPER_CASH must be positive")
    fee_ratio = _decimal_env("SHADOW_FEE_RATIO", "0")
    if fee_ratio < 0 or fee_ratio >= 1:
        raise ConfigError("SHADOW_FEE_RATIO must be in [0, 1)")

    return Config(
        symbol=chosen,
        mode=mode,
        confirmed=confirmed,
        demo=quote_source == "demo",
        quote_source=quote_source,
        limits=limits,
        dip_pct=dip,
        take_profit_pct=take_profit,
        window=window,
        interval_seconds=interval,
        ticks=ticks,
        journal_path=journal,
        state_path=state,
        paper_cash=paper_cash,
        fee_ratio=fee_ratio,
    )
