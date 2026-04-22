"use client";

/* ────────── imports ────────── */
import Button from "@/components/new-ui/Button";
import Card from "@/components/new-ui/Card";
import {
  useCreateManualDepositMutation,
  useLazyPreviewManualDepositQuery,
} from "@/redux/features/deposit/depositApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ✅ react-hot-toast
import { toast } from "react-hot-toast";

/* ────────── helpers ────────── */
const fmtUSD = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

/* ────────── types ────────── */
type PreviewData = {
  ok: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    customerId: string;
    phone?: string;
    is_active?: boolean;
  };
  amount: number;
  current: { m_balance: number; d_balance: number; totalDeposit: number };
  next: { m_balance: number; d_balance: number; totalDeposit: number };
};

export default function AdminManualDepositPage() {
  const router = useRouter();

  /* ────────── local state ────────── */
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [preview, setPreview] = useState<PreviewData | null>(null);

  /* ────────── api hooks ────────── */
  const [triggerPreview, { isLoading: isPreviewLoading }] =
    useLazyPreviewManualDepositQuery();
  const [createDeposit, { isLoading: isCreating }] =
    useCreateManualDepositMutation();

  /* ────────── handlers ────────── */
  const handlePreview = async () => {
    // basic validation
    const amt = Number(amount);
    if (!customerId.trim()) {
      toast.error(customerId);
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error(customerId);
      return;
    }

    try {
      const res = await triggerPreview({
        customerId: customerId.trim(),
        amount: amt,
      }).unwrap();
      setPreview(res);
      toast("Preview loaded");
    } catch (err: any) {
      setPreview(null);
      toast.error(err?.data?.message || "Preview failed");
    }
  };

  const handleConfirm = async () => {
    if (!preview?.ok) return;
    try {
      const res = await createDeposit({
        customerId: preview.user.customerId,
        amount: preview.amount,
        note: note || undefined,
      }).unwrap();

      toast.success(res?.message || "Deposit completed");
      router.push("/deposits/all");
    } catch (err: any) {
      toast.error(err?.data?.message || "Deposit failed");
    }
  };

  const resetAll = () => {
    setPreview(null);
    setAmount("");
    setCustomerId("");
    setNote("");
  };

  /* ────────── UI ────────── */
  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      {/* If you already have a global <Toaster />, remove this */}

      <div className="mx-auto max-w-4xl py-4 md:p-8">
        <h2 className="mb-4 text-base font-semibold tracking-tight">
          Agent Manual Deposit
        </h2>

        {/* ────────── form card ────────── */}
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Customer ID */}
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Customer UID
              </label>
              <input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="U2025XX"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Amount (BDT)
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="100"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>

            {/* Note (optional) */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-white/70">
                Note (optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any note for audit"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>

          {/* ────────── actions ────────── */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              onClick={handlePreview}
              disabled={isPreviewLoading || isCreating}
            >
              {isPreviewLoading ? "Loading..." : "Preview"}
            </Button>

            <Button
              variant="ghost"
              onClick={resetAll}
              disabled={isPreviewLoading || isCreating}
            >
              Reset
            </Button>
          </div>
        </Card>

        {/* ────────── preview panel ────────── */}
        {preview && (
          <Card className="mt-4 p-4">
            {/* ────────── user summary ────────── */}
            <div className="rounded-xl border border-white/10 p-4">
              <h3 className="mb-3 text-sm font-semibold text-neutral-200">
                Preview
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" value={preview.user.name} />
                <Field label="Customer ID" value={preview.user.customerId} />
                <Field label="Email" value={preview.user.email} />
                <Field label="Phone" value={preview.user.phone || "-"} />
              </div>

              {/* ────────── amount ────────── */}
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Stat
                  title="Deposit Amount"
                  value={fmtUSD(preview.amount)}
                  accent
                />
                <Stat
                  title="Current M-Balance"
                  value={fmtUSD(preview.current.m_balance)}
                />
                <Stat
                  title="Next M-Balance"
                  value={fmtUSD(preview.next.m_balance)}
                />
              </div>

              {/* ────────── confirm actions ────────── */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={isCreating}
                >
                  {isCreating ? "Processing..." : "Confirm Deposit"}
                </Button>

                <Button
                  variant="warning"
                  onClick={() => setPreview(null)}
                  disabled={isCreating}
                >
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ────────── tips ────────── */}
        <p className="mt-4 text-xs text-white/50">
          {/* Manual deposit will look like a normal deposit to the user.
          We still mark <code>isManual: true</code> in DB for audit. */}
        </p>
      </div>
    </main>
  );
}

/* ────────── tiny sub-components ────────── */

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border flex items-center gap-3 border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-white/50">
        {label}:
      </div>
      <div className="text-xs">{value || "-"}</div>
    </div>
  );
}

function Stat({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border flex items-center gap-3 border-white/10 bg-white/[0.03] px-3 py-3">
      <div className="text-xs uppercase tracking-wide text-white/50">
        {title}:
      </div>
      <div
        className={` text-xs font-semibold ${accent ? "text-[#21D3B3]" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
