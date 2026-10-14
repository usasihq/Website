"""Hard limits. Configuration may only make these stricter.

The ceilings live in code so an environment variable cannot raise the
bot from a $1 experiment to a real-size order.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_DOWN, Decimal

from shadowtradingbot.errors import (
    InsufficientFundsError,
    KillSwitchError,
    NotionalLimitError,
    PositionLimitError,
)
from shadowtradingbot.models import Position

# Absolute ceilings. Do not raise these to "test a little more".
HARD_MAX_NOTIONAL_USD = Decimal("1.00")
HARD_MAX_OPEN_POSITIONS = 1
HARD_MAX_DAILY_LOSS_USD = Decimal("0.50")


@dataclass(frozen=True)
class Limits:
    max_notional: Decimal
    max_positions: int
    daily_loss: Decimal
    warnings: tuple[str, ...]


def _positive(name: str, value: Decimal) -> Decimal:
    if value <= 0:
        raise NotionalLimitError(f"{name} must be positive, got {value}")
    return value


def resolve_limits(
    max_notional: Decimal,
    max_positions: int,
    daily_loss: Decimal,
) -> Limits:
    """Clamp user-supplied limits down to the hard ceilings."""
    warnings: list[str] = []
    notional = _positive("max notional", max_notional)
    loss = _positive("daily loss limit", daily_loss)
    if max_positions < 1:
        raise PositionLimitError("max positions must be at least 1")

    if notional > HARD_MAX_NOTIONAL_USD:
        warnings.append(
            f"SHADOW_MAX_NOTIONAL_USD={notional} exceeds the hard cap; using {HARD_MAX_NOTIONAL_USD}"
        )
        notional = HARD_MAX_NOTIONAL_USD
    if loss > HARD_MAX_DAILY_LOSS_USD:
        warnings.append(
            f"SHADOW_DAILY_LOSS_USD={loss} exceeds the hard cap; using {HARD_MAX_DAILY_LOSS_USD}"
        )
        loss = HARD_MAX_DAILY_LOSS_USD
    if max_positions > HARD_MAX_OPEN_POSITIONS:
        warnings.append(
            f"max positions {max_positions} exceeds the hard cap; using {HARD_MAX_OPEN_POSITIONS}"
        )
        max_positions = HARD_MAX_OPEN_POSITIONS
    return Limits(notional, max_positions, loss, tuple(warnings))


def floor_to_increment(amount: Decimal, increment: Decimal) -> Decimal:
    """Round down so a buy cannot step over the cash cap."""
    if increment <= 0:
        raise NotionalLimitError("quantity increment must be positive")
    steps = (amount / increment).to_integral_value(rounding=ROUND_DOWN)
    return steps * increment


def size_market_buy(
    cash_cap: Decimal,
    ask: Decimal,
    increment: Decimal,
    fee_ratio: Decimal,
) -> tuple[Decimal, Decimal, Decimal]:
    """Size a buy so notional + estimated fee never exceeds `cash_cap`.

    Returns (quantity, asset_notional, fee). Quantity is floored to the
    pair increment. Market orders on this API are sized in asset quantity,
    not dollars, so the dollar amount is converted here and rounded down.
    """
    if ask <= 0:
        raise NotionalLimitError("ask must be positive to size a buy")
    if fee_ratio < 0:
        raise NotionalLimitError("fee ratio cannot be negative")
    cap = min(_positive("cash cap", cash_cap), HARD_MAX_NOTIONAL_USD)
    unit_cost = ask * (Decimal("1") + fee_ratio)
    quantity = floor_to_increment(cap / unit_cost, increment)
    if quantity <= 0:
        raise NotionalLimitError(
            f"A ${cap} cap cannot buy one increment ({increment}) at ask {ask}."
        )
    notional = quantity * ask
    fee = notional * fee_ratio
    if notional + fee > cap:
        quantity -= increment
        if quantity <= 0:
            raise NotionalLimitError("rounding would exceed the cash cap")
        notional = quantity * ask
        fee = notional * fee_ratio
    if notional > HARD_MAX_NOTIONAL_USD or notional + fee > cap:
        raise NotionalLimitError("sized order still exceeds the cash cap")
    return quantity, notional, fee


def assert_buy_allowed(
    *,
    notional: Decimal,
    buying_power: Decimal,
    open_positions: int,
    realized_pnl: Decimal,
    limits: Limits,
    killed: bool,
) -> None:
    """Raise before any order is sent. Call this on every buy."""
    if killed or realized_pnl <= -limits.daily_loss:
        raise KillSwitchError(
            f"daily loss kill switch is on (realized pnl {realized_pnl}, limit -{limits.daily_loss})"
        )
    if open_positions >= limits.max_positions:
        raise PositionLimitError(
            f"already at the position limit ({open_positions}/{limits.max_positions})"
        )
    if notional <= 0 or notional > limits.max_notional:
        raise NotionalLimitError(
            f"notional {notional} is outside (0, {limits.max_notional}]"
        )
    if buying_power < notional:
        raise InsufficientFundsError(
            f"buying power {buying_power} is below order notional {notional}"
        )


def assert_sell_allowed(position: Position | None, quantity: Decimal) -> None:
    """A sell closes the bot's own position. It never opens a short."""
    if position is None or quantity <= 0:
        raise PositionLimitError("no bot position to sell")
    if quantity > position.quantity:
        raise PositionLimitError("refusing to sell more than the bot's position")


def unrealized_pnl(position: Position, bid: Decimal, fee_ratio: Decimal) -> Decimal:
    """Mark to the bid, after the estimated sell fee. This is a loss check."""
    proceeds = position.quantity * bid
    fee = proceeds * fee_ratio
    return proceeds - fee - position.cost_basis


def loss_exceeds_budget(
    position: Position,
    bid: Decimal,
    fee_ratio: Decimal,
    realized_pnl: Decimal,
    limits: Limits,
) -> bool:
    """True when marking the open position would use up today's loss budget."""
    pnl = unrealized_pnl(position, bid, fee_ratio)
    if pnl >= 0:
        return False
    remaining = limits.daily_loss + realized_pnl
    return -pnl >= remaining
