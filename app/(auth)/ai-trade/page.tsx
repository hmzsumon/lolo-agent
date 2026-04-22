// app/(auth)/trade/page.tsx
"use client";

import TradeScreen from "@/components/trade/TradeScreen";
import { useSelectedAiAccount } from "@/hooks/useSelectedAiAccount";

export default function AiTradePage() {
  const { account, loading } = useSelectedAiAccount();

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] grid place-items-center">
        <div className="text-neutral-500">Loading markets…</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)]">
      <TradeScreen account={account} />
    </div>
  );
}
