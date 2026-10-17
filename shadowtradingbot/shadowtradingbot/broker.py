"""Paper broker and the live pyhood broker.

Paper mode never calls `place_order`. Live mode does, only after the
safety checks, and only for a quantity that rounds down to the cash cap.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal

from shadowtradingbot.errors import (
    APIError,
    AuthError,
    ConfigError,
    InsufficientFundsError,
    SafetyError,
    is_insufficient_funds,
)
from shadowtradingbot.models import Fill, PendingOrder, Position, Quote, dec_str
from shadowtradingbot.safety import (
    HARD_MAX_NOTIONAL_USD,
    Limits,
    assert_buy_allowed,
    assert_sell_allowed,
    size_market_buy,
)
from shadowtradingbot.state import Store

# Market buys can fill a little through the ask we just saw. Size off a
# worse price so the estimated cash commitment stays inside the cap.
LIVE_SLIPPAGE_BUFFER = Decimal("0.005")
OPEN_STATES = {
    "open",
    "pending",
    "queued",
    "partially_filled",
    "unconfirmed",
    "new",
    "confirmed",
}
FAILED_STATES = {"canceled", "cancelled", "failed", "rejected", "expired"}
DEFAULT_INCREMENT = Decimal("0.00000001")


@dataclass(frozen=True)
class OrderOutcome:
    fill: Fill | None = None
    pending: PendingOrder | None = None
    note: str = ""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _status(order) -> str:
    return str(getattr(order, "status", "") or "").lower()


def _dec(value, default: str = "0") -> Decimal:
    if value is None or value == "":
        return Decimal(default)
    return Decimal(str(value))


class PaperBroker:
    """Simulated cash and instant fills. `place_order_calls` stays at zero."""

    def __init__(
        self,
        feed,
        store: Store,
        limits: Limits,
        fee_ratio: Decimal,
        buying_power_fn=None,
        buying_power_source: str = "simulated",
    ):
        self.feed = feed
        self.store = store
        self.limits = limits
        self.fee_ratio = fee_ratio
        self.increment = DEFAULT_INCREMENT
        self.place_order_calls = 0
        self._buying_power_fn = buying_power_fn
        self._buying_power_source = buying_power_source

    def describe(self) -> str:
        return f"paper ({self._buying_power_source} buying power)"

    def next_quote(self) -> Quote:
        return self.feed.next_quote()

    def buying_power(self) -> Decimal:
        if self._buying_power_fn is not None:
            live_power = Decimal(str(self._buying_power_fn()))
            return min(live_power, self.store.paper_cash)
        return self.store.paper_cash

    def preflight(self) -> str:
        if self._buying_power_fn is not None:
            live_power = Decimal(str(self._buying_power_fn()))
            return (
                f"paper mode, live quotes. Account buying power ${live_power}. "
                f"Simulated cash ${self.store.paper_cash}. No orders will be sent."
            )
        return (
            f"paper buying power ${self.store.paper_cash} "
            f"({self._buying_power_source}; no orders will be sent)"
        )

    def submit_buy(self, quote: Quote) -> OrderOutcome:
        self._require_flat()
        quantity, notional, fee = size_market_buy(
            self.limits.max_notional,
            quote.ask,
            self.increment,
            self.fee_ratio,
        )
        cash = notional + fee
        assert_buy_allowed(
            notional=notional,
            buying_power=self.buying_power(),
            open_positions=self.store.open_positions(),
            realized_pnl=self.store.realized_pnl,
            limits=self.limits,
            killed=self.store.killed,
        )
        if self.buying_power() < cash:
            raise InsufficientFundsError(
                f"buying power {self.buying_power()} cannot cover {cash} including fee"
            )
        fill = Fill(
            side="buy",
            symbol=quote.symbol,
            quantity=quantity,
            price=quote.ask,
            notional=notional,
            fee=fee,
            order_id=f"paper-{uuid.uuid4()}",
            status="simulated_fill",
            paper=True,
        )
        self._open_position(fill)
        self.store.paper_cash -= cash
        return OrderOutcome(fill=fill, note="paper fill at the ask; no order was sent")

    def submit_sell(self, quote: Quote) -> OrderOutcome:
        position = self.store.position
        assert_sell_allowed(position, position.quantity if position else Decimal("0"))
        assert position is not None
        proceeds = position.quantity * quote.bid
        fee = proceeds * self.fee_ratio
        credit = proceeds - fee
        pnl = credit - position.cost_basis
        fill = Fill(
            side="sell",
            symbol=quote.symbol,
            quantity=position.quantity,
            price=quote.bid,
            notional=proceeds,
            fee=fee,
            order_id=f"paper-{uuid.uuid4()}",
            status="simulated_fill",
            paper=True,
        )
        self.store.paper_cash += credit
        self.store.realized_pnl += pnl
        self.store.position = None
        self.store.pending = None
        self._trip_if_lost("daily realized loss reached the kill switch")
        return OrderOutcome(fill=fill, note=f"paper fill at the bid; realized pnl {dec_str(pnl)}")

    def refresh(self) -> OrderOutcome:
        return OrderOutcome()

    def cancel_all(self) -> list[dict]:
        return []

    def _require_flat(self) -> None:
        if self.store.open_positions() >= self.limits.max_positions:
            from shadowtradingbot.errors import PositionLimitError

            raise PositionLimitError("already at the position limit")

    def _open_position(self, fill: Fill) -> None:
        self.store.position = Position(
            symbol=fill.symbol,
            quantity=fill.quantity,
            entry_price=fill.price,
            cost_basis=fill.notional + fill.fee,
            opened_at=_now(),
            order_id=fill.order_id,
        )
        self.store.pending = None

    def _trip_if_lost(self, reason: str) -> None:
        if self.store.realized_pnl <= -self.limits.daily_loss:
            self.store.killed = True
            self.store.kill_reason = reason


class LiveBroker:
    """Official Crypto Trading API through pyhood's CryptoClient."""

    def __init__(self, client, store: Store, limits: Limits, symbol: str):
        self.client = client
        self.store = store
        self.limits = limits
        self.symbol = symbol
        self.fee_ratio = store.fee_ratio
        self.increment = DEFAULT_INCREMENT
        self.min_order_size = Decimal("0")
        self.account_number = ""
        self.api_tradable = False
        self.place_order_calls = 0

    def describe(self) -> str:
        return "live (real orders)"

    @classmethod
    def connect(cls, store: Store, limits: Limits, symbol: str) -> "LiveBroker":
        try:
            from pyhood.crypto import CryptoClient
        except ImportError as exc:
            raise ConfigError(
                "pyhood is not installed. From this directory run: "
                "python -m pip install -r requirements.txt"
            ) from exc
        try:
            client = CryptoClient()
        except FileNotFoundError as exc:
            raise ConfigError(str(exc)) from exc
        except AuthError as exc:
            raise ConfigError(
                "Could not sign with the Crypto API key. Check RH_CRYPTO_API_KEY and "
                "RH_CRYPTO_PRIVATE_KEY, or run `pyhood setup crypto`. "
                "Environment variables override ~/.pyhood/crypto.env."
            ) from exc
        return cls(client, store, limits, symbol)

    def next_quote(self) -> Quote:
        from shadowtradingbot.feeds import RobinhoodFeed

        return RobinhoodFeed(self.client, self.symbol).next_quote()

    def buying_power(self) -> Decimal:
        account = self.client.get_account()
        self._remember_account(account)
        return _dec(account.buying_power)

    def preflight(self) -> str:
        account = self.client.get_account()
        self._remember_account(account)
        self._load_pair()
        if not self.api_tradable:
            raise ConfigError(
                "This crypto account is not marked API-tradable. "
                "Enable trading on the API key before using --live."
            )
        return (
            f"account {self.account_number} buying power ${account.buying_power} "
            f"fee ratio {self.fee_ratio} api_tradable={self.api_tradable}"
        )

    def submit_buy(self, quote: Quote) -> OrderOutcome:
        if self.store.open_positions() >= self.limits.max_positions:
            from shadowtradingbot.errors import PositionLimitError

            raise PositionLimitError("already at the position limit")
        if self._held_by_someone_else(quote.symbol):
            raise SafetyError(
                f"the account already holds {quote.symbol.split('-', 1)[0]}. "
                "This bot will not add to a position it did not open, and it will "
                "not sell coins it does not have in its state file."
            )
        self._load_pair()
        buffered_ask = quote.ask * (Decimal("1") + LIVE_SLIPPAGE_BUFFER)
        quantity, notional, fee = size_market_buy(
            self.limits.max_notional,
            buffered_ask,
            self.increment,
            self.fee_ratio,
        )
        if self.min_order_size > 0 and quantity < self.min_order_size:
            raise SafetyError(
                f"sized quantity {dec_str(quantity)} is below the pair minimum "
                f"{dec_str(self.min_order_size)}. Refusing to raise the order above ${HARD_MAX_NOTIONAL_USD}."
            )
        buying_power = self.buying_power()
        assert_buy_allowed(
            notional=notional,
            buying_power=buying_power,
            open_positions=self.store.open_positions(),
            realized_pnl=self.store.realized_pnl,
            limits=self.limits,
            killed=self.store.killed,
        )
        if buying_power < notional + fee:
            raise InsufficientFundsError(
                f"buying power {buying_power} cannot cover {notional + fee} including the estimated fee"
            )
        outcome = self._place(
            side="buy",
            symbol=quote.symbol,
            quantity=quantity,
            requested_notional=notional,
            fallback_price=quote.ask,
        )
        self._apply(outcome)
        return outcome

    def submit_sell(self, quote: Quote) -> OrderOutcome:
        position = self.store.position
        assert_sell_allowed(position, position.quantity if position else Decimal("0"))
        assert position is not None
        # Logged by the engine. A sell is not blocked when buying power is low.
        self.buying_power()
        self._load_pair()
        quantity = position.quantity
        if self.increment > 0:
            from shadowtradingbot.safety import floor_to_increment

            quantity = floor_to_increment(quantity, self.increment)
        assert_sell_allowed(position, quantity)
        outcome = self._place(
            side="sell",
            symbol=quote.symbol,
            quantity=quantity,
            requested_notional=quantity * quote.bid,
            fallback_price=quote.bid,
        )
        self._apply(outcome)
        return outcome

    def refresh(self) -> OrderOutcome:
        pending = self.store.pending
        if pending is None or not self.account_number:
            return OrderOutcome()
        order = self.client.get_order(self.account_number, pending.order_id)
        outcome = self._outcome_from_order(
            order,
            side=pending.side,
            requested_notional=pending.requested_notional,
            fallback_price=Decimal("0"),
        )
        self._apply(outcome, previous=pending)
        return outcome

    def cancel_all(self) -> list[dict]:
        if not self.account_number:
            self.preflight()
        cancelled = []
        for order in self.client.get_orders(self.account_number):
            if _status(order) not in OPEN_STATES:
                continue
            self.client.cancel_order(order.order_id)
            cancelled.append(
                {
                    "order_id": order.order_id,
                    "symbol": getattr(order, "symbol", ""),
                    "side": getattr(order, "side", ""),
                    "status": "cancel_requested",
                }
            )
        return cancelled

    def _place(
        self,
        *,
        side: str,
        symbol: str,
        quantity: Decimal,
        requested_notional: Decimal,
        fallback_price: Decimal,
    ) -> OrderOutcome:
        if not self.account_number:
            self.buying_power()
        try:
            self.place_order_calls += 1
            order = self.client.place_order(
                account_number=self.account_number,
                side=side,
                order_type="market",
                symbol=symbol,
                order_config={"asset_quantity": dec_str(quantity)},
                client_order_id=str(uuid.uuid4()),
            )
        except APIError as exc:
            if is_insufficient_funds(exc):
                raise InsufficientFundsError(str(exc)) from exc
            raise
        return self._outcome_from_order(
            order,
            side=side,
            requested_notional=requested_notional,
            fallback_price=fallback_price,
        )

    def _outcome_from_order(
        self,
        order,
        *,
        side: str,
        requested_notional: Decimal,
        fallback_price: Decimal,
    ) -> OrderOutcome:
        status = _status(order)
        filled_qty = _dec(getattr(order, "filled_quantity", 0))
        price = _dec(getattr(order, "average_filled_price", None), "0")
        if price <= 0:
            price = fallback_price
        fee = getattr(order, "fee", None)
        fee_dec = _dec(fee) if fee is not None else (filled_qty * price * self.fee_ratio)
        notional = filled_qty * price
        pending = PendingOrder(
            order_id=str(getattr(order, "order_id", "") or ""),
            side=side,
            symbol=str(getattr(order, "symbol", self.symbol) or self.symbol),
            quantity=_dec(getattr(order, "quantity", None), dec_str(filled_qty)),
            requested_notional=requested_notional,
        )
        done = status == "filled" or (filled_qty > 0 and status in FAILED_STATES)
        if status == "filled" or (done and filled_qty > 0):
            fill = Fill(
                side=side,
                symbol=pending.symbol,
                quantity=filled_qty if filled_qty > 0 else pending.quantity,
                price=price,
                notional=notional if notional > 0 else filled_qty * price,
                fee=fee_dec,
                order_id=pending.order_id,
                status=status or "filled",
                paper=False,
            )
            if fill.quantity <= 0:
                fill = Fill(
                    side=side,
                    symbol=pending.symbol,
                    quantity=pending.quantity,
                    price=price,
                    notional=pending.quantity * price,
                    fee=fee_dec,
                    order_id=pending.order_id,
                    status=status or "filled",
                    paper=False,
                )
            return OrderOutcome(fill=fill, pending=None, note=f"exchange status {status}")
        if status in FAILED_STATES and filled_qty <= 0:
            return OrderOutcome(note=f"order {pending.order_id} {status}")
        return OrderOutcome(pending=pending, note=f"order working ({status or 'open'})")

    def _apply(self, outcome: OrderOutcome, previous: PendingOrder | None = None) -> None:
        if outcome.fill is None and outcome.pending is None:
            if previous is not None and outcome.note:
                self.store.pending = None
            return
        if outcome.pending is not None and outcome.fill is None:
            self.store.pending = outcome.pending
            return
        fill = outcome.fill
        if fill is None:
            return
        if fill.side == "buy":
            cost = fill.notional + fill.fee
            self.store.position = Position(
                symbol=fill.symbol,
                quantity=fill.quantity,
                entry_price=fill.price if fill.price > 0 else Decimal("0"),
                cost_basis=cost if cost > 0 else fill.notional,
                opened_at=_now(),
                order_id=fill.order_id,
            )
            self.store.pending = None
            if cost > HARD_MAX_NOTIONAL_USD:
                self.store.killed = True
                self.store.kill_reason = "a fill exceeded the $1 cash cap; buying is stopped"
            return
        position = self.store.position
        credit = fill.notional - fill.fee
        cost_basis = position.cost_basis if position is not None else Decimal("0")
        if position is not None and fill.quantity < position.quantity and position.quantity > 0:
            sold = fill.quantity / position.quantity
            self.store.realized_pnl += credit - (cost_basis * sold)
            self.store.position = Position(
                symbol=position.symbol,
                quantity=position.quantity - fill.quantity,
                entry_price=position.entry_price,
                cost_basis=cost_basis * (Decimal("1") - sold),
                opened_at=position.opened_at,
                order_id=position.order_id,
            )
            self.store.pending = None
        else:
            self.store.realized_pnl += credit - cost_basis
            self.store.position = None
            self.store.pending = None
        self._trip_if_lost("daily realized loss reached the kill switch")

    def _trip_if_lost(self, reason: str) -> None:
        if self.store.realized_pnl <= -self.limits.daily_loss:
            self.store.killed = True
            self.store.kill_reason = reason

    def _remember_account(self, account) -> None:
        self.account_number = str(account.account_number)
        self.api_tradable = bool(getattr(account, "api_tradable", False))
        ratio = _dec(getattr(account, "fee_ratio", 0))
        if ratio >= 0:
            self.fee_ratio = ratio
            self.store.fee_ratio = ratio

    def _load_pair(self) -> None:
        try:
            pairs = self.client.get_trading_pairs(self.symbol)
        except APIError as exc:
            print(
                f"warning: could not read pair limits for {self.symbol} ({exc}). "
                "The order is still capped at $1.",
                flush=True,
            )
            return
        match = next((pair for pair in pairs if getattr(pair, "symbol", None) == self.symbol), None)
        if match is None:
            print(
                f"warning: {self.symbol} was not in the trading-pair list. "
                "The order is still capped at $1 and will be rejected by the exchange if the pair is not API-tradable.",
                flush=True,
            )
            return
        if hasattr(match, "api_tradable") and not match.api_tradable:
            raise SafetyError(f"{self.symbol} is not API-tradable. The order was not sent.")
        increment = _dec(getattr(match, "quantity_increment", 0))
        if increment > 0:
            self.increment = increment
        self.min_order_size = _dec(getattr(match, "min_order_size", 0))

    def _held_by_someone_else(self, symbol: str) -> bool:
        """True when the account holds the asset and this bot has no position for it."""
        if self.store.position is not None:
            return False
        if not self.account_number:
            self.buying_power()
        asset = symbol.split("-", 1)[0]
        holdings = self.client.get_holdings(self.account_number, asset)
        for holding in holdings:
            if getattr(holding, "asset_code", "") == asset and _dec(holding.quantity) > 0:
                return True
        for order in self.client.get_orders(self.account_number):
            if (
                getattr(order, "symbol", "") == symbol
                and getattr(order, "side", "") == "buy"
                and _status(order) in OPEN_STATES
            ):
                return True
        return False
