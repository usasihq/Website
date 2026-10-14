"""Error types the bot handles on purpose.

Auth failures and rate limits stop or pause the loop. They are never
retried in a tight loop: Robinhood answers some throttling with HTTP 401,
and hammering that looks like an auth outage.
"""

from __future__ import annotations

try:
    from pyhood.exceptions import APIError, AuthError, RateLimitError
except ImportError:  # paper demo runs without pyhood installed

    class AuthError(Exception):
        """Authentication failed or credentials are missing."""

    class RateLimitError(Exception):
        """Too many requests. `retry_after` is seconds to wait, if known."""

        def __init__(self, message: str = "Rate limited", retry_after: float | None = None):
            super().__init__(message)
            self.retry_after = retry_after

    class APIError(Exception):
        """The exchange returned an error that is not auth or rate limiting."""

        def __init__(
            self,
            message: str,
            status_code: int | None = None,
            response: dict | None = None,
        ):
            super().__init__(message)
            self.status_code = status_code
            self.response = response


class SafetyError(Exception):
    """A hard limit refused the order. The exchange was not called."""


class KillSwitchError(SafetyError):
    """The day's realized loss has reached the kill-switch."""


class PositionLimitError(SafetyError):
    """An order would exceed the single open position."""


class NotionalLimitError(SafetyError):
    """An order would exceed the cash cap, or is too small to round into it."""


class InsufficientFundsError(SafetyError):
    """Buying power cannot cover the order."""


class ConfigError(Exception):
    """Startup configuration is missing or contradictory."""


def is_insufficient_funds(exc: BaseException) -> bool:
    """True when an API error is a buying-power rejection."""
    if isinstance(exc, InsufficientFundsError):
        return True
    text = str(exc).lower()
    needles = (
        "insufficient",
        "buying power",
        "buying_power",
        "not enough",
        "exceeds available",
    )
    return any(needle in text for needle in needles)


def classify_error(exc: BaseException) -> str:
    """Short label stored in the journal. Never includes the exception text."""
    if isinstance(exc, (AuthError, FileNotFoundError, ConfigError)):
        return "auth"
    if isinstance(exc, RateLimitError):
        return "rate_limit"
    if is_insufficient_funds(exc):
        return "insufficient_funds"
    if isinstance(exc, KillSwitchError):
        return "kill_switch"
    if isinstance(exc, SafetyError):
        return "safety"
    return "api"
