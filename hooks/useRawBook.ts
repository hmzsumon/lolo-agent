// hooks/useRawBook.ts
"use client";

import { useEffect, useRef, useState } from "react";

/** Binance bookTicker (RAW) */
export function useRawBook(symbol: string) {
  const [bid, setBid] = useState<number>(NaN);
  const [ask, setAsk] = useState<number>(NaN);
  const [ts, setTs] = useState<number>(Date.now());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;
    const lower = symbol.toLowerCase();
    const base =
      process.env.NEXT_PUBLIC_BINANCE_WS ?? "wss://stream.binance.com:9443";
    const url = `${base}/ws/${lower}@bookTicker`;

    let closed = false;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const j = JSON.parse(e.data as string);
        if (j && j.b && j.a) {
          setBid(parseFloat(j.b));
          setAsk(parseFloat(j.a));
          setTs(Date.now());
        }
      } catch {}
    };
    ws.onclose = () => {
      if (!closed) wsRef.current = null;
    };
    ws.onerror = () => {
      try {
        ws.close();
      } catch {}
    };

    return () => {
      closed = true;
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [symbol]);

  return { bid, ask, ts };
}
