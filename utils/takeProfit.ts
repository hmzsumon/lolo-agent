export type Side = "buy" | "sell";

/** entry + tp% থেকে টার্গেট প্রাইস বের করি (BUY↑, SELL↓) */
export function tpTarget(entryPrice: number, side: Side, tpPct: number) {
  if (!Number.isFinite(entryPrice) || !Number.isFinite(tpPct)) return NaN;
  const f = tpPct / 100;
  return side === "buy" ? entryPrice * (1 + f) : entryPrice * (1 - f);
}

/** closeQuote = BUY→bid, SELL→ask; target হিট হলো কি না */
export function isTPHit(side: Side, closeQuote: number, target: number) {
  if (!Number.isFinite(closeQuote) || !Number.isFinite(target)) return false;
  return side === "buy" ? closeQuote >= target : closeQuote <= target;
}
