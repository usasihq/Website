# Shadowtradingbot

A small Robinhood Crypto bot with a hard $1 cap. It watches one symbol, buys when the price dips 1% under a short average, and sells the whole position after a 1.5% rise from the fill. Paper mode is the default: it logs the order it would send and does not call the exchange.

This is a starter you can run and read. It is not a promise of profit.

## Safety limits

These ceilings are in code. Environment variables can only make them smaller.

| Limit | Value |
| --- | --- |
| Cash committed per buy, including the estimated fee | $1.00 |
| Open positions | 1 |
| Realized loss that stops new buys | $0.50 per UTC day |

Before every buy the bot reads buying power and refuses the order when the balance cannot cover it. A second position is refused. If the open position's bid, after the estimated fee, would use up the day's loss budget, the bot sells and stops. `--live` without `--confirm` exits before any order.

The bot never reads a username or password. It uses the official Crypto Trading API key pair through [pyhood](https://github.com/jamestford/pyhood).

## Install

Python 3.10 or newer. From this directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

On some machines the command is `python3` rather than `python`. Either is fine when it is Python 3.10+.

You can try paper mode before this install. The built-in tape does not import pyhood. Install pyhood before using live quotes or live orders.

## Create the API key on desktop

Robinhood does not email you a private key. You create an Ed25519 key pair, register the public half in web classic, and Robinhood gives you an API key.

Do this on a computer you control. The private key can place trades until you revoke it. Robinhood will not ask you to paste the private key into a website or a chat.

### 1. Generate the key pair

With the virtualenv active:

```bash
pyhood setup crypto
```

That command:

1. Generates the Ed25519 pair on your machine. The private key is written to `~/.pyhood/crypto.env` (mode `0600`) and is not printed.
2. Prints the public key and the registration page: [robinhood.com/account/crypto](https://robinhood.com/account/crypto) → API Trading → Add key.
3. Asks for the API key Robinhood issues, without echoing it.
4. Checks the pair with one read-only call.

Official write-up of the same flow: [Crypto Trading API docs](https://docs.robinhood.com/crypto/trading/) and [Robinhood's Crypto API help article](https://robinhood.com/us/en/support/articles/crypto-api/).

To do the same steps by hand, generate a pair with PyNaCl (the snippet in the official docs), then continue below. Keep the private key out of shell history and out of git.

### 2. Register it in web classic

1. Sign in to Robinhood in a desktop browser (web classic, not only the phone app).
2. Open crypto account settings: [robinhood.com/account/crypto](https://robinhood.com/account/crypto).
3. Choose **API Trading**, then **Add key**.
4. Paste the **public** key.
5. Enable only the actions this bot needs:
   - Read crypto accounts
   - Read crypto holdings
   - Read crypto orders
   - Read crypto quotes / market data
   - Place orders and cancel orders only when you are ready to use `--live`
6. Copy the API key Robinhood shows. Newer keys look like `rh-api-...`.

You can disable or delete the key later from the same page.

### 3. Point the bot at the key

`pyhood setup crypto` already saved both values in `~/.pyhood/crypto.env`. That file is enough.

To use environment variables instead (they override the file):

```bash
export RH_CRYPTO_API_KEY='the-key-robinhood-showed-you'
export RH_CRYPTO_PRIVATE_KEY='the-base64-private-key-you-generated'
chmod 600 .env   # if you stored them in a local .env instead
```

A local `.env` in this directory is loaded without overriding variables you already exported. Copy `.env.example` if you want a template. Do not commit `.env`.

Check which source is active, without printing secrets:

```bash
pyhood setup
```

This bot does not use `pyhood setup login`. That path is the username/password session for stocks, and this bot does not call it.

## Run paper mode first

No API key required. This replays a built-in BTC-USD tape, simulates a $1 buy and a later sell, and writes a journal:

```bash
python bot.py --paper --demo --ticks 25
```

`--paper` is the default, so `python bot.py --demo --ticks 25` does the same thing. `--ticks 25` stops after the round trip so you can read the log. Omit `--ticks` to keep looping until Ctrl-C.

You should see a `PAPER buy` and a `PAPER sell`. Nothing is sent to Robinhood. Simulated buying power starts at $10 (`SHADOW_PAPER_CASH`) so the $1 check has something to pass.

When the key is set, paper mode uses live quotes and your real buying power, and still does not place orders:

```bash
python bot.py --paper --quotes
```

If a key is present and you do not pass `--demo` or `--quotes`, the bot uses live quotes and says so at startup. Pass `--demo` any time you want the tape instead.

## Commands

```bash
python bot.py --paper                  # paper, demo tape if no key
python bot.py --paper --quotes         # paper, live quotes, no orders
python bot.py --live --confirm         # real orders, still capped at $1
python bot.py status                   # local state, no orders
python bot.py status --live            # local live state, no orders
python bot.py cancel-all               # paper: reports that there is nothing on the exchange
python bot.py cancel-all --live --confirm
python bot.py --symbol ETH-USD --paper --demo --ticks 25
python bot.py --once                   # a single quote
```

`--live` alone exits with an error. Cancel in paper mode does not sell a simulated position. Cancel in live mode cancels open orders; it does not market-sell a filled position.

## Strategy

Default symbol `BTC-USD`. Every 30 seconds:

1. Record the best bid and ask. The signal price is the mid.
2. Keep a rolling average of 20 mids (the API has no candle endpoint, so the average is built from quotes this process collects).
3. If there is no position and the mid is at least 1% below that average, buy about $1 at market.
4. If the bid is at least 1.5% above the entry fill, sell the whole position.

The sell uses the bid on purpose. A mid price can look profitable while the bid is still below the entry.

Buys are skipped when the quoted spread is at least 1.5%. A target that is smaller than the spread cannot pay for the round trip.

Market orders on this API are sized in coin quantity (`asset_quantity`), not dollars. The bot converts $1 at the ask, floors to the pair increment, and includes the account fee ratio when it knows it. Live buys are sized off the ask plus 0.5% so a small move is less likely to push the cash spend over $1. If the pair's minimum size is above that quantity, the bot refuses the order instead of raising it.

## Logs

`logs/journal.jsonl` has one JSON object per line: quotes, decisions, buying-power checks, orders, blocks, and errors. `logs/paper-state.json` and `logs/live-state.json` hold the position, the day's realized pnl, and the kill switch.

Do not delete `logs/live-state.json` while a live position is open. The bot sells only a position recorded in that file. It will not sell coins it did not buy, and it will not buy more of an asset the account already holds.

API keys are redacted if they ever land in a log line. They should not be in the log at all.

## Errors

| What happened | What the bot does |
| --- | --- |
| Missing or rejected API key (`AuthError`, HTTP 401/403) | Stops. Does not retry. A burst of 401s can also be throttling, so wait before trying again. |
| HTTP 429 or pyhood's rate-limit error | Waits (at most 120 seconds) and continues. |
| Buying power below the order, or an "insufficient" response | Logs `insufficient_funds` and does not send that order. |
| Daily realized loss of $0.50 | Stops opening positions until the next UTC day. |

## Micro trades and spreads

A $1 crypto order is mostly spread and fees.

- You buy at the ask and sell at the bid. The gap between them is a loss on entry, before the price moves. On BTC that gap is often a few basis points; on a thin quote, or once the fee tier is added, it can be larger than the 1.5% target. The bot then skips the buy and logs `spread`.
- The bid/ask from `best_bid_ask` is the top of book, not a guaranteed fill for your size. Robinhood's estimated-price endpoint is the one that includes the spread for a quantity. A market order can fill worse than the quote you just logged.
- The fee tier is a percentage of a one-dollar trade. It comes out of the same cap, so the coin purchase is slightly under $1 when the fee ratio is known. A round trip pays the fee twice.
- Rounding down to the asset increment can leave the order under Robinhood's minimum. The bot will not increase the size to qualify. The order is skipped or rejected instead.
- The demo tape uses a 2 basis-point spread so you can see a buy and a sell. Live BTC quotes will not look like that tape.
- $0.50 is enough to trip the kill switch on a single $1 position. That is the point of the cap. It is also small enough that one noisy tick can stop the day.

Losing the whole dollar is a normal outcome. Don't point this at an account you cannot afford to trade, and don't raise the caps in code to "see it work for real."

## Tests

```bash
python3 -m unittest discover -s tests -v
```

The tests do not call Robinhood. They cover the caps, the demo round trip, the spread skip, and a fake live client that must not send an order when buying power is short or a minimum would force the size above $1.

## Disclaimer

Trading crypto can lose money, including the full amount you commit. This bot is software, not advice, and not affiliated with Robinhood. You are responsible for the orders `--live --confirm` sends.
