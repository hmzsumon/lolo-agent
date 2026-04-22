// utils/spread.ts
// ───────────────────────────────────────────────────────────
// Zero-spread utilities: bid == ask, spreadAbs = 0, spreadPm = 0
// ───────────────────────────────────────────────────────────

/** নির্দিষ্ট টিক সাইজে রাউন্ড */
export function roundToTick(n: number, tick = 0.01) {
  if (!Number.isFinite(n) || !Number.isFinite(tick) || tick <= 0) return n;
  return Math.round(n / tick) * tick;
}

/** mid → bid/ask (ALWAYS ZERO SPREAD) */
export function applyFixedSpread(
  mid: number,
  opts?: { perMille?: number; tick?: number }
) {
  const tick = opts?.tick ?? 0.01;
  if (!Number.isFinite(mid) || mid <= 0) {
    return { bid: NaN, ask: NaN, spreadAbs: 0, spreadPm: 0 };
  }
  const px = roundToTick(mid, tick);
  return { bid: px, ask: px, spreadAbs: 0, spreadPm: 0 };
}

/** target USD spread → per-mille (ALWAYS 0) */
export function perMilleFromTargetUsd(
  _mid: number,
  _targetUsd: number,
  _stepPm = 0.01
) {
  return 0;
}
