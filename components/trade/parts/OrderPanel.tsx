/* components/trade/OrderPanel.tsx */
"use client";

import { useUnifiedPrice } from "@/hooks/useUnifiedPrice"; // ✅ একক সোর্স
import { useMemo, useState } from "react";
import ConfirmTradeDrawer from "../ConfirmTradeDrawer";

/* UI symbol → Binance raw */
function toBinanceSymbol(sym: string) {
  let s = sym.replace("/", "").toUpperCase();
  if (s.endsWith("USD")) s = s.replace("USD", "USDT"); // ETH/USD → ETHUSDT
  return s;
}

export default function OrderPanel({
  symbol: uiSymbol,
  account,
}: {
  symbol: string;
  account: any;
}) {
  const symbol = toBinanceSymbol(uiSymbol);

  // ✅ unified mid/bid/ask
  const { mid, bid, ask, spreadAbs, spreadPm } = useUnifiedPrice(symbol);

  // শুধু সাইড সিলেক্ট + ড্রয়ার ওপেন/ক্লোজ
  const [side, setSide] = useState<"buy" | "sell">("sell");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dp = useMemo(() => (/(BONK|PEPE|SHIB)/.test(symbol) ? 5 : 2), [symbol]);

  return (
    <div className="relative rounded-t-lg bg-neutral-950 border-t border-neutral-800 p-3">
      {/* ছোট রিবন: স্প্রেড ইনফো */}
      <div className="absolute -top-3 right-2 text-[10px] px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
        spread ~ {Number.isFinite(spreadAbs) ? spreadAbs.toFixed(dp) : "–"} (
        {Number.isFinite(spreadPm) ? spreadPm.toFixed(2) : "–"}‰)
      </div>

      {/* Sell / Buy */}
      <div className="mt-1 relative">
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`rounded-xl py-3 font-semibold ${
              side === "sell" ? "bg-red-500/90" : "bg-neutral-800"
            }`}
            onClick={() => {
              setSide("sell");
              setConfirmOpen(true);
            }}
          >
            Sell {Number.isFinite(bid) ? bid.toFixed(dp) : "—"}
          </button>

          <button
            className={`rounded-xl py-3 font-semibold ${
              side === "buy" ? "bg-blue-600/90" : "bg-neutral-800"
            }`}
            onClick={() => {
              setSide("buy");
              setConfirmOpen(true);
            }}
          >
            Buy {Number.isFinite(ask) ? ask.toFixed(dp) : "—"}
          </button>
        </div>

        {/* center spread chip */}
        <div
          className="
            pointer-events-none absolute top-3 left-1/2 -translate-x-1/2
            z-10 rounded-md border border-neutral-800
            bg-neutral-900 px-2 py-0.5 text-[12px] font-semibold
            text-neutral-300 shadow
          "
          title="Spread (Ask − Bid)"
        >
          {Number.isFinite(spreadAbs) ? spreadAbs.toFixed(dp) : "—"}
        </div>
      </div>

      {/* Drawer: বাকি সব কাজ এখানে */}
      <ConfirmTradeDrawer
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        account={account}
        symbol={symbol}
        side={side}
        bid={Number(bid) || 0}
        ask={Number(ask) || 0}
        mid={Number(mid) || 0}
        dp={dp}
      />
    </div>
  );
}
