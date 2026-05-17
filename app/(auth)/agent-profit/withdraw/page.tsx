"use client";

/* ────────── app/(auth)/agent-profit/withdraw/page.tsx ──────────
   Agent Profit Withdraw Request page
   ✅ Agent payment method ব্যবহার হবে না
   ✅ Agent শুধু বিকাশ/নগদ select করে number দিয়ে request করবে
   ✅ Min/Max limit এবং balance summary দেখাবে
──────────────────────────────────────────────────────────────── */

import { Send, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaAngleLeft } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  useCreateMyAgentProfitWithdrawRequestMutation,
  useGetMyAgentProfitSummaryQuery,
} from "@/redux/features/agent/agentFinanceApi";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export default function AgentProfitWithdrawPage() {
  const router = useRouter();
  const { data: summaryRes } = useGetMyAgentProfitSummaryQuery();
  const [createWithdraw, { isLoading }] =
    useCreateMyAgentProfitWithdrawRequestMutation();

  const summary = summaryRes?.data || {};
  const minWithdraw = Number(summary.minWithdraw || 500);
  const maxWithdraw = Number(summary.maxWithdraw || 25000);
  const agentProfit = Number(summary.agentProfit || 0);

  const [methodName, setMethodName] = useState<"bkash" | "nagad">("bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const submit = async () => {
    const cleanAmount = Number(amount || 0);
    const cleanNumber = onlyDigits(accountNumber);

    if (!cleanAmount || cleanAmount <= 0) return toast.error("Amount দিন");
    if (cleanAmount < minWithdraw)
      return toast.error(`Minimum withdraw ${minWithdraw}`);
    if (cleanAmount > maxWithdraw)
      return toast.error(`Maximum withdraw ${maxWithdraw}`);
    if (cleanAmount > agentProfit)
      return toast.error("Insufficient agent profit balance");
    if (!/^01\d{9}$/.test(cleanNumber))
      return toast.error("Valid বিকাশ/নগদ number দিন");

    try {
      await createWithdraw({
        amount: cleanAmount,
        methodName,
        accountNumber: cleanNumber,
        note,
      }).unwrap();
      toast.success("Withdraw request submitted");
      router.push("/agent-profit");
    } catch (err: any) {
      toast.error(err?.data?.message || "Withdraw request failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-2xl space-y-5 p-4 md:p-6">
        {/* ────────── Top Bar ────────── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <FaAngleLeft /> Back
          </button>
          <Link
            href="/agent-profit"
            className="text-sm text-emerald-300 hover:underline"
          >
            Profit History
          </Link>
        </div>

        {/* ────────── Header ────────── */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
            <Wallet className="h-3.5 w-3.5" /> Profit Withdraw
          </div>
          <h1 className="mt-3 text-2xl font-semibold">
            Agent Profit Withdraw Request
          </h1>
          <p className="text-sm text-white/50">
            বিকাশ/নগদ select করে number এবং amount দিয়ে request submit করুন।
          </p>
        </div>

        {/* ────────── Balance Info ────────── */}
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-white/50">Available Profit</p>
              <p className="mt-1 text-xl font-bold">
                {formatCurrency(agentProfit)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50">Minimum</p>
              <p className="mt-1 font-semibold">
                {formatCurrency(minWithdraw)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/50">Maximum</p>
              <p className="mt-1 font-semibold">
                {formatCurrency(maxWithdraw)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ────────── Request Form ────────── */}
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="h-4 w-4" /> Submit Withdraw Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(["bkash", "nagad"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethodName(m)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                    methodName === m
                      ? "border-emerald-400 bg-emerald-400/15 text-emerald-200"
                      : "border-white/10 bg-black/20 text-white/70 hover:bg-white/5"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <label className="block space-y-1 text-sm text-white/70">
              Payment Number
              <input
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(onlyDigits(e.target.value).slice(0, 11))
                }
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>

            <label className="block space-y-1 text-sm text-white/70">
              Amount
              <input
                value={amount}
                onChange={(e) =>
                  setAmount(onlyDigits(e.target.value).slice(0, 7))
                }
                inputMode="numeric"
                placeholder={`${minWithdraw} - ${maxWithdraw}`}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>

            <label className="block space-y-1 text-sm text-white/70">
              Note (optional)
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                className="min-h-20 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>

            <Button
              onClick={submit}
              disabled={isLoading}
              className="w-full rounded-xl py-6"
            >
              {isLoading ? "Submitting..." : "Submit Withdraw Request"}
            </Button>

            <p className="text-xs text-white/45">
              Request করলে amount pending হিসেবে agentProfit থেকে কেটে রাখা হবে।
              Admin reject করলে amount আবার refund হবে।
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
