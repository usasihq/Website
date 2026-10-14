"""Paper mode logs a round trip and never calls an exchange."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import unittest
from dataclasses import replace
from decimal import Decimal
from pathlib import Path
from types import SimpleNamespace

from shadowtradingbot.broker import LiveBroker, PaperBroker
from shadowtradingbot.config import build_config
from shadowtradingbot.errors import InsufficientFundsError, SafetyError
from shadowtradingbot.feeds import quote_from_mid
from shadowtradingbot.journal import Journal
from shadowtradingbot.models import Quote
from shadowtradingbot.safety import HARD_MAX_NOTIONAL_USD, resolve_limits
from shadowtradingbot.state import Store
from shadowtradingbot.strategy import DipBounceStrategy

ROOT = Path(__file__).resolve().parents[1]


class JournalTest(unittest.TestCase):
    def test_redacts_api_keys(self):
        path = Path(self.id().replace(".", "_") + ".jsonl")
        path = Path(os.environ.get("TMPDIR", "/tmp")) / "shadow-journal-test.jsonl"
        if path.exists():
            path.unlink()
        journal = Journal(path, "paper")
        journal.write(
            "error",
            message="rejected rh-api-6148effc-c0b1-486c-8940-a1d099456be6",
        )
        line = path.read_text(encoding="utf-8")
        self.assertNotIn("6148effc", line)
        self.assertIn("rh-api-redacted", line)
        record = json.loads(line)
        self.assertEqual(record["kind"], "error")
        path.unlink()


class PaperRunTest(unittest.TestCase):
    def test_cli_demo_round_trip_sends_no_orders(self):
        folder = Path(self.id().replace(".", "_"))
        work = Path(os.environ.get("TMPDIR", "/tmp")) / "shadow-paper-cli"
        work.mkdir(parents=True, exist_ok=True)
        journal = work / "journal.jsonl"
        state = work / "state.json"
        for path in (journal, state):
            if path.exists():
                path.unlink()
        env = os.environ.copy()
        env.pop("RH_CRYPTO_API_KEY", None)
        env.pop("RH_CRYPTO_PRIVATE_KEY", None)
        env["HOME"] = str(work)
        env["SHADOW_JOURNAL"] = str(journal)
        env["SHADOW_STATE"] = str(state)
        env["SHADOW_INTERVAL_SECONDS"] = "0"
        env["SHADOW_FEE_RATIO"] = "0"
        result = subprocess.run(
            [sys.executable, "bot.py", "--paper", "--demo", "--ticks", "25", "--interval", "0"],
            cwd=ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertIn("PAPER buy", result.stdout)
        self.assertIn("PAPER sell", result.stdout)
        kinds = [json.loads(line)["kind"] for line in journal.read_text().splitlines()]
        self.assertIn("quote", kinds)
        self.assertIn("decision", kinds)
        self.assertIn("order", kinds)
        orders = [json.loads(line) for line in journal.read_text().splitlines() if '"kind":"order"' in line]
        self.assertTrue(all(order["paper"] is True for order in orders))
        buys = [order for order in orders if order["side"] == "buy"]
        sells = [order for order in orders if order["side"] == "sell"]
        self.assertEqual(len(buys), 1)
        self.assertEqual(len(sells), 1)
        self.assertLessEqual(Decimal(buys[0]["notional"]) + Decimal(buys[0]["fee"]), HARD_MAX_NOTIONAL_USD)
        saved = json.loads(state.read_text())
        self.assertIsNone(saved["position"])
        self.assertFalse(saved["killed"])
        self.assertGreater(Decimal(saved["realized_pnl"]), 0)
        del folder

    def test_live_without_confirm_exits(self):
        result = subprocess.run(
            [sys.executable, "bot.py", "--live"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("--confirm", result.stderr)
        self.assertNotIn("place_order", result.stdout)

    def test_status_and_cancel_are_local_in_paper(self):
        work = Path(os.environ.get("TMPDIR", "/tmp")) / "shadow-paper-status"
        work.mkdir(parents=True, exist_ok=True)
        env = os.environ.copy()
        env.pop("RH_CRYPTO_API_KEY", None)
        env.pop("RH_CRYPTO_PRIVATE_KEY", None)
        env["HOME"] = str(work)
        env["SHADOW_JOURNAL"] = str(work / "journal.jsonl")
        env["SHADOW_STATE"] = str(work / "state.json")
        cancel = subprocess.run(
            [sys.executable, "bot.py", "cancel-all"],
            cwd=ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(cancel.returncode, 0, cancel.stderr)
        self.assertIn("nothing to cancel", cancel.stdout)
        status = subprocess.run(
            [sys.executable, "bot.py", "status"],
            cwd=ROOT,
            env=env,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(status.returncode, 0, status.stderr)
        self.assertIn("kill switch: off", status.stdout)

    def test_engine_skips_a_buy_when_the_spread_is_wider_than_the_target(self):
        from datetime import datetime, timezone

        from shadowtradingbot.engine import run
        from shadowtradingbot.feeds import SequenceFeed
        from shadowtradingbot.journal import Journal
        from shadowtradingbot.strategy import DipBounceStrategy

        work = Path("/tmp/shadow-spread")
        work.mkdir(parents=True, exist_ok=True)
        journal_path = work / "journal.jsonl"
        state_path = work / "state.json"
        for path in (journal_path, state_path):
            if path.exists():
                path.unlink()
        now = datetime.now(timezone.utc)
        config = build_config(
            live=False,
            confirmed=False,
            demo=True,
            quotes=False,
            symbol="BTC-USD",
            interval=0,
            ticks=None,
        )
        config = replace(
            config,
            journal_path=journal_path,
            state_path=state_path,
            ticks=config.window + 1,
            interval_seconds=0,
        )
        quotes = [Quote("BTC-USD", Decimal("99.99"), Decimal("100.01"), now) for _ in range(config.window)]
        quotes.append(Quote("BTC-USD", Decimal("97"), Decimal("100"), now))
        store = Store.load(state_path, Decimal("10"))
        broker = PaperBroker(SequenceFeed(quotes), store, config.limits, Decimal("0"))
        code = run(
            config,
            broker,
            DipBounceStrategy(config.window, config.dip_pct, config.take_profit_pct),
            Journal(journal_path, "paper"),
            store,
            quote_source="demo",
            sleep=lambda _seconds: None,
        )
        self.assertEqual(code, 0)
        blocked = [
            json.loads(line)
            for line in journal_path.read_text().splitlines()
            if '"kind":"blocked"' in line
        ]
        self.assertTrue(any(item["code"] == "spread" for item in blocked))
        self.assertIsNone(store.position)
        self.assertEqual(broker.place_order_calls, 0)


class LiveGuardTest(unittest.TestCase):
    def _broker(self, **kwargs):
        client = FakeClient(**kwargs)
        store = Store.load(Path(os.environ.get("TMPDIR", "/tmp")) / f"live-{id(client)}.json", Decimal("10"))
        if store.path.exists():
            store.path.unlink()
        store = Store.load(store.path, Decimal("10"))
        limits = resolve_limits(Decimal("1"), 1, Decimal("0.50"))
        broker = LiveBroker(client, store, limits, "BTC-USD")
        return broker, client, store

    def test_low_buying_power_does_not_place(self):
        broker, client, _store = self._broker(buying_power=Decimal("0.10"))
        quote = quote_from_mid("BTC-USD", Decimal("100"))
        with self.assertRaises(InsufficientFundsError):
            broker.submit_buy(quote)
        self.assertEqual(client.placed, [])

    def test_sized_order_stays_inside_the_cap(self):
        broker, client, store = self._broker(buying_power=Decimal("50"))
        quote = quote_from_mid("BTC-USD", Decimal("100"))
        outcome = broker.submit_buy(quote)
        self.assertEqual(len(client.placed), 1)
        quantity = Decimal(client.placed[0]["order_config"]["asset_quantity"])
        buffered = quote.ask * Decimal("1.005")
        self.assertLessEqual(quantity * buffered, HARD_MAX_NOTIONAL_USD)
        self.assertIsNotNone(outcome.fill)
        self.assertLessEqual(store.position.cost_basis, HARD_MAX_NOTIONAL_USD)
        self.assertEqual(store.open_positions(), 1)
        with self.assertRaises(Exception):
            broker.submit_buy(quote)
        self.assertEqual(len(client.placed), 1)

    def test_existing_holding_blocks_the_buy(self):
        holding = SimpleNamespace(asset_code="BTC", quantity="0.5", available_quantity="0.5")
        broker, client, _store = self._broker(holdings=[holding])
        with self.assertRaises(SafetyError):
            broker.submit_buy(quote_from_mid("BTC-USD", Decimal("100")))
        self.assertEqual(client.placed, [])

    def test_minimum_above_one_dollar_is_refused(self):
        broker, client, _store = self._broker(min_size=Decimal("1"))
        with self.assertRaises(SafetyError):
            broker.submit_buy(quote_from_mid("BTC-USD", Decimal("100")))
        self.assertEqual(client.placed, [])

    def test_cancel_all_only_cancels_open_orders(self):
        orders = [
            SimpleNamespace(order_id="open-1", symbol="BTC-USD", side="buy", status="open"),
            SimpleNamespace(order_id="done-1", symbol="BTC-USD", side="buy", status="filled"),
        ]
        broker, client, _store = self._broker(orders=orders)
        broker.preflight()
        cancelled = broker.cancel_all()
        self.assertEqual(client.cancelled, ["open-1"])
        self.assertEqual(cancelled[0]["order_id"], "open-1")

    def test_wide_spread_is_not_a_broker_concern_but_config_builds(self):
        config = build_config(
            live=False,
            confirmed=False,
            demo=True,
            quotes=False,
            symbol="ETH-USD",
            interval=0,
            ticks=1,
        )
        self.assertTrue(config.paper)
        self.assertEqual(config.symbol, "ETH-USD")
        wide = Quote("ETH-USD", Decimal("100"), Decimal("103"), quote_from_mid("ETH-USD", Decimal("100")).timestamp)
        self.assertGreaterEqual(wide.spread_fraction, config.take_profit_pct)


class FakeClient:
    def __init__(
        self,
        buying_power=Decimal("50"),
        holdings=None,
        orders=None,
        increment=Decimal("0.00000001"),
        min_size=Decimal("0"),
        api_tradable=True,
    ):
        self.buying_power_value = buying_power
        self.holdings = holdings or []
        self.orders = orders or []
        self.increment = increment
        self.min_size = min_size
        self.api_tradable = api_tradable
        self.placed = []
        self.cancelled = []
        self.account = SimpleNamespace(
            account_number="123",
            buying_power=buying_power,
            fee_ratio=0,
            api_tradable=True,
            status="active",
        )

    def get_account(self):
        self.account.buying_power = self.buying_power_value
        return self.account

    def get_trading_pairs(self, *symbols):
        symbol = symbols[0] if symbols else "BTC-USD"
        return [
            SimpleNamespace(
                symbol=symbol,
                quantity_increment=self.increment,
                min_order_size=self.min_size,
                api_tradable=self.api_tradable,
            )
        ]

    def get_holdings(self, _account, *_assets):
        return self.holdings

    def get_orders(self, _account):
        return self.orders

    def place_order(self, **kwargs):
        self.placed.append(kwargs)
        quantity = Decimal(kwargs["order_config"]["asset_quantity"])
        return SimpleNamespace(
            order_id="ord-1",
            side=kwargs["side"],
            symbol=kwargs["symbol"],
            status="filled",
            quantity=quantity,
            filled_quantity=quantity,
            average_filled_price=Decimal("100"),
            fee=Decimal("0"),
        )

    def cancel_order(self, order_id):
        self.cancelled.append(order_id)
        return {"id": order_id}

    def get_order(self, _account, order_id):
        return SimpleNamespace(
            order_id=order_id,
            side="buy",
            symbol="BTC-USD",
            status="filled",
            quantity=Decimal("0.01"),
            filled_quantity=Decimal("0.01"),
            average_filled_price=Decimal("100"),
            fee=Decimal("0"),
        )


if __name__ == "__main__":
    unittest.main()
