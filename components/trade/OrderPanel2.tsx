"use client";

import { usePriceStream } from "@/hooks/usePriceStream";
import { usePlaceMarketOrderMutation } from "@/redux/features/trade/tradeApi";
import { useMemo, useState } from "react";

type Side = "buy" | "sell";

export default function OrderPanel({
  symbol,
  account,
}: {
  symbol: string;
  account: any;
}) {
  const { price } = usePriceStream(symbol);
  const [lots, setLots] = useState(0.1);
  const [side, setSide] = useState<Side>("buy");
  const [place, { isLoading }] = usePlaceMarketOrderMutation();

  const bid = Number(price?.bid) || 0;
  const ask = Number(price?.ask) || 0;
  const mid = Number(price?.mid) || 0;

  const leverage = account?.leverage ?? 200;
  const contractSize = useMemo(
    () => (symbol.includes("XAU") ? 100 : 1),
    [symbol]
  );
  const notional = mid * contractSize * lots;
  const margin = notional / leverage;
  const canTrade = !!account && !!mid && lots > 0;

  const handleConfirm = async () => {
    if (!canTrade || isLoading) return;
    const execPrice = side === "buy" ? ask || mid : bid || mid;

    try {
      const res = await place({
        accountId: account._id,
        symbol,
        side,
        lots,
        price: execPrice,
      }).unwrap();

      const position = res.position;
      window.dispatchEvent(
        new CustomEvent("position:opened", { detail: { position } })
      );
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            kind: "success",
            text: `Order filled: ${side.toUpperCase()} ${lots.toFixed(
              2
            )} ${symbol} @ ${execPrice}`,
          },
        })
      );
    } catch (e: any) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { kind: "error", text: e?.data?.message || "Order failed" },
        })
      );
    }
  };

  return (
    <div className="rounded-t-2xl bg-neutral-950 border-t border-neutral-800 p-4">
      <div className="text-center text-sm text-neutral-400">Regular</div>

      <div className="mt-3">
        <div className="text-sm text-neutral-400">Volume</div>
        <div className="mt-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center">
          <button
            className="px-4 py-3 text-xl"
            onClick={() =>
              setLots((v) => Math.max(0.01, +(v - 0.01).toFixed(2)))
            }
          >
            −
          </button>
          <div className="flex-1 text-center text-2xl font-semibold">
            {lots.toFixed(2)}
          </div>
          <button
            className="px-4 py-3 text-xl"
            onClick={() => setLots((v) => +(v + 0.01).toFixed(2))}
          >
            ＋
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 items-center">
        <button
          onClick={() => setSide("sell")}
          className={`rounded-xl py-3 font-semibold ${
            side === "sell" ? "bg-red-500/90" : "bg-neutral-800"
          }`}
        >
          Sell {bid ? bid.toFixed(2) : "-"}
        </button>

        <button
          onClick={() => setSide("buy")}
          className={`rounded-xl py-3 font-semibold ${
            side === "buy" ? "bg-blue-600/90" : "bg-neutral-800"
          }`}
        >
          Buy {ask ? ask.toFixed(2) : "-"}
        </button>
      </div>

      <div className="mt-3">
        <button
          disabled={!canTrade || isLoading}
          onClick={handleConfirm}
          className={`w-full rounded-xl py-3 font-semibold ${
            side === "sell" ? "bg-red-600" : "bg-blue-600"
          } disabled:opacity-50`}
        >
          {isLoading
            ? "Placing…"
            : `Confirm ${side === "sell" ? "Sell" : "Buy"} ${lots.toFixed(
                2
              )} lots ${(
                (side === "sell" ? bid || mid : ask || mid) || 0
              ).toFixed(2)}`}
        </button>
      </div>

      <div className="mt-3 text-xs text-neutral-400">
        Fees: ~0.00 {account?.currency || "USD"} • Margin:{" "}
        {isFinite(margin) ? margin.toFixed(2) : "-"}{" "}
        {account?.currency || "USD"} (1:
        {leverage})
      </div>
    </div>
  );
}
