// hooks/useUnifiedPrice.ts
"use client";

import { useBinanceStream } from "@/hooks/useBinanceStream";
import { applyFixedSpread, perMilleFromTargetUsd } from "@/utils/spread";

/** প্রতিটি সিম্বলের ডিফল্ট টিক সাইজ */
function tick(symbol: string) {
  const s = symbol.toUpperCase();
  if (/BTC|ETH|SOL|BNB/.test(s)) return 0.01;
  if (s.includes("XAU")) return 0.01;
  return 0.001;
}

const PM_DEFAULT = Number(process.env.NEXT_PUBLIC_SPREAD_PM ?? 10); // fallback ‰

/**
 * Binance bookTicker + kline(1m) → mid
 * তারপর target-USD (BTC→$12) থেকে per-mille বের করে bid/ask বানাই
 */
export function useUnifiedPrice(symbol: string) {
  const { data: bt } = useBinanceStream(symbol, "bookTicker");
  const { data: kl1 } = useBinanceStream(symbol, "kline_1m");

  const bidRaw = bt?.b ? parseFloat(bt.b) : NaN;
  const askRaw = bt?.a ? parseFloat(bt.a) : NaN;
  const lastClose = (kl1 as any)?.k?.c ? parseFloat((kl1 as any).k.c) : NaN;

  const mid =
    Number.isFinite(bidRaw) && Number.isFinite(askRaw)
      ? (bidRaw + askRaw) / 2
      : lastClose;

  // BTC জোড়ায় ~ $12 স্প্রেড টার্গেট
  let perMille: number = PM_DEFAULT;
  if (/^BTC.*(USD|USDT)$/i.test(symbol) && Number.isFinite(mid)) {
    perMille = perMilleFromTargetUsd(mid, 12, 0.01); // 0.01 ‰ স্টেপ
  }

  const { bid, ask, spreadAbs, spreadPm } = applyFixedSpread(mid, {
    perMille,
    tick: tick(symbol),
  });

  return { mid, bid, ask, spreadAbs, spreadPm };
}
