// components/profile/AccountSummary.tsx
"use client";

/* ── top summary cards: status + deposit limit ────────────── */
import { CheckCircle2, CircleAlert, DollarSign } from "lucide-react";

export default function AccountSummary({
  status,
  completed,
  total,
  depositLimitUSD,
}: {
  status: "verified" | "not_verified";
  completed: number;
  total: number;
  depositLimitUSD: number; // 0 বা Infinity
}) {
  const ok = status === "verified";

  return (
    <div className="space-y-4">
      {/* ── status card ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
            {ok ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            ) : (
              <CircleAlert className="h-6 w-6 text-red-400" />
            )}
          </div>
          <div>
            <div className="text-sm text-neutral-400">Status</div>
            <div
              className={`text-xl font-bold ${
                ok ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {ok ? "Verified" : "Not verified"}
            </div>
            <div className="text-sm text-neutral-400">
              {completed}/{total} steps complete
            </div>
          </div>
        </div>
      </div>

      {/* ── deposit limit card ──────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
            <DollarSign className="h-6 w-6 text-neutral-300" />
          </div>
          <div>
            <div className="text-sm text-neutral-400">Deposit limit</div>
            <div className="text-2xl font-extrabold text-white">
              {depositLimitUSD === Infinity
                ? "Unlimited"
                : `${depositLimitUSD} USD`}
            </div>
            {depositLimitUSD !== Infinity && (
              <div className="text-sm text-neutral-400">
                Verify your account to unlock limits
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
