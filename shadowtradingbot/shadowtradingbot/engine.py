"""One quote, one decision, and at most one order."""

from __future__ import annotations

import time
from collections.abc import Callable
from decimal import Decimal

from shadowtradingbot.config import Config
from shadowtradingbot.errors import (
    APIError,
    AuthError,
    ConfigError,
    InsufficientFundsError,
    KillSwitchError,
    RateLimitError,
    SafetyError,
    classify_error,
    is_insufficient_funds,
)
from shadowtradingbot.journal import Journal
from shadowtradingbot.models import Decision, Fill, Quote, dec_str
from shadowtradingbot.safety import loss_exceeds_budget
from shadowtradingbot.state import Store
from shadowtradingbot.strategy import DipBounceStrategy


def run(
    config: Config,
    broker,
    strategy: DipBounceStrategy,
    journal: Journal,
    store: Store,
    *,
    quote_source: str,
    sleep: Callable[[float], None] = time.sleep,
) -> int:
    """Run until the tick limit, the kill switch, or Ctrl-C. Returns a process code."""
    if quote_source != "demo":
        strategy.restore(store.prices)
    else:
        # The tape starts over each launch. Keeping old mids would skew the average.
        store.prices = []

    print(
        f"Shadowtradingbot {config.mode} {config.symbol} "
        f"cap=${dec_str(config.limits.max_notional)} "
        f"daily-loss=${dec_str(config.limits.daily_loss)} "
        f"quotes={quote_source}",
        flush=True,
    )
    for warning in config.limits.warnings:
        journal.write("warning", message=warning)

    try:
        print(broker.preflight(), flush=True)
    except (AuthError, APIError, ConfigError, SafetyError) as exc:
        return _fail(journal, exc, sleep)

    if store.killed and store.position is None and store.pending is None:
        print(
            f"kill switch is on until the next UTC day ({store.kill_reason or 'daily loss'}).",
            flush=True,
        )
        _print_status(config, store, quote_source)
        return 0

    ticks = 0
    try:
        while config.ticks is None or ticks < config.ticks:
            ticks += 1
            try:
                quote = broker.next_quote()
            except AuthError as exc:
                return _fail(journal, exc, sleep)
            except RateLimitError as exc:
                _pause(journal, exc, sleep)
                continue
            except APIError as exc:
                _record_api(journal, exc)
                _sleep_interval(config, sleep, ticks)
                continue

            if quote.symbol != config.symbol:
                quote = Quote(config.symbol, quote.bid, quote.ask, quote.timestamp)
            journal.write(
                "quote",
                symbol=quote.symbol,
                bid=quote.bid,
                ask=quote.ask,
                mid=quote.mid,
                spread=quote.spread_fraction,
            )
            if store.roll_day():
                journal.write("day_roll", day=store.day)
                print(f"new UTC day {store.day}; daily loss counter reset", flush=True)

            if store.pending is not None:
                _refresh_pending(broker, journal, store, sleep)

            if store.killed and store.position is None and store.pending is None:
                print("kill switch is on. No position left to manage.", flush=True)
                break

            if (
                store.position is not None
                and store.pending is None
                and loss_exceeds_budget(
                    store.position,
                    quote.bid,
                    broker.fee_ratio,
                    store.realized_pnl,
                    config.limits,
                )
            ):
                print("daily loss budget is used up by the open position; selling.", flush=True)
                journal.write("decision", action="sell", reason="daily loss kill switch", mid=quote.mid)
                _try_sell(config, broker, journal, store, quote, sleep)
                store.killed = True
                store.kill_reason = store.kill_reason or "open position marked through the daily loss limit"
                store.prices = strategy.prices()
                store.save()
                break

            decision = strategy.decide(quote, store.position)
            journal.write(
                "decision",
                action=decision.action,
                reason=decision.reason,
                symbol=quote.symbol,
                mid=decision.mid,
                average=decision.average,
                entry=decision.entry,
                target=decision.target,
            )
            print(
                f"{quote.symbol} bid={_px(quote.bid)} ask={_px(quote.ask)} mid={_px(quote.mid)} "
                f"-> {decision.action}: {decision.reason}",
                flush=True,
            )

            if decision.action == "buy":
                spread = quote.spread_fraction
                if spread >= config.take_profit_pct:
                    _block(
                        journal,
                        "spread",
                        (
                            f"spread {spread:.2%} is at least the {config.take_profit_pct:.2%} "
                            "take-profit; not buying"
                        ),
                    )
                else:
                    _try_buy(config, broker, journal, store, quote, sleep)
            elif decision.action == "sell":
                _try_sell(config, broker, journal, store, quote, sleep)

            store.prices = strategy.prices()
            store.save()
            if store.killed and store.position is None and store.pending is None:
                print(f"kill switch tripped: {store.kill_reason}", flush=True)
                break
            _sleep_interval(config, sleep, ticks)
    except _Stop as stop:
        store.save()
        return _fail(journal, stop.cause, sleep)
    except KeyboardInterrupt:
        print("\nstopped. State saved.", flush=True)
        store.prices = strategy.prices()
        store.save()
    _print_status(config, store, quote_source)
    return 0


def _try_buy(config, broker, journal: Journal, store: Store, quote: Quote, sleep) -> None:
    try:
        power = broker.buying_power()
        journal.write("buying_power", buying_power=power, symbol=quote.symbol, side="buy")
        outcome = broker.submit_buy(quote)
    except (SafetyError, InsufficientFundsError) as exc:
        _block(journal, classify_error(exc), str(exc))
        if isinstance(exc, KillSwitchError):
            store.killed = True
            store.kill_reason = str(exc)
        return
    except AuthError as exc:
        raise _Stop(2, exc) from exc
    except RateLimitError as exc:
        _pause(journal, exc, sleep)
        return
    except APIError as exc:
        if is_insufficient_funds(exc):
            _block(journal, "insufficient_funds", str(exc))
            return
        _record_api(journal, exc)
        return
    _log_outcome(journal, outcome)


