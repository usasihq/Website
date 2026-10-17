"""Dip-and-bounce starter strategy.

Buy when the mid price is 1% below a short rolling average and the bot is
flat. Sell when the bid — the price a market sell can actually hit — is
1.5% above the entry fill. The bid is used on the way out so a wide
spread cannot book a "profit" the order will not receive.
"""

from __future__ import annotations

from collections import deque
from decimal import Decimal

from shadowtradingbot.models import Decision, Position, Quote


class DipBounceStrategy:
    def __init__(self, window: int, dip_pct: Decimal, take_profit_pct: Decimal):
        if window < 2:
            raise ValueError("window must be at least 2")
        self.window = window
        self.dip_pct = dip_pct
        self.take_profit_pct = take_profit_pct
        self._prices: deque[Decimal] = deque(maxlen=window)

    def restore(self, prices: list[Decimal]) -> None:
        self._prices.clear()
        for price in prices[-self.window :]:
            self._prices.append(price)

    def prices(self) -> list[Decimal]:
        return list(self._prices)

    def decide(self, quote: Quote, position: Position | None) -> Decision:
        self._prices.append(quote.mid)
        average = None
        if len(self._prices) >= self.window:
            average = sum(self._prices, Decimal("0")) / Decimal(len(self._prices))

        target = None
        if position is not None:
            target = position.entry_price * (Decimal("1") + self.take_profit_pct)
            if quote.bid >= target:
                return Decision(
                    "sell",
                    f"bid {quote.bid} is at least {self.take_profit_pct} above entry {position.entry_price}",
                    quote.mid,
                    average,
                    position.entry_price,
                    target,
                )

        if len(self._prices) < self.window or average is None:
            return Decision(
                "warmup",
                f"collecting prices {len(self._prices)}/{self.window}",
                quote.mid,
                average,
                position.entry_price if position else None,
                target,
            )

        if position is not None:
            if quote.mid >= target:
                return Decision(
                    "hold",
                    f"mid {quote.mid} is at the target but bid {quote.bid} is still below {target}",
                    quote.mid,
                    average,
                    position.entry_price,
                    target,
                )
            return Decision(
                "hold",
                f"mid {quote.mid} is below take-profit {target}",
                quote.mid,
                average,
                position.entry_price,
                target,
            )

        threshold = average * (Decimal("1") - self.dip_pct)
        if quote.mid <= threshold:
            return Decision(
                "buy",
                f"mid {quote.mid} is at least {self.dip_pct} below average {average}",
                quote.mid,
                average,
                None,
                threshold,
            )
        return Decision(
            "hold",
            f"mid {quote.mid} is above the dip threshold {threshold}",
            quote.mid,
            average,
            None,
            threshold,
        )
