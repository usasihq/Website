"""Safety limits, sizing, and error classification."""

from __future__ import annotations

import unittest
from decimal import Decimal

from shadowtradingbot.errors import (
    APIError,
    AuthError,
    InsufficientFundsError,
    KillSwitchError,
    NotionalLimitError,
    PositionLimitError,
    RateLimitError,
    classify_error,
    is_insufficient_funds,
)
from shadowtradingbot.safety import (
    HARD_MAX_DAILY_LOSS_USD,
    HARD_MAX_NOTIONAL_USD,
    assert_buy_allowed,
    resolve_limits,
    size_market_buy,
)


class LimitsTest(unittest.TestCase):
    def test_looser_config_is_clamped(self):
        limits = resolve_limits(Decimal("25"), 4, Decimal("10"))
        self.assertEqual(limits.max_notional, HARD_MAX_NOTIONAL_USD)
        self.assertEqual(limits.max_positions, 1)
        self.assertEqual(limits.daily_loss, HARD_MAX_DAILY_LOSS_USD)
        self.assertEqual(len(limits.warnings), 3)

    def test_stricter_notional_is_kept(self):
        limits = resolve_limits(Decimal("0.25"), 1, Decimal("0.10"))
        self.assertEqual(limits.max_notional, Decimal("0.25"))
        self.assertEqual(limits.daily_loss, Decimal("0.10"))
        self.assertEqual(limits.warnings, ())


class BuyGateTest(unittest.TestCase):
    def setUp(self):
        self.limits = resolve_limits(Decimal("1"), 1, Decimal("0.50"))

    def test_blocks_notional_above_the_cap(self):
        with self.assertRaises(NotionalLimitError):
            assert_buy_allowed(
                notional=Decimal("1.01"),
                buying_power=Decimal("100"),
                open_positions=0,
                realized_pnl=Decimal("0"),
                limits=self.limits,
                killed=False,
            )

    def test_blocks_a_second_position(self):
        with self.assertRaises(PositionLimitError):
            assert_buy_allowed(
                notional=Decimal("1"),
                buying_power=Decimal("100"),
                open_positions=1,
                realized_pnl=Decimal("0"),
                limits=self.limits,
                killed=False,
            )

    def test_kill_switch_at_fifty_cents(self):
        with self.assertRaises(KillSwitchError):
            assert_buy_allowed(
                notional=Decimal("1"),
                buying_power=Decimal("100"),
                open_positions=0,
                realized_pnl=Decimal("-0.50"),
                limits=self.limits,
                killed=False,
            )

    def test_insufficient_buying_power(self):
        with self.assertRaises(InsufficientFundsError):
            assert_buy_allowed(
                notional=Decimal("1"),
                buying_power=Decimal("0.40"),
                open_positions=0,
                realized_pnl=Decimal("0"),
                limits=self.limits,
                killed=False,
            )

    def test_one_dollar_buy_is_allowed(self):
        assert_buy_allowed(
            notional=Decimal("1"),
            buying_power=Decimal("1"),
            open_positions=0,
            realized_pnl=Decimal("-0.49"),
            limits=self.limits,
            killed=False,
        )


class SizingTest(unittest.TestCase):
    def test_buy_never_exceeds_one_dollar_including_fee(self):
        quantity, notional, fee = size_market_buy(
            Decimal("1"),
            Decimal("98909.89"),
            Decimal("0.00000001"),
            Decimal("0.0085"),
        )
        self.assertLessEqual(notional + fee, Decimal("1"))
        self.assertLessEqual(notional, HARD_MAX_NOTIONAL_USD)
        self.assertGreater(quantity, 0)
        # A higher cash request is still capped at $1.
        _, loose, loose_fee = size_market_buy(
            Decimal("50"),
            Decimal("100"),
            Decimal("0.00000001"),
            Decimal("0"),
        )
        self.assertLessEqual(loose + loose_fee, Decimal("1"))


class ClassifyTest(unittest.TestCase):
    def test_labels(self):
        self.assertEqual(classify_error(AuthError("nope")), "auth")
        self.assertEqual(classify_error(RateLimitError("slow", retry_after=5)), "rate_limit")
        self.assertEqual(classify_error(InsufficientFundsError("no cash")), "insufficient_funds")
        self.assertTrue(is_insufficient_funds(APIError("Insufficient buying power")))
        self.assertEqual(classify_error(APIError("Insufficient buying power")), "insufficient_funds")


if __name__ == "__main__":
    unittest.main()
