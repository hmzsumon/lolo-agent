"use client";

import { useAutoCloseTP } from "@/hooks/useAutoCloseTP";
import { useUnifiedPrice } from "@/hooks/useUnifiedPrice"; // বা usePriceStream
import {
  useCloseAiPositionMutation,
  usePlaceAiOrderMutation,
} from "@/redux/features/ai-account/ai-accountApi";
import toast from "react-hot-toast";

export default function AutoCloser({ position }: { position: any }) {
  const { bid, ask, mid } = useUnifiedPrice(position.symbol);

  // ১) ডেডিকেটেড close API থাকলে
  const [closePos] = (useCloseAiPositionMutation as any)?.() ?? [null];

  // ২) fallback: উল্টো সাইডে মার্কেট অর্ডার দিয়ে net-out
  const [placeOrder] = usePlaceAiOrderMutation();

  useAutoCloseTP(
    {
      _id: String(position._id),
      accountId: String(position.accountId || ""),
      symbol: String(position.symbol),
      side: position.side === "sell" ? "sell" : "buy",
      lots: Number(position.lots ?? position.volume ?? 0),
      entryPrice: Number(position.entryPrice ?? position.price ?? 0),
      takeProfit: Number(position.takeProfit),
      status: (position.status === "active" ? "open" : position.status) as any,
    },
    { bid, ask, mid },
    {
      enabled: true,
      onClose: async ({ positionId, lots, priceHint }) => {
        try {
          if (closePos) {
            await closePos({ positionId }).unwrap();
          } else {
            const opposite = position.side === "buy" ? "sell" : "buy";
            await placeOrder({
              accountId: position.accountId,
              symbol: position.symbol,
              side: opposite,
              lots,
              price: priceHint, // hint মাত্র
            }).unwrap();
          }
          toast.success(`TP hit → closed ${position.symbol}`);
          window.dispatchEvent(
            new CustomEvent("position:closed", { detail: { id: positionId } })
          );
        } catch (e: any) {
          toast.error(e?.data?.message || e?.message || "Close failed");
        }
      },
    }
  );

  return null;
}
