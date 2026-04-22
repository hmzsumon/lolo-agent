// hooks/useBinanceStream.ts
"use client";

import { useEffect, useRef, useState } from "react";

/** Supported kline intervals */
export type BinanceKlineInterval =
  | "1m"
  | "3m"
  | "5m"
  | "10m"
  | "15m"
  | "1h"
  | "2h";

/** Stream types we allow */
export type BinanceStream =
  | "trade"
  | "bookTicker"
  | `kline_${BinanceKlineInterval}`;

/**
 * Binance websocket wrapper hook.
 *  - symbol: e.g. "BTCUSDT"
 *  - stream: "trade" | "bookTicker" | `kline_1m` / `kline_3m` / ...
 *
 * returns: { data } -> last parsed JSON message
 */
export function useBinanceStream(symbol: string, stream: BinanceStream) {
  const [msg, setMsg] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryRef = useRef<number>(0);

  useEffect(() => {
    if (!symbol) return;

    let closedByEffect = false;

    const lower = symbol.toLowerCase();
    const path = stream === "trade" ? `${lower}@trade` : `${lower}@${stream}`;
    const base =
      process.env.NEXT_PUBLIC_BINANCE_WS ?? "wss://stream.binance.com:9443";
    const url = `${base}/ws/${path}`;

    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // reset retry backoff
        retryRef.current = 0;

        // simple heartbeat (binance ignores ping frames from browsers,
        // but keeping a no-op timer helps detect stalled connections)
        if (hbRef.current) clearInterval(hbRef.current);
        hbRef.current = setInterval(() => {
          // no-op – just keeping the hook alive
          if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        }, 25_000);
      };

      ws.onmessage = (e) => {
        try {
          const json = JSON.parse(e.data as string);
          setMsg(json);
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {}
      };

      ws.onclose = () => {
        if (hbRef.current) {
          clearInterval(hbRef.current);
          hbRef.current = null;
        }
        wsRef.current = null;

        if (!closedByEffect) {
          // exponential backoff retry (max ~5s)
          const delay = Math.min(5000, 500 * Math.pow(2, retryRef.current++));
          setTimeout(connect, delay);
        }
      };
    }

    connect();

    return () => {
      closedByEffect = true;
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
      if (hbRef.current) {
        clearInterval(hbRef.current);
        hbRef.current = null;
      }
    };
  }, [symbol, stream]);

  return { data: msg };
}
