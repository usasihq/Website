"""Strategy signals on the demo tape and on hand-built quotes."""

from __future__ import annotations

import unittest
from datetime import datetime, timezone
from decimal import Decimal

from shadowtradingbot.feeds import demo_mids, quote_from_mid
from shadowtradingbot.models import Position, Quote
from shadowtradingbot.strategy import DipBounceStrategy


def _position(entry: Decimal) -> Position:
    return Position(
        symbol="BTC-USD",
        quantity=Decimal("0.00001"),
        entry_price=entry,
        cost_basis=Decimal("1"),
        opened_at="2026-10-14T00:00:00+00:00",
        order_id="test",
    )


class StrategyTest(unittest.TestCase):
    def test_warmup_then_dip_buys(self):
        window = 20
        strategy = DipBounceStrategy(window, Decimal("0.01"), Decimal("0.015"))
        decisions = [
            strategy.decide(quote_from_mid("BTC-USD", mid), None).action
            for mid in demo_mids(window)
        ]
        self.assertEqual(decisions[: window - 1], ["warmup"] * (window - 1))
        self.assertEqual(decisions[window - 1], "hold")
        self.assertEqual(decisions[window], "buy")

    def test_sells_when_bid_clears_one_and_a_half_percent(self):
        strategy = DipBounceStrategy(3, Decimal("0.01"), Decimal("0.015"))
        for mid in (Decimal("100"), Decimal("100"), Decimal("100")):
            strategy.decide(quote_from_mid("BTC-USD", mid), None)
        entry = Decimal("100")
        # Mid is high enough, but a wide spread leaves the bid short of the target.
        wide = Quote(
            "BTC-USD",
            Decimal("101"),
            Decimal("104"),
            datetime.now(timezone.utc),
        )
        self.assertEqual(strategy.decide(wide, _position(entry)).action, "hold")
        gained = quote_from_mid("BTC-USD", Decimal("101.6"))
        self.assertEqual(strategy.decide(gained, _position(entry)).action, "sell")
        self.assertGreater(gained.bid, entry * Decimal("1.015"))


if __name__ == "__main__":
    unittest.main()
