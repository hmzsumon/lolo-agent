// FILE: components/accounts/SelectedAccountCard.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Plan } from "@/types/accounts";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

function formatPrice(n: number) {
  return `$${n}`;
}

export function SelectedAccountCard({ plan }: { plan?: Plan }) {
  if (!plan) return null;
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5" /> Selected Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-emerald-500/20 px-3 py-1">
              {plan.title}
            </span>
            <Separator
              orientation="vertical"
              className="h-4 bg-emerald-400/40"
            />
            <span>
              Price: <b>{formatPrice(plan.price)}</b>
            </span>
            <Separator
              orientation="vertical"
              className="h-4 bg-emerald-400/40"
            />
            <span>
              Accounts: <b>{plan.accounts}</b>
            </span>
            <div className="ml-auto">
              <Link href={plan.url}>
                <Button className="rounded-xl">Proceed</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
