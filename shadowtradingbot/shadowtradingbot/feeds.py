"""Quote sources. The demo tape lets paper mode run with no API key."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from shadowtradingbot.models import Quote

# One basis point on each side. The full spread is 2 bps, far inside the
# 1.5% take-profit, so the built-in tape can complete a round trip.
# Real BTC quotes are often much wider; the engine skips those buys.
DEMO_HALF_SPREAD = Decimal("0.0001")
DEMO_FLAT = Decimal("100000")
DEMO_DIP = Decimal("98900")
DEMO_RALLY = Decimal("100410")


def demo_mids(window: int) -> list[Decimal]:
    """Flat window, then a dip through the buy rule, then a rally through the sell rule."""
    return [DEMO_FLAT] * window + [DEMO_DIP, DEMO_RALLY]


def quote_from_mid(
    symbol: str,
    mid: Decimal,
    half_spread: Decimal = DEMO_HALF_SPREAD,
    timestamp: datetime | None = None,
) -> Quote:
    bid = mid * (Decimal("1") - half_spread)
    ask = mid * (Decimal("1") + half_spread)
    return Quote(
        symbol=symbol,
        bid=bid,
        ask=ask,
        timestamp=timestamp or datetime.now(timezone.utc),
    )


class DemoFeed:
    """Replay a scripted mid-price tape, then hold the last price."""

    def __init__(self, symbol: str, window: int, mids: list[Decimal] | None = None):
        self.symbol = symbol
        self._mids = list(mids if mids is not None else demo_mids(window))
        if not self._mids:
            raise ValueError("demo tape is empty")
        self._index = 0

    def next_quote(self) -> Quote:
        mid = self._mids[min(self._index, len(self._mids) - 1)]
        self._index += 1
        return quote_from_mid(self.symbol, mid)


class SequenceFeed:
    """Test feed of explicit quotes."""

    def __init__(self, quotes: list[Quote]):
        if not quotes:
            raise ValueError("quote sequence is empty")
        self._quotes = quotes
        self._index = 0

    def next_quote(self) -> Quote:
        quote = self._quotes[min(self._index, len(self._quotes) - 1)]
        self._index += 1
        return quote


class RobinhoodFeed:
    """Live best bid/ask from the official Crypto Trading API via pyhood."""

    def __init__(self, client, symbol: str):
        self.client = client
        self.symbol = symbol

    def next_quote(self) -> Quote:
        quotes = self.client.get_best_bid_ask(self.symbol)
        if not quotes:
            from shadowtradingbot.errors import APIError

            raise APIError(f"no quote returned for {self.symbol}")
        quote = quotes[0]
        timestamp = getattr(quote, "timestamp", None) or datetime.now(timezone.utc)
        return Quote(
            symbol=self.symbol,
            bid=Decimal(str(quote.bid)),
            ask=Decimal(str(quote.ask)),
            timestamp=timestamp,
        )
