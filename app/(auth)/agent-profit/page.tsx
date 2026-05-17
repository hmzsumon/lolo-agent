"use client";

/* ────────── app/(auth)/agent-profit/page.tsx ──────────
   Agent Profit page
   ✅ rollingBalance এর daily profit দেখা যাবে
   ✅ Profit history দেখা যাবে
   ✅ Withdraw request আলাদা page থেকে হবে
──────────────────────────────────────────────────────── */

import { History, Send, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import {
  useGetMyAgentProfitSummaryQuery,
  useGetMyAgentProfitTransactionsQuery,
  useGetMyAgentProfitWithdrawRequestsQuery,
} from "@/redux/features/agent/agentFinanceApi";

const fmtDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", { hour12: true });
};

export default function AgentProfitPage() {
  const { data: summaryRes, isLoading: summaryLoading } =
    useGetMyAgentProfitSummaryQuery();
  const { data: txRes, isLoading: txLoading } =
    useGetMyAgentProfitTransactionsQuery();
  const { data: reqRes, isLoading: reqLoading } =
    useGetMyAgentProfitWithdrawRequestsQuery();

  const summary = summaryRes?.data || {};
  const transactions = txRes?.data || [];
  const requests = reqRes?.data || [];

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* ────────── Header ────────── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" /> Agent Profit
            </div>
            <h1 className="mt-3 text-2xl font-semibold">Agent Profit Wallet</h1>
            <p className="text-sm text-white/50">
              Rolling balance এর উপর daily profit এবং withdraw history.
            </p>
          </div>
          <Link href="/agent-profit/withdraw">
            <Button className="rounded-xl">
              <Send className="mr-2 h-4 w-4" /> Withdraw Request
            </Button>
          </Link>
        </div>

        {/* ────────── Summary Cards ────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-sm text-white/60">
                Current Agent Profit
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {summaryLoading
                ? "Loading..."
                : formatCurrency(summary.agentProfit || 0)}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-sm text-white/60">
                Rolling Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {formatCurrency(summary.rollingBalance || 0)}
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-sm text-white/60">
                Daily Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {summary.dailyRatePercent ?? 0}%
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-sm text-white/60">
                Withdraw Limit
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-semibold">
              {formatCurrency(summary.minWithdraw || 500)} -{" "}
              {formatCurrency(summary.maxWithdraw || 25000)}
            </CardContent>
          </Card>
        </div>

        {/* ────────── Profit History ────────── */}
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" /> Profit History
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-white/50">
                <tr className="border-b border-white/10">
                  <th className="py-2">Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Rolling</th>
                  <th>Rate</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {txLoading ? (
                  <tr>
                    <td className="py-4" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                ) : transactions.length ? (
                  transactions.map((x: any) => (
                    <tr key={x._id} className="border-b border-white/5">
                      <td className="py-2 text-white/70">
                        {fmtDate(x.createdAt)}
                      </td>
                      <td className="capitalize">
                        {String(x.type || "").replaceAll("_", " ")}
                      </td>
                      <td className="font-semibold">
                        {formatCurrency(x.amount || 0)}
                      </td>
                      <td>{formatCurrency(x.rollingBalanceSnapshot || 0)}</td>
                      <td>{x.ratePercent || 0}%</td>
                      <td>{formatCurrency(x.afterProfit || 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-white/50" colSpan={6}>
                      No history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* ────────── Withdraw Request History ────────── */}
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4" /> Withdraw Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-white/50">
                <tr className="border-b border-white/10">
                  <th className="py-2">Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Txn ID</th>
                  <th>Reason/Note</th>
                </tr>
              </thead>
              <tbody>
                {reqLoading ? (
                  <tr>
                    <td className="py-4" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                ) : requests.length ? (
                  requests.map((r: any) => (
                    <tr key={r._id} className="border-b border-white/5">
                      <td className="py-2 text-white/70">
                        {fmtDate(r.createdAt)}
                      </td>
                      <td className="font-semibold">
                        {formatCurrency(r.amount || 0)}
                      </td>
                      <td className="capitalize">
                        {r.payoutMethod?.methodName} •{" "}
                        {r.payoutMethod?.accountNumber}
                      </td>
                      <td className="capitalize">{r.status}</td>
                      <td>{r.txnId || "—"}</td>
                      <td>{r.rejectedReason || r.note || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-white/50" colSpan={6}>
                      No withdraw request found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