def _try_sell(config, broker, journal: Journal, store: Store, quote: Quote, sleep) -> None:
    try:
        power = broker.buying_power()
        journal.write("buying_power", buying_power=power, symbol=quote.symbol, side="sell")
        outcome = broker.submit_sell(quote)
    except SafetyError as exc:
        _block(journal, classify_error(exc), str(exc))
        return
    except AuthError as exc:
        raise _Stop(2, exc) from exc
    except RateLimitError as exc:
        _pause(journal, exc, sleep)
        return
    except APIError as exc:
        _record_api(journal, exc)
        return
    _log_outcome(journal, outcome)
    if outcome.fill is not None:
        print(
            f"sold {dec_str(outcome.fill.quantity)} {quote.symbol} "
            f"at {_px(outcome.fill.price)}; daily pnl {dec_str(store.realized_pnl)}",
            flush=True,
        )


def _refresh_pending(broker, journal: Journal, store: Store, sleep) -> None:
    try:
        outcome = broker.refresh()
    except AuthError as exc:
        raise _Stop(2, exc) from exc
    except RateLimitError as exc:
        _pause(journal, exc, sleep)
        return
    except APIError as exc:
        _record_api(journal, exc)
        return
    if outcome.fill is not None or outcome.note:
        journal.write("order_update", note=outcome.note, status=outcome.fill.status if outcome.fill else "pending")
        _log_outcome(journal, outcome)


def _log_outcome(journal: Journal, outcome) -> None:
    fill: Fill | None = outcome.fill
    if fill is not None:
        journal.write(
            "order",
            paper=fill.paper,
            side=fill.side,
            symbol=fill.symbol,
            quantity=fill.quantity,
            price=fill.price,
            notional=fill.notional,
            fee=fill.fee,
            order_id=fill.order_id,
            status=fill.status,
            note=outcome.note,
        )
        print(
            f"{'PAPER' if fill.paper else 'LIVE'} {fill.side} {fill.symbol} "
            f"qty={dec_str(fill.quantity)} price={_px(fill.price)} "
            f"notional={_px(fill.notional)} status={fill.status}",
            flush=True,
        )
    elif outcome.pending is not None:
        journal.write(
            "order",
            paper=False,
            side=outcome.pending.side,
            symbol=outcome.pending.symbol,
            quantity=outcome.pending.quantity,
            notional=outcome.pending.requested_notional,
            order_id=outcome.pending.order_id,
            status="working",
            note=outcome.note,
        )


def _block(journal: Journal, code: str, message: str) -> None:
    journal.write("blocked", code=code, message=message)
    print(f"blocked ({code}): {message}", flush=True)


def _record_api(journal: Journal, exc: APIError) -> None:
    journal.write("error", code=classify_error(exc), message=str(exc))
    print(f"api error: {exc}", flush=True)


def _pause(journal: Journal, exc: RateLimitError, sleep: Callable[[float], None]) -> None:
    wait = float(exc.retry_after or 60)
    wait = min(max(wait, 1), 120)
    journal.write("error", code="rate_limit", message=str(exc), retry_after=wait)
    print(f"rate limited. Waiting {wait:.0f}s before the next request.", flush=True)
    sleep(wait)


def _fail(journal: Journal, exc: BaseException, sleep: Callable[[float], None]) -> int:
    del sleep
    journal.write("error", code=classify_error(exc), message=str(exc))
    print(f"stopped: {exc}", flush=True)
    if isinstance(exc, AuthError) or classify_error(exc) == "auth":
        print(
            "Auth failed. Check the API key and private key. A burst of HTTP 401s can also "
            "be throttling, so wait before trying again. Nothing was retried automatically.",
            flush=True,
        )
        return 2
    return 1


def _sleep_interval(config: Config, sleep: Callable[[float], None], ticks: int) -> None:
    if config.ticks is not None and ticks >= config.ticks:
        return
    if config.interval_seconds:
        sleep(config.interval_seconds)


def _px(value: Decimal) -> str:
    return dec_str(value)


def _print_status(config: Config, store: Store, quote_source: str) -> None:
    position = "none"
    if store.position is not None:
        position = (
            f"{dec_str(store.position.quantity)} {store.position.symbol} "
            f"entry {_px(store.position.entry_price)} cost {_px(store.position.cost_basis)}"
        )
    pending = "none" if store.pending is None else f"{store.pending.side} {store.pending.order_id}"
    print(
        "\n".join(
            [
                "Shadowtradingbot status",
                f"  mode: {config.mode}",
                f"  quotes: {quote_source}",
                f"  symbol: {config.symbol}",
                f"  utc day: {store.day}",
                f"  position: {position}",
                f"  pending: {pending}",
                f"  paper cash: {_px(store.paper_cash)}",
                f"  daily realized pnl: {_px(store.realized_pnl)}",
                f"  kill switch: {'ON' if store.killed else 'off'}"
                + (f" ({store.kill_reason})" if store.kill_reason else ""),
                f"  journal: {config.journal_path}",
                f"  state: {config.state_path}",
            ]
        ),
        flush=True,
    )


class _Stop(Exception):
    """Auth failure raised out of a nested order attempt."""

    def __init__(self, code: int, cause: BaseException):
        super().__init__(str(cause))
        self.code = code
        self.cause = cause
