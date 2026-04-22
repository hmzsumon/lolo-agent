"use client";

import { isTPHit, Side, tpTarget } from "@/utils/takeProfit";
import { useEffect, useRef } from "react";

type Position = {
  _id: string;
  accountId?: string;
  symbol: string; // BTCUSDT
  side: Side; // "buy" | "sell"
  lots: number; // volume
  entryPrice: number;
  takeProfit?: number; // percentage, e.g. 3 = 3%
  status?: "open" | "closed" | "active";
};

type Price = { bid?: number; ask?: number; mid?: number };

export function useAutoCloseTP(
  pos: Position,
  price: Price,
  opts: {
    /** পজিশন ক্লোজ করার actual ফাংশন (API কল) */
    onClose: (args: {
      positionId: string;
      lots: number;
      priceHint?: number;
    }) => Promise<any>;
    enabled?: boolean; // default true
  }
) {
  const closingRef = useRef(false);

  useEffect(() => {
    if (closingRef.current) return;
    if (opts.enabled === false) return;
    if (
      !pos ||
      (pos.status && pos.status !== "open" && pos.status !== "active")
    )
      return;

    const tp = Number(pos.takeProfit);
    if (!Number.isFinite(tp) || tp <= 0) return;

    // BUY→ আমরা bid-এ ক্লোজ করি; SELL→ ask-এ ক্লোজ করি
    const closeQuote =
      pos.side === "buy"
        ? Number(price?.bid) || Number(price?.mid) || NaN
        : Number(price?.ask) || Number(price?.mid) || NaN;

    const target = tpTarget(pos.entryPrice, pos.side, tp);

    if (isTPHit(pos.side, closeQuote, target)) {
      closingRef.current = true;
      opts
        .onClose({
          positionId: pos._id,
          lots: pos.lots, // পূর্ণ ক্লোজ; partial চাইলে কমিয়ে দাও
          priceHint: closeQuote, // অপশনাল (সার্ভারে ব্যবহার করলে)
        })
        .catch(() => {
          // ব্যর্থ হলেও আবার স্প্যামিং ঠেকাতে locked রাখছি।
        });
    }
  }, [
    pos?._id,
    pos?.side,
    pos?.lots,
    pos?.entryPrice,
    pos?.takeProfit,
    pos?.status,
    price?.bid,
    price?.ask,
    price?.mid,
    opts,
  ]);
}
