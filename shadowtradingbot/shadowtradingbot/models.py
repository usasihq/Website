"""Plain records shared by the strategy, the broker, and the journal."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


def dec_str(value: Decimal) -> str:
    """Fixed-point string. No scientific notation, no trailing zeros."""
    text = format(value, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text or "0"


@dataclass(frozen=True)
class Quote:
    """Best bid and ask for one symbol. `mid` is the signal price."""

    symbol: str
    bid: Decimal
    ask: Decimal
    timestamp: datetime

    @property
    def mid(self) -> Decimal:
        return (self.bid + self.ask) / Decimal("2")

    @property
    def spread_fraction(self) -> Decimal:
        if self.mid <= 0:
            return Decimal("1")
        return (self.ask - self.bid) / self.mid


@dataclass(frozen=True)
class Position:
    """A position this bot opened. Manual holdings are never sold."""

    symbol: str
    quantity: Decimal
    entry_price: Decimal
    cost_basis: Decimal
    opened_at: str
    order_id: str


@dataclass(frozen=True)
class PendingOrder:
    """A live order that has been sent and is not filled yet."""

    order_id: str
    side: str
    symbol: str
    quantity: Decimal
    requested_notional: Decimal


@dataclass(frozen=True)
class Fill:
    """A completed (or simulated) order. Cash figures are positive amounts."""

    side: str
    symbol: str
    quantity: Decimal
    price: Decimal
    notional: Decimal
    fee: Decimal
    order_id: str
    status: str
    paper: bool


@dataclass(frozen=True)
class Decision:
    """What the strategy wants on this tick, and the numbers behind it."""

    action: str
    reason: str
    mid: Decimal
    average: Decimal | None = None
    entry: Decimal | None = None
    target: Decimal | None = None
