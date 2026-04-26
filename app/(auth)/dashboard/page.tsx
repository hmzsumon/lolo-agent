"use client";

/* ────────── app/(auth)/dashboard/page.tsx ─────────── */
/* Agent Dashboard (Deposits/Withdraws + Commission + Referral + Quick Actions) */

import Link from "next/link";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import MetricCard from "@/components/admin/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatCurrency } from "@/lib/format";

// ✅ Single dashboard endpoint (recommended)
import { useGetMyDashboardSummaryQuery } from "@/redux/features/agent/agentFinanceApi";

import CopyToClipboard from "@/lib/CopyToClipboard";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  Link2,
  Share2,
  Sparkles,
  Wallet,
} from "lucide-react";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

export default function AgentDashboardPage() {
  const { user } = useSelector((state: any) => state.auth);

  // ✅ Dashboard Summary (all KPIs in one call)
  const { data: dashRes, isLoading: dashLoading } =
    useGetMyDashboardSummaryQuery();

  const data = dashRes?.data || {};
  const commission = data?.commission || {};
  const deposits = data?.deposits || {};
  const withdraws = data?.withdraws || {};
  // Debug log to verify data structure
  // Deposits
  const totalDeposit = deposits?.lifetimeAmount ?? 0;
  const todayDeposit = deposits?.todayAmount ?? 0;
  const todayDepositCount = deposits?.todayCount ?? 0;

  // Withdraws
  const totalWithdraw = withdraws?.lifetimeAmount ?? 0;
  const todayWithdraw = withdraws?.todayAmount ?? 0;
  const todayWithdrawCount = withdraws?.todayCount ?? 0;

  // Overall Commission
  const totalCommission = commission?.lifetime ?? 0;
  const todayCommission = commission?.today ?? 0;
  const monthCommission = commission?.month ?? 0;

  // Deposit/Withdraw Commission
  const depositCommission = commission?.deposit?.lifetime ?? 0;
  const depositCommissionToday = commission?.deposit?.today ?? 0;

  const withdrawCommission = commission?.withdraw?.lifetime ?? 0;
  const withdrawCommissionToday = commission?.withdraw?.today ?? 0;

  // Referral link
  const host = typeof window !== "undefined" ? window.location.host : "";
  const referralCode = data?.referralCode || "";

  // Rolling / Float Balance
  const rollingBalance = data?.rollingBalance ?? 0;

  const referralLink =
    process.env.NODE_ENV === "development"
      ? `http://localhost:3000/register?referral_code=${referralCode}`
      : `https://www.lolobet.live/register?referral_code=${referralCode}`;

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    } catch {
      toast.error("Copy failed!");
    }
  };

  const shareReferral = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join with my referral",
          text: "Register using my referral link:",
          url: referralLink,
        });
      } else {
        await navigator.clipboard.writeText(referralLink);
        toast.success("Share not supported — link copied!");
      }
    } catch {
      // user cancelled share / no-op
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: "Deposit",
      description: "Create a new deposit request",
      href: "/deposit",
      icon: <ArrowUpToLine className="h-5 w-5" />,
    },
    {
      title: "Deposits",
      description: "View deposit history",
      href: "/deposits/all",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: "Withdrawals",
      description: "View withdrawal history",
      href: "/withdrawals/all",
      icon: <ArrowDownToLine className="h-5 w-5" />,
    },
    {
      title: "Invite Friends",
      description: "Share your referral link",
      href: "#",
      icon: <Link2 className="h-5 w-5" />,
    },
  ];

  return (
    <main className="min-h-screen text-slate-100">
      {/* Background */}
      <div className="relative min-h-screen bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          {/* soft gradient blobs */}
          <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute top-24 right-10 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-3xl" />
          {/* subtle grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:24px_24px] opacity-40" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <Sparkles className="h-3.5 w-3.5" />
                Agent Dashboard
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                Overview
              </h1>
              <p className="mt-1 text-sm text-white/60">
                Deposits, withdrawals, commissions and referral tools.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/deposit">
                <Button className="rounded-2xl">Create Deposit</Button>
              </Link>
              <Link href="/invite-friends">
                <Button variant="secondary" className="rounded-2xl">
                  Referral
                </Button>
              </Link>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Rolling / Float Balance */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Rolling Balance (Float)"
                value={formatCurrency(rollingBalance)}
                accent={<Wallet className="h-5 w-5 text-white/60" />}
                subtitle={dashLoading ? "Loading..." : "Operational balance"}
              />
            </div>

            {/* Deposits */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Total Deposits (Lifetime)"
                value={formatCurrency(totalDeposit)}
                accent={<ArrowUpToLine className="h-5 w-5 text-white/60" />}
                subtitle={dashLoading ? "Loading..." : "Approved total"}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Today Deposits"
                value={formatCurrency(todayDeposit)}
                accent={<ArrowUpToLine className="h-5 w-5 text-white/60" />}
                subtitle={
                  dashLoading ? "Loading..." : `Count: ${todayDepositCount}`
                }
              />
            </div>

            {/* Withdrawals */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Total Withdrawals (Lifetime)"
                value={formatCurrency(totalWithdraw)}
                accent={<ArrowDownToLine className="h-5 w-5 text-white/60" />}
                subtitle={dashLoading ? "Loading..." : "Approved total"}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Today Withdrawals"
                value={formatCurrency(todayWithdraw)}
                accent={<ArrowDownToLine className="h-5 w-5 text-white/60" />}
                subtitle={
                  dashLoading ? "Loading..." : `Count: ${todayWithdrawCount}`
                }
              />
            </div>

            {/* Overall Commission */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Commission (Lifetime)"
                value={formatCurrency(totalCommission)}
                accent={<Wallet className="h-5 w-5 text-white/60" />}
                subtitle={dashLoading ? "Loading..." : "Total earned"}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Commission (Today)"
                value={formatCurrency(todayCommission)}
                accent={<Wallet className="h-5 w-5 text-white/60" />}
                subtitle={dashLoading ? "Loading..." : "Today"}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Commission (This Month)"
                value={formatCurrency(monthCommission)}
                accent={<Wallet className="h-5 w-5 text-white/60" />}
                subtitle={dashLoading ? "Loading..." : "Month to date"}
              />
            </div>

            {/* Deposit Commission */}
            {/* <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Deposit Commission"
                value={formatCurrency(depositCommission)}
                accent={<Wallet className="h-5 w-5 text-white/60" />}
                subtitle={
                  dashLoading
                    ? "Loading..."
                    : `Today: ${formatCurrency(depositCommissionToday)}`
                }
              />
            </div> */}

            {/* Withdraw Commission */}
            {/* <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <MetricCard
                title="Withdraw Commission"
                value={formatCurrency(withdrawCommission)}
                accent={<Wallet className="h-5 w-5 text-white/60" />}
                subtitle={
                  dashLoading
                    ? "Loading..."
                    : `Today: ${formatCurrency(withdrawCommissionToday)}`
                }
              />
            </div> */}
          </div>

          {/* Main Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left: Quick Actions */}
            {/* <div className="lg:col-span-7 space-y-4">
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base text-white/90">
                    Quick Actions
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {quickActions.map((a) => (
                      <Link key={a.title} href={a.href} className="group">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-white/20 hover:bg-slate-950/55">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-white/90">
                                {a.title}
                              </p>
                              <p className="mt-1 text-xs text-white/60">
                                {a.description}
                              </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/80 group-hover:text-white">
                              {a.icon}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-sm font-medium text-white/90">
                      Game Management
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      Add game widgets here later (featured games, categories,
                      stats, etc.).
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div> */}

            {/* Right: Referral Card */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base text-white/90">
                    Referral Link
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                          <Link2 className="h-4 w-4 text-white/60" />
                          Share & Earn
                        </div>
                        <p className="mt-1 text-xs text-white/60">
                          Copy or share this link with users to register.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-2">
                      <input
                        value={referralLink}
                        readOnly
                        className="w-full bg-transparent text-xs text-white/80 outline-none"
                      />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={copyReferral}
                        className="flex-1 rounded-2xl"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>

                      <Button
                        onClick={shareReferral}
                        variant="secondary"
                        className="flex-1 rounded-2xl"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    <div className="mt-3 text-xs flex items-center gap-2 text-white/55">
                      Referral Code:{" "}
                      <span className="text-white/80">
                        {referralCode || "N/A"}
                      </span>
                      <span>
                        <CopyToClipboard text={referralCode} />
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-sm font-medium text-white/90">Note</p>
                    <p className="mt-1 text-xs text-white/60">
                      This dashboard is intentionally kept clean. Game widgets
                      will be added later.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
