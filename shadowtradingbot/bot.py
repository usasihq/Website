#!/usr/bin/env python3
"""Shadowtradingbot command line.

    python bot.py                 # paper mode, demo tape if no API key
    python bot.py --paper
    python bot.py --live --confirm
    python bot.py status
    python bot.py cancel-all
"""

from __future__ import annotations

import argparse
import os
import sys
from decimal import Decimal

from shadowtradingbot.config import build_config, load_local_env
from shadowtradingbot.engine import _print_status, run
from shadowtradingbot.errors import ConfigError
from shadowtradingbot.journal import Journal
from shadowtradingbot.state import Store
from shadowtradingbot.strategy import DipBounceStrategy


def main(argv: list[str] | None = None) -> int:
    load_local_env()
    parser = argparse.ArgumentParser(
        prog="bot.py",
        description=(
            "Shadowtradingbot: a paper-first Robinhood Crypto bot. "
            "Hard caps are $1 per order, 1 open position, and a $0.50 daily loss stop."
        ),
    )
    parser.add_argument("command", nargs="?", choices=["status", "cancel-all"])
    parser.add_argument("--paper", action="store_true", help="simulate fills (default)")
    parser.add_argument("--live", action="store_true", help="send real orders; also requires --confirm")
    parser.add_argument("--confirm", action="store_true", help="confirm that --live may send real orders")
    parser.add_argument("--demo", action="store_true", help="replay the built-in BTC tape, even if an API key is set")
    parser.add_argument("--quotes", action="store_true", help="paper mode with live Robinhood quotes")
    parser.add_argument("--symbol", default=None, help="trading pair, default BTC-USD")
    parser.add_argument("--interval", type=float, default=None, help="seconds between quotes, default 30")
    parser.add_argument("--ticks", type=int, default=None, help="stop after this many quotes")
    parser.add_argument("--once", action="store_true", help="fetch one quote and exit")
    args = parser.parse_args(argv)

    if args.paper and args.live:
        print("Choose either --paper or --live.", file=sys.stderr)
        return 2
    ticks = 1 if args.once and args.ticks is None else args.ticks
    try:
        config = build_config(
            live=args.live,
            confirmed=args.confirm,
            demo=args.demo,
            quotes=args.quotes,
            symbol=args.symbol,
            interval=args.interval,
            ticks=ticks,
            command=args.command,
        )
    except ConfigError as exc:
        print(exc, file=sys.stderr)
        return 2

    for warning in config.limits.warnings:
        print(f"warning: {warning}", flush=True)

    try:
        if args.command == "status":
            return _status(config)
        if args.command == "cancel-all":
            return _cancel_all(config)
        return _trade(config)
    except ConfigError as exc:
        print(exc, file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\nstopped.", flush=True)
        return 0


def _status(config) -> int:
    store = Store.load(config.state_path, config.paper_cash)
    source = config.quote_source if config.quote_source != "auto" else "auto"
    _print_status(config, store, source)
    print("status reads the local state file. It does not send orders.", flush=True)
    return 0


def _cancel_all(config) -> int:
    journal = Journal(config.journal_path, config.mode)
    if config.paper:
        store = Store.load(config.state_path, config.paper_cash)
        print(
            "Paper mode does not place exchange orders, so there is nothing to cancel.",
            flush=True,
        )
        if store.position is not None:
            print(
                "A simulated position is still open. Cancel does not sell it.",
                flush=True,
            )
        journal.write("cancel", paper=True, cancelled=0)
        _print_status(config, store, "demo" if config.demo else config.quote_source)
        return 0

    from shadowtradingbot.broker import LiveBroker

    store = Store.load(config.state_path, config.paper_cash)
    broker = LiveBroker.connect(store, config.limits, config.symbol)
    print(broker.preflight(), flush=True)
    cancelled = broker.cancel_all()
    journal.write("cancel", paper=False, cancelled=len(cancelled), orders=cancelled)
    if not cancelled:
        print("No open crypto orders.", flush=True)
    else:
        for order in cancelled:
            print(
                f"cancel requested {order['order_id']} {order['side']} {order['symbol']}",
                flush=True,
            )
    if store.pending is not None:
        store.pending = None
        store.save()
    return 0


def _trade(config) -> int:
    quote_source = _resolve_quotes(config)
    store = Store.load(config.state_path, config.paper_cash)
    if config.fee_ratio:
        store.fee_ratio = config.fee_ratio
    journal = Journal(config.journal_path, config.mode)
    strategy = DipBounceStrategy(config.window, config.dip_pct, config.take_profit_pct)
    broker = _make_broker(config, store, quote_source)
    return run(
        config,
        broker,
        strategy,
        journal,
        store,
        quote_source=quote_source,
    )


def _resolve_quotes(config) -> str:
    if config.quote_source == "robinhood":
        return "robinhood"
    if config.quote_source == "demo":
        return "demo"
    if _credentials_present():
        print(
            "API credentials found. Paper mode will use live quotes and will not send orders. "
            "Pass --demo to replay the built-in tape instead.",
            flush=True,
        )
        return "robinhood"
    print(
        "No API credentials found. Paper mode is replaying the built-in tape. "
        "Set RH_CRYPTO_API_KEY and RH_CRYPTO_PRIVATE_KEY to use live quotes.",
        flush=True,
    )
    return "demo"


def _credentials_present() -> bool:
    if os.environ.get("RH_CRYPTO_API_KEY") and os.environ.get("RH_CRYPTO_PRIVATE_KEY"):
        return True
    try:
        from pyhood.crypto.credentials import credentials_available
    except ImportError:
        return False
    return bool(credentials_available())


def _make_broker(config, store: Store, quote_source: str):
    from shadowtradingbot.broker import LiveBroker, PaperBroker
    from shadowtradingbot.feeds import DemoFeed, RobinhoodFeed

    if config.mode == "live":
        return LiveBroker.connect(store, config.limits, config.symbol)
    if quote_source == "demo":
        return PaperBroker(
            DemoFeed(config.symbol, config.window),
            store,
            config.limits,
            store.fee_ratio or config.fee_ratio,
        )

    try:
        from pyhood.crypto import CryptoClient
    except ImportError as exc:
        raise ConfigError(
            "pyhood is not installed. Run: python -m pip install -r requirements.txt"
        ) from exc
    try:
        client = CryptoClient()
    except FileNotFoundError as exc:
        raise ConfigError(str(exc)) from exc

    feed = RobinhoodFeed(client, config.symbol)
    broker = PaperBroker(
        feed,
        store,
        config.limits,
        store.fee_ratio or config.fee_ratio,
        buying_power_source="robinhood account",
    )

    def power() -> Decimal:
        account = client.get_account()
        ratio = Decimal(str(getattr(account, "fee_ratio", 0) or 0))
        broker.fee_ratio = ratio
        store.fee_ratio = ratio
        return Decimal(str(account.buying_power))

    broker._buying_power_fn = power
    return broker


if __name__ == "__main__":
    sys.exit(main())
