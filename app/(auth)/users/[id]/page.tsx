/* ────────── imports ────────── */
"use client";
import UserKeyStat from "@/components/admin/UserKeyStat";
import UserPropertyItem from "@/components/admin/UserPropertyItem";
import { useGetUserByIdQuery } from "@/redux/features/admin/adminUsersApi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

/* ────────── helpers ────────── */
const fmtCurrency = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

/* ────────── page ────────── */
export default function AdminUserDetailsPage() {
  /* ────────── params/router ────────── */
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  /* ────────── data ────────── */
  const { data, isLoading, isFetching } = useGetUserByIdQuery({ id });
  const user = data?.user;
  const wallet = data?.wallet;

  /* ────────── derived ────────── */
  const statusChip = useMemo(() => {
    const active = !!user?.is_active;
    return (
      <span
        className={
          active
            ? "rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-400"
            : "rounded-full border border-rose-400/30 bg-rose-400/15 px-2 py-0.5 text-xs text-rose-400"
        }
      >
        {active ? "active" : "inactive"}
      </span>
    );
  }, [user?.is_active]);

  /* ────────── loading fallback ────────── */
  if (isLoading || isFetching) {
    return (
      <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
        <div className="mx-auto max-w-7xl p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-60 rounded bg-white/10" />
            <div className="h-6 w-40 rounded bg-white/10" />
            <div className="grid grid-cols-2 gap-4 pt-6 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/5" />
              ))}
            </div>
            <div className="mt-6 h-64 rounded-2xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  /* ────────── empty state ────────── */
  if (!user) {
    return (
      <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
        <div className="mx-auto max-w-7xl p-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-teal-300 hover:underline"
            type="button"
          >
            ← Go Back
          </button>
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#0E1014] p-6">
            <div className="text-white/70">User not found.</div>
          </div>
        </div>
      </main>
    );
  }

  /* ────────── render ────────── */
  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* ────────── header ────────── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{user.name ?? "-"}</h1>
            <p className="text-xs text-white/50">
              ID: {user.customerId} · Role: {user.role} · {statusChip}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/users/${user._id}/transactions`}
              className="rounded-xl border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-sm text-teal-300 hover:bg-teal-400/15"
            >
              View transactions
            </Link>
            <button
              onClick={() => router.back()}
              className="text-sm text-teal-300 hover:underline"
              type="button"
            >
              ← Go Back
            </button>
          </div>
        </div>

        {/* ────────── key stats ────────── */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#0E1014] p-4">
            <div className="text-xs uppercase tracking-wide text-white/50">
              Main Balance
            </div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {fmtCurrency(user.m_balance)}
            </div>
            <div className="mt-1">
              <Link
                href={`/users/${user._id}/transactions`}
                className="text-xs text-teal-300 hover:underline"
              >
                View transactions
              </Link>
            </div>
          </div>

          <UserKeyStat
            label="Total Deposit"
            value={fmtCurrency(wallet?.totalDeposit)}
          />
          <UserKeyStat
            label="Total Withdraw"
            value={fmtCurrency(wallet?.totalWithdraw)}
          />
          <UserKeyStat
            label="AI Trade Balance"
            value={fmtCurrency(wallet?.totalAiTradeBalance)}
          />
          <UserKeyStat
            label="AI Trade P&L"
            value={fmtCurrency(wallet?.totalAiTradeProfit)}
          />
          <UserKeyStat
            label="Total Earning"
            value={fmtCurrency(wallet?.totalEarning)}
          />
        </section>

        {/* ────────── user properties ────────── */}
        <section className="rounded-2xl border border-white/10 bg-[#0E1014] p-6">
          <h3 className="mb-4 text-sm font-semibold text-white/80">
            User Information
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <UserPropertyItem label="Name" value={user.name} />
              <UserPropertyItem label="Email" value={user.email} />
              <UserPropertyItem label="Phone" value={user.phone} />
              <UserPropertyItem label="Country" value={user.country} />
              <UserPropertyItem label="Customer ID" value={user.customerId} />
              <UserPropertyItem label="Role" value={user.role} />
              <UserPropertyItem label="Rank" value={user.rank} />
              <UserPropertyItem
                label="KYC Verified"
                value={String(user.kyc_verified)}
              />
              <UserPropertyItem
                label="KYC Request"
                value={String(user.kyc_request)}
              />
              <UserPropertyItem
                label="KYC Step"
                value={String(user.kyc_step ?? "-")}
              />
            </div>
            <div>
              <UserPropertyItem label="Active" value={String(user.is_active)} />
              <UserPropertyItem
                label="Active At"
                value={fmtDate(user.activeAt)}
              />
              <UserPropertyItem
                label="Email Verified"
                value={String(user.email_verified)}
              />
              <UserPropertyItem label="Blocked" value={String(user.is_block)} />
              <UserPropertyItem
                label="Withdraw Block"
                value={String(user.is_withdraw_block)}
              />
              <UserPropertyItem
                label="AI Trade Active"
                value={String(user.is_active_aiTrade)}
              />
              <UserPropertyItem
                label="Created At"
                value={fmtDate(user.createdAt)}
              />
              <UserPropertyItem
                label="Updated At"
                value={fmtDate(user.updatedAt)}
              />
              <UserPropertyItem
                label="Sponsor"
                value={user.sponsorName ? user.sponsorName : "-"}
                addon={
                  user.sponsorId ? (
                    <Link
                      href={`/users/${user.sponsorId}`}
                      className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-teal-300 hover:bg-white/10"
                      aria-label="View sponsor profile"
                      title="View sponsor profile"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="mr-1 opacity-80"
                      >
                        <path
                          d="M10.59 13.41a1.996 1.996 0 0 1 0-2.82l3.18-3.18a2 2 0 1 1 2.83 2.83l-1.06 1.06"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.41 10.59a1.996 1.996 0 0 1 0 2.82l-3.18 3.18a2 2 0 1 1-2.83-2.83l1.06-1.06"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Link
                    </Link>
                  ) : null
                }
              />
              <UserPropertyItem
                label="Agent"
                value={user.agentName ? user.agentName : "-"}
              />
              <UserPropertyItem
                label="Parents"
                value={(user.parents?.length ? user.parents.length : 0) + ""}
              />
            </div>
          </div>
        </section>

        {/* ────────── wallet summary ────────── */}
        <section className="rounded-2xl border border-white/10 bg-[#0E1014] p-6">
          <h3 className="mb-4 text-sm font-semibold text-white/80">
            Wallet Summary
          </h3>
          {wallet ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <UserPropertyItem
                  label="Total Receive"
                  value={fmtCurrency(wallet.totalReceive)}
                />
                <UserPropertyItem
                  label="Total Send"
                  value={fmtCurrency(wallet.totalSend)}
                />
                <UserPropertyItem
                  label="Total Deposit"
                  value={fmtCurrency(wallet.totalDeposit)}
                />
                <UserPropertyItem
                  label="Total Withdraw"
                  value={fmtCurrency(wallet.totalWithdraw)}
                />
                <UserPropertyItem
                  label="Referral Bonus"
                  value={fmtCurrency(wallet.totalReferralBonus)}
                />
              </div>
              <div>
                <UserPropertyItem
                  label="Total Commission"
                  value={fmtCurrency(wallet.totalCommission)}
                />
                <UserPropertyItem
                  label="AI Trade Commission"
                  value={fmtCurrency(wallet.totalAiTradeCommission)}
                />
                <UserPropertyItem
                  label="Live Trade Commission"
                  value={fmtCurrency(wallet.totalLiveTradeCommission)}
                />
                <UserPropertyItem
                  label="This Month Earning"
                  value={fmtCurrency(wallet.thisMonthEarning)}
                />
                <UserPropertyItem
                  label="Today Earning"
                  value={fmtCurrency(wallet.todayEarning)}
                />
              </div>
            </div>
          ) : (
            <div className="text-white/60">No wallet found for this user.</div>
          )}
        </section>

        {/* ────────── raw json (debug/ops) ────────── */}
        <section className="rounded-2xl border border-white/10 bg-[#0E1014] p-6">
          <h3 className="mb-2 text-sm font-semibold text-white/80">Raw JSON</h3>
          <pre className="max-h-96 overflow-auto rounded-xl bg-black/30 p-4 text-xs text-white/80">
            {JSON.stringify({ user, wallet }, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}
