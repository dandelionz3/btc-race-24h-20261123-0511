# BTC Dip-Buy Bot — btc-race-24h-20261123-0511

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/dandelionz3/btc-race-24h-20261123-0511/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/dandelionz3/btc-race-24h-20261123-0511/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

A long-only dip-buy bot trading Coinbase Wrapped BTC (CBBTC) against USDC, one minute at a time. It sits in cash and waits for a sharp pullback: only when flat, at least 240 bars after its last sale, and the 60-bar close return has fallen 100 bps or more, it buys with all available cash. Once in, it sells everything at a +200 bps target, a −80 bps stop, or after 480 bars, whichever comes first. It keeps at most 600 closes of history, skips warm-up batches, and is fully deterministic — no network, no clock, no randomness — so two runs on the same bars produce identical orders.

## Run it

```
node cli/makefun.mjs grade-local --kit . --bot /home/hatch/workspace/makefun/btc-race-24h-20261123-0511-entry --driver process
```

<sub>Entered on [make.fun](https://make.fun/?ref=wzx9n98z&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>
