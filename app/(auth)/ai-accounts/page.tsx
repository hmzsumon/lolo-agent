// FILE: app/ai-accounts/page.tsx
"use client";

import { AccountPickerSheet } from "@/components/dashboard/AccountPickerSheet";
import { PlanCard } from "@/components/dashboard/PlanCard";
import { SelectedAccountCard } from "@/components/dashboard/SelectedAccountCard";
import { plans as basePlans } from "@/data/accounts/plans";
import { useGetAllAiAccountsQuery } from "@/redux/features/ai-account/ai-accountApi";
import type { Plan } from "@/types/accounts";
import { useMemo, useState } from "react";

export default function AiAccountsPage() {
  const { data, isLoading } = useGetAllAiAccountsQuery();
  const accounts = data?.items ?? [];

  const planCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const acc of accounts) {
      const key = String(acc.plan || "")
        .toLowerCase()
        .trim(); // 'lite', 'prime'...
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [accounts]);

  const plans: Plan[] = useMemo(
    () =>
      basePlans.map((p) => ({
        ...p,
        // title -> 'Lite' তাই লোয়ারকেস করে ম্যাপ করা
        accounts: planCounts[p.title.toLowerCase()] ?? 0,
      })),
    [basePlans, planCounts]
  );

  const [selected, setSelected] = useState<Plan | undefined>();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      <div className="mx-auto max-w-6xl px-4 pb-24">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0b0e11] via-[#0b0e11] to-transparent pt-6 pb-4">
          <h1 className="text-3xl font-bold">AI Accounts</h1>
          <p className="mt-1 text-sm opacity-70">
            Pick a plan to start trading with AI-managed accounts.
          </p>
        </div>

        <div className="mb-6">
          <SelectedAccountCard plan={selected} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((p) => (
            <PlanCard
              key={p.title}
              plan={p}
              isSelected={selected?.title === p.title}
              onSelect={() => {
                setSelected(p);
                setOpen(true);
              }}
            />
          ))}
        </div>

        <AccountPickerSheet
          plan={selected}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
    </div>
  );
}
