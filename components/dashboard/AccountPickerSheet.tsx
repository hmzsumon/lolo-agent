// FILE: components/accounts/AccountPickerSheet.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Plan } from "@/types/accounts";
import Link from "next/link";
import { useMemo } from "react";

function formatPrice(n: number) {
  return `$${n}`;
}

export function AccountPickerSheet({
  plan,
  onOpenChange,
  open,
}: {
  plan?: Plan;
  onOpenChange: (v: boolean) => void;
  open: boolean;
}) {
  const summary = useMemo(
    () =>
      plan
        ? `${plan.title} — ${formatPrice(plan.price)} · Accounts: ${
            plan.accounts
          }`
        : "No plan selected",
    [plan]
  );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-[#0b0e11]/95 text-white">
        <SheetHeader>
          <SheetTitle className="text-left">Confirm Your Plan</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            {summary}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {plan ? (
              <Link href={plan.url} className="ml-auto">
                <Button className="rounded-xl">Trade Now</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
