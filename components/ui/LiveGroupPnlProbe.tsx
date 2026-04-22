// components/ui/LiveGroupPnlProbe.tsx
"use client";

import { useLiveBook } from "@/hooks/useLiveBook";
import { useEffect } from "react";

type Row = {
  _id: string;
  symbol: string;
  status: "open" | "closed";
  side: "buy" | "sell";
  entryPrice: number | string;
  lots?: number | string;
  volume?: number | string;
};

export default function LiveGroupPnlProbe({
  symbol,
  positions,
  onChange,
}: {
  symbol: string;
  positions: Row[];
  onChange: (symbol: string, value: number) => void;
}) {
  const { book } = useLiveBook(symbol);
  const bid = Number(book?.bid);
  const ask = Number(book?.ask);

  useEffect(() => {
    if (!Number.isFinite(bid) || !Number.isFinite(ask)) {
      onChange(symbol, NaN);
      return;
    }
    let acc = 0;
    for (const p of positions) {
      if (p.status !== "open") continue;
      const lots = Number(p.lots ?? p.volume ?? 0);
      const entry = Number(p.entryPrice);
      if (!Number.isFinite(lots) || !Number.isFinite(entry)) continue;
      const close = p.side === "buy" ? bid : ask;
      const diff = p.side === "buy" ? close - entry : entry - close;
      const v = diff * lots;
      if (Number.isFinite(v)) acc += v;
    }
    onChange(symbol, acc);
  }, [symbol, positions, bid, ask, onChange]);

  return null;
}
