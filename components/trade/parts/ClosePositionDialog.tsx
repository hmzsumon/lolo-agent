// components/trade/parts/ClosePositionDialog.tsx
/* ───────────────────────────────────────────
   close dialog: single hook + single math
   - safe when position is not ready
─────────────────────────────────────────── */

"use client";

import LivePnlBadge from "@/components/ui/LivePnlBadge";
import { useLiveClosePrice } from "@/hooks/useLivePrice";
import { useCloseAiPositionMutation } from "@/redux/features/ai-account/ai-accountApi";
import { fmt } from "@/utils/num";
import { positionPnl } from "@/utils/tradeMath";
import { useMemo, useState } from "react";

type PositionMini = {
  _id: string;
  symbol: string;
  side: "buy" | "sell";
  volume: number;
  entryPrice: number;
};

export default function ClosePositionDialog({
  position,
  lastPrice,
  onDone,
}: {
  position?: PositionMini; // ← make optional
  lastPrice?: number; // ← make optional
  onDone: () => void;
}) {
  if (!position) return null; // ← guard

  const px = useLiveClosePrice(
    position.symbol,
    position.side,
    lastPrice ?? position.entryPrice
  );

  const [closeAiPosition, { isLoading }] = useCloseAiPositionMutation();
  const [error, setError] = useState<string | null>(null);

  const pnl = useMemo(
    () =>
      positionPnl({
        side: position.side,
        entryPrice: position.entryPrice,
        closePrice: px,
        lots: position.volume,
      }),
    [position, px]
  );

  const submit = async () => {
    try {
      await closeAiPosition({ id: position._id, price: px }).unwrap();

      window.dispatchEvent(
        new CustomEvent("position:closed", { detail: { id: position._id } })
      );
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            kind: Number.isFinite(pnl) && pnl >= 0 ? "success" : "info",
            text: `Order closed • P/L: ${fmt(pnl, 2)} USD`,
          },
        })
      );
      onDone();
    } catch (e: any) {
      setError(e?.data?.message || "Close failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/60" onClick={onDone} />
      <div className="absolute left-0 right-0 bottom-0 bg-neutral-950 rounded-t-2xl p-5 border-t border-neutral-800">
        <div className="text-center text-lg font-semibold mb-2">
          Close position {position.symbol}?
        </div>

        <div className="flex justify-between text-sm text-neutral-300 mb-3">
          <div>Lots</div>
          <div>{fmt(position.volume, 2)}</div>
        </div>

        <div className="flex justify-between text-sm text-neutral-300 mb-3">
          <div>Closing price</div>
          <div>{fmt(px, 2)}</div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-neutral-300">P/L</div>
          <LivePnlBadge
            position={{
              _id: position._id,
              symbol: position.symbol,
              side: position.side,
              entryPrice: position.entryPrice,
              lots: position.volume,
              lastPrice: lastPrice ?? position.entryPrice,
              status: "open",
            }}
            size="md"
          />
        </div>

        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDone}
            className="rounded-xl py-3 bg-neutral-800"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="rounded-xl py-3 bg-yellow-400 text-black font-semibold disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "Closing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
