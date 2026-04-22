// components/positions/PositionRow.tsx
"use client";

/* compact single position row
   - live pnl badge (shared)
   - live close price readout (right of pnl)
   - close button opens ClosePositionDialog
   - ➕ plan & planPrice badges
*/
import ClosePositionDialog from "@/components/trade/parts/ClosePositionDialog";
import LivePnlBadge from "@/components/ui/LivePnlBadge";
import { useState } from "react";
import LiveClosePrice from "../ui/LiveClosePrice";

export default function PositionRow({
  p,
  onCloseClick,
}: {
  p: {
    _id: string;
    symbol: string;
    side: "buy" | "sell";
    volume: number;
    entryPrice: number;
    status: "open" | "closed";
    profit?: number;
    lastPrice?: number;
    // ➕ নতুন
    plan?: string;
    planPrice?: number;
    takeProfit: number;
  };
  onCloseClick?: (posId: string) => void;
}) {
  const sideC = p.side === "buy" ? "text-blue-400" : "text-red-400";
  const [showClose, setShowClose] = useState(false);

  const lastPx = Number.isFinite(p.lastPrice)
    ? (p.lastPrice as number)
    : p.entryPrice;

  const planLabel = (p.plan || "").toUpperCase();
  const hasPlan = !!planLabel;
  const hasPlanPrice = Number.isFinite(p.planPrice as number);

  return (
    <>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-2 py-2">
        {/* Top line: Symbol + Plan badges */}
        <div>
          <div className="flex items-center justify-between ">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 grid place-items-center rounded-full bg-neutral-800 text-xs font-bold">
                  {p.symbol.slice(0, 1)}
                </div>
                <div className="text-sm font-bold tracking-wide">
                  {p.symbol.replace("USDT", "/USD")}
                </div>

                {hasPlan && (
                  <span className="rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-700/40 px-2 py-0.5 text-[11px] font-semibold">
                    {planLabel}
                  </span>
                )}

                {hasPlanPrice && (
                  <span className="rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 text-[11px] font-semibold">
                    ${Number(p.planPrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {/* ────────── Close btn ────────── */}
            <div>
              {p.status === "open" && (
                <button
                  onClick={() => setShowClose(true)}
                  className="px-1.5 py-1 rounded bg-neutral-800/70 text-neutral-200 hover:bg-neutral-700"
                  title="Close position"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Middle: meta (side/volume + entryPrice) + PnL badge */}
        <div className=" mt-2 space-y-1">
          <div className="flex items-start justify-between">
            <div className="text-sm text-neutral-300">
              <span className={sideC}>Take Profit </span>{" "}
              <span className="text-neutral-400">
                :{" "}
                {Number.isFinite(p.entryPrice) ? p.takeProfit?.toFixed(2) : 0.0}{" "}
                USD
              </span>
            </div>

            <div className="">
              <LivePnlBadge
                position={{
                  _id: p._id,
                  symbol: p.symbol,
                  side: p.side,
                  entryPrice: p.entryPrice,
                  lots: p.volume,
                  profit: p.profit,
                  lastPrice: p.lastPrice,
                  status: p.status,
                }}
                onClose={onCloseClick}
                size="md"
              />
            </div>
          </div>

          <div className=" flex items-start justify-between">
            <div className="text-sm text-neutral-300">
              <span className={sideC}>
                {p.side === "buy" ? "Buy" : "Sell"}{" "}
                {Number.isFinite(p.volume) ? p.volume.toFixed(2) : "–"} lot
              </span>{" "}
              <span className="text-neutral-400">
                @{" "}
                {Number.isFinite(p.entryPrice) ? p.entryPrice.toFixed(2) : "–"}
              </span>
            </div>

            {/* live close price small gray */}
            <LiveClosePrice
              symbol={p.symbol}
              side={p.side}
              fallback={lastPx}
              className="min-w-[72px] text-right"
            />
          </div>
        </div>
      </div>

      {showClose && (
        <ClosePositionDialog
          position={{
            _id: p._id,
            symbol: p.symbol,
            side: p.side,
            volume: p.volume,
            entryPrice: p.entryPrice,
          }}
          lastPrice={lastPx}
          onDone={() => {
            setShowClose(false);
            if (onCloseClick) onCloseClick(p._id);
          }}
        />
      )}
    </>
  );
}
