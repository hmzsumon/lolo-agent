// app/auth/positions/page.tsx
"use client";

import EmptyPositions from "@/components/positions/EmptyPositions";
import PositionRow from "@/components/positions/PositionRow";
import PositionsHeader from "@/components/positions/PositionsHeader";
import { useSelectedAccount } from "@/hooks/useSelectedAccount";
import { useGetAllAiPositionsQuery } from "@/redux/features/ai-account/ai-accountApi";
import type { AiPosition } from "@/types/trade";
import { num } from "@/utils/num";
import { useMemo } from "react";

// ✅ নতুন
import { useJoinAccountRoom } from "@/hooks/useJoinAccountRoom";
import { usePositionSocket } from "@/hooks/usePositionSocket";

export default function PositionsPage() {
  const { account } = useSelectedAccount();
  const accountId: string | undefined = account?._id;

  // ✅ socket hooks: listen + join account-room
  usePositionSocket();
  useJoinAccountRoom(accountId);

  const { data, isLoading } = useGetAllAiPositionsQuery();

  const raw = (data?.items ?? []) as any[];

  const items: (AiPosition & { plan?: string; planPrice?: number })[] =
    useMemo(() => {
      return raw.map((p) => {
        const rawStatus = String(p?.status ?? "");
        const status =
          rawStatus === "active"
            ? "open"
            : rawStatus === "open"
            ? "open"
            : "closed";

        const symbol = String(
          p?.symbol ?? p?.instrument ?? p?.symbolName ?? ""
        ).toUpperCase();

        return {
          _id: String(p?._id ?? ""),
          symbol,
          side: p?.side === "sell" ? "sell" : "buy",
          volume: num(p?.volume ?? p?.lots ?? 0),
          entryPrice: num(p?.entryPrice ?? p?.price ?? 0),
          status,
          profit: num(p?.profit),
          accountNumber: Number(p?.accountNumber ?? 0),
          plan: String(p?.plan ?? ""),
          planPrice: num(p?.planPrice ?? p?.pricePlan ?? p?.plan_amount),
          lastPrice: num(p?.lastPrice ?? p?.currentPrice ?? 0),
          takeProfit: num(p?.takeProfit ?? p?.tp ?? 0),
        } as AiPosition & { plan?: string; planPrice?: number };
      });
    }, [raw]);

  const openItems = useMemo(
    () => items.filter((p) => p.status === "open"),
    [items]
  );

  const totalPLFallback = useMemo(() => {
    let s = 0;
    for (const p of openItems) {
      const v = num(p.profit);
      if (Number.isFinite(v)) s += v;
    }
    return s;
  }, [openItems]);

  return (
    <div className="mx-auto max-w-3xl py-4 md:py-6">
      <div className="space-y-2">
        <PositionsHeader
          totalPL={totalPLFallback}
          loading={isLoading}
          positions={openItems as any}
        />
      </div>

      {!isLoading && openItems.length === 0 && <EmptyPositions />}

      <div className="mt-3 space-y-2">
        {openItems.map((p) => (
          <PositionRow
            key={p._id}
            p={{
              _id: p._id,
              symbol: p.symbol,
              side: p.side,
              volume: p.volume,
              entryPrice: p.entryPrice,
              status: p.status,
              profit: p.profit,
              lastPrice: (p as any).lastPrice,
              plan: (p as any).plan,
              planPrice: (p as any).planPrice,
              takeProfit: (p as any).takeProfit, // ➕ নতুন
            }}
          />
        ))}
      </div>
    </div>
  );
}
