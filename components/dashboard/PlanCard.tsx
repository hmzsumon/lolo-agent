// FILE: components/accounts/PlanCard.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetAllAdminAiAccountsQuery } from "@/redux/features/ai-account/ai-accountApi";
import { setSelectedAccountId } from "@/redux/features/ai-account/ai-accountUISlice";
import type { Plan } from "@/types/accounts";
import { motion } from "framer-motion";
import { BadgeDollarSign, ExternalLink, Wallet2 } from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";

function formatPrice(n: number) {
  return `$${n}`;
}
const keyOf = (s: string) => (s ?? "").toLowerCase().trim();

export function PlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetAllAdminAiAccountsQuery();

  const items = data?.items ?? [];
  const planKey = keyOf(plan.title); // "Lite" -> "lite"

  // একাধিক থাকলে প্রায়োরিটি: active → isDefault → প্রথমটা
  const candidates = items.filter((a: any) => keyOf(a.plan) === planKey);
  const acc =
    candidates.find((a: any) => a.status === "active") ??
    candidates.find((a: any) => a.isDefault) ??
    candidates[0] ??
    null;

  const buttonDisabled = isLoading || !acc;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        className={`h-full rounded-2xl border border-white/10 bg-[#111418] text-white shadow-xl ${
          isSelected ? "ring-2 ring-white/40" : "hover:border-white/20"
        }`}
      >
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BadgeDollarSign className="h-5 w-5" />
            <span>Trade {plan.title}</span>
            <span className="ml-auto text-base font-semibold opacity-80">
              {formatPrice(plan.price)}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
            <div className="flex items-center gap-2">
              <Wallet2 className="h-4 w-4" />
              <span className="font-medium">Accounts:</span>
              <span className="opacity-90">{plan.accounts}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex flex-col gap-3 w-full">
            <Link href={plan.url} className="w-full" prefetch>
              <Button
                className="w-full rounded-xl text-sm py-6 "
                disabled={buttonDisabled}
                onClick={() => {
                  if (!acc) return;
                  dispatch(setSelectedAccountId(acc._id));
                }}
              >
                {buttonDisabled ? (
                  <span>Loading…</span>
                ) : (
                  <div className=" text-center w-full">
                    <span>Trade Now</span>
                  </div>
                )}
              </Button>
            </Link>
            <Link
              href={`/ai-accounts/${plan?.title.toLowerCase()}`}
              className="w-full text-center text-sm opacity-80 hover:opacity-100 ml-2"
              prefetch
            >
              <span className="flex items-center">
                <span>View</span>
                <span>
                  <ExternalLink size={16} className="ml-2" />
                </span>
              </span>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
