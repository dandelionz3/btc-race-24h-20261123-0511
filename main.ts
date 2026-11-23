// Long-only dip-buy bot on CBBTC: buy a deep 60-bar dip after a cooldown, exit on target, stop, or time stop.
import { runBars } from './vendor/makefun-bars.ts';
import type { BarsState, Batch } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const ENTRY_ROC_BARS = 60;
const ENTRY_ROC_BPS = -100;
const TARGET_BPS = 200;
const STOP_BPS = -80;
const MAX_HOLD_BARS = 480;
const COOLDOWN_BARS = 240;
const MAX_SLIPPAGE_BPS = 100;
const MAX_CLOSES = 600;

const closes: bigint[] = [];
let entryClose: bigint | null = null;
let entryBar: number | null = null;
let lastSaleBar: number | null = null;

function returnBpsAtLeast(close: bigint, base: bigint, thresholdBps: number): boolean {
  // (close / base - 1) * 10000 >= thresholdBps, in exact integer arithmetic.
  return close * 10000n >= base * BigInt(10000 + thresholdBps);
}

function returnBpsAtMost(close: bigint, base: bigint, thresholdBps: number): boolean {
  // (close / base - 1) * 10000 <= thresholdBps, in exact integer arithmetic.
  return close * 10000n <= base * BigInt(10000 + thresholdBps);
}

await runBars({
  onBatch(state: BarsState, _batch: Batch) {
    const bar = state.latest.get(SYMBOL);
    const close = bar === undefined ? null : BigInt(bar.c);
    if (close === null) return [];

    closes.push(close);
    if (closes.length > MAX_CLOSES) closes.splice(0, closes.length - MAX_CLOSES);

    if (state.warmingUp) return [];

    const position = state.positions.get(SYMBOL);
    const qty = position === undefined ? 0n : position.qty;
    const holding = qty > 0n;

    // A held position with no entry state (e.g. resumed mid-position): recover
    // the entry from the current close and seq so exits still work.
    if (holding && entryClose === null) {
      entryClose = close;
      entryBar = state.seq;
    }
    if (!holding && entryClose !== null) {
      entryClose = null;
      entryBar = null;
    }

    if (holding && entryClose !== null && entryBar !== null) {
      const age = state.seq - entryBar;
      const hitTarget = returnBpsAtLeast(close, entryClose, TARGET_BPS);
      const hitStop = returnBpsAtMost(close, entryClose, STOP_BPS);
      const hitTimeStop = age >= MAX_HOLD_BARS;
      if (hitTarget || hitStop || hitTimeStop) {
        lastSaleBar = state.seq;
        entryClose = null;
        entryBar = null;
        return [{ side: 'sell', symbol: SYMBOL, qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
      return [];
    }

    if (holding) return [];

    // Flat: entry only after the cooldown since the last sale.
    if (lastSaleBar !== null && state.seq - lastSaleBar < COOLDOWN_BARS) return [];

    // Entry: 60-bar close return <= -100 bps.
    if (closes.length <= ENTRY_ROC_BARS) return [];
    const base = closes[closes.length - 1 - ENTRY_ROC_BARS]!;
    if (!returnBpsAtMost(close, base, ENTRY_ROC_BPS)) return [];

    if (state.cash <= 0n) return [];
    entryClose = close;
    entryBar = state.seq;
    return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: state.cash, max_slippage_bps: MAX_SLIPPAGE_BPS }];
  },
});
