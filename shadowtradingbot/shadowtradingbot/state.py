"""Local bot state. This file is how the kill switch survives a restart."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

from shadowtradingbot.errors import ConfigError
from shadowtradingbot.models import PendingOrder, Position

VERSION = 1


def utc_day() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _dec(value: str | None, default: str = "0") -> Decimal:
    return Decimal(value if value not in (None, "") else default)


@dataclass
class Store:
    path: Path
    day: str
    realized_pnl: Decimal
    killed: bool
    kill_reason: str | None
    position: Position | None
    pending: PendingOrder | None
    prices: list[Decimal]
    paper_cash: Decimal
    fee_ratio: Decimal = field(default=Decimal("0"))

    def open_positions(self) -> int:
        """A pending buy counts. A pending sell is the exit of the one position."""
        if self.position is not None:
            return 1
        if self.pending is not None and self.pending.side == "buy":
            return 1
        return 0

    def roll_day(self, today: str | None = None) -> bool:
        today = today or utc_day()
        if self.day == today:
            return False
        self.day = today
        self.realized_pnl = Decimal("0")
        self.killed = False
        self.kill_reason = None
        return True

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "version": VERSION,
            "day": self.day,
            "realized_pnl": format(self.realized_pnl, "f"),
            "killed": self.killed,
            "kill_reason": self.kill_reason,
            "position": _position_out(self.position),
            "pending": _pending_out(self.pending),
            "prices": [format(price, "f") for price in self.prices],
            "paper_cash": format(self.paper_cash, "f"),
            "fee_ratio": format(self.fee_ratio, "f"),
        }
        text = json.dumps(payload, indent=2)
        temporary = self.path.with_suffix(self.path.suffix + ".tmp")
        fd = os.open(temporary, os.O_CREAT | os.O_WRONLY | os.O_TRUNC, 0o600)
        try:
            os.write(fd, text.encode("utf-8"))
        finally:
            os.close(fd)
        os.replace(temporary, self.path)

    @classmethod
    def load(cls, path: Path, paper_cash: Decimal) -> "Store":
        if not path.exists():
            return cls(
                path=path,
                day=utc_day(),
                realized_pnl=Decimal("0"),
                killed=False,
                kill_reason=None,
                position=None,
                pending=None,
                prices=[],
                paper_cash=paper_cash,
            )
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ConfigError(f"state file {path} is not valid JSON. Move it aside and restart.") from exc
        if data.get("version") != VERSION:
            raise ConfigError(f"state file {path} has version {data.get('version')}, expected {VERSION}")
        return cls(
            path=path,
            day=str(data.get("day") or utc_day()),
            realized_pnl=_dec(data.get("realized_pnl")),
            killed=bool(data.get("killed")),
            kill_reason=data.get("kill_reason"),
            position=_position_in(data.get("position")),
            pending=_pending_in(data.get("pending")),
            prices=[Decimal(item) for item in data.get("prices") or []],
            paper_cash=_dec(data.get("paper_cash"), format(paper_cash, "f")),
            fee_ratio=_dec(data.get("fee_ratio")),
        )


def _position_out(position: Position | None) -> dict | None:
    if position is None:
        return None
    return {
        "symbol": position.symbol,
        "quantity": format(position.quantity, "f"),
        "entry_price": format(position.entry_price, "f"),
        "cost_basis": format(position.cost_basis, "f"),
        "opened_at": position.opened_at,
        "order_id": position.order_id,
    }


def _position_in(data: dict | None) -> Position | None:
    if not data:
        return None
    return Position(
        symbol=data["symbol"],
        quantity=Decimal(data["quantity"]),
        entry_price=Decimal(data["entry_price"]),
        cost_basis=Decimal(data["cost_basis"]),
        opened_at=data["opened_at"],
        order_id=data.get("order_id", ""),
    )


def _pending_out(pending: PendingOrder | None) -> dict | None:
    if pending is None:
        return None
    return {
        "order_id": pending.order_id,
        "side": pending.side,
        "symbol": pending.symbol,
        "quantity": format(pending.quantity, "f"),
        "requested_notional": format(pending.requested_notional, "f"),
    }


def _pending_in(data: dict | None) -> PendingOrder | None:
    if not data:
        return None
    return PendingOrder(
        order_id=data["order_id"],
        side=data["side"],
        symbol=data["symbol"],
        quantity=Decimal(data["quantity"]),
        requested_notional=Decimal(data["requested_notional"]),
    )
