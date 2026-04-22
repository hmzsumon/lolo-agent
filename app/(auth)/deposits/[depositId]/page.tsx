"use client";

/* ────────── imports ────────── */
import Card from "@/components/new-ui/Card";
import { Row } from "@/components/new-ui/DetailsList";
import CopyToClipboard from "@/lib/CopyToClipboard";
import Link from "next/link";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

/* ────────── API ────────── */
import {
  useApproveDepositByAgentMutation,
  useGetSingleDepositRequestQuery,
  useRejectDepositByAgentMutation,
} from "@/redux/features/deposit/depositApi";

/* ────────── toast ────────── */
import toast from "react-hot-toast";

/* ────────── react ────────── */
import { useEffect, useMemo, useState } from "react";

/* ────────── helpers ────────── */
// /* ────────── Comments lik this ────────── */
const fmtUSD = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

const fmtDate = (d: any) => {
  const iso =
    typeof d === "string"
      ? d
      : d?.$date
        ? d.$date
        : d?._seconds
          ? new Date(d._seconds * 1000).toISOString()
          : "";
  return iso
    ? new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : "-";
};

const dataUrlFromBase64 = (b64?: string) =>
  b64 ? `data:image/png;base64,${b64}` : "";

/* ────────── types (optional) ────────── */
type Deposit = {
  _id: string;
  userId?: string;
  orderId?: string;
  name?: string;
  phone?: string;
  email?: string;
  customerId?: string;
  amount: number;
  charge?: number;
  receivedAmount?: number;
  destinationAddress?: string;
  qrCode?: string;
  chain?: string;
  status: "pending" | "approved" | "rejected" | "failed";
  isApproved?: boolean;
  isExpired?: boolean;
  confirmations?: number;
  isManual?: boolean;
  callbackUrl?: string;
  note?: string;
  createdAt?: string | { $date: string };
  updatedAt?: string | { $date: string };
  approvedAt?: string | { $date: string };
  callbackReceivedAt?: string | { $date: string };
  txId?: string;

  destinationNumber?: string;

  walletTitle?: string;
  walletType?: string;

  walletAddress?: string;
  walletTag?: string;
  walletNetwork?: string;
};

/* ────────── confirm modal ────────── */
function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  loading,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      {/* ────────── overlay ────────── */}
      <div onClick={onClose} className="fixed inset-0 z-[80] bg-black/60" />

      {/* ────────── modal ────────── */}
      <div className="fixed left-1/2 top-1/2 z-[81] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0B0D12] p-5 shadow-2xl">
        <div className="text-base font-semibold text-white">{title}</div>
        {description && (
          <div className="mt-1 text-sm text-white/70">{description}</div>
        )}

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg border border-emerald-400/30 bg-emerald-400/15 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/20 disabled:opacity-60"
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </>
  );
}

/* ────────── page ────────── */
export default function DepositDetailsPage({
  params,
}: {
  params: { depositId: string };
}) {
  const { depositId } = params;

  /* ────────── queries ────────── */
  const { data, isLoading, refetch } =
    useGetSingleDepositRequestQuery(depositId);
  const deposit = (data?.deposit ?? data) as Deposit | undefined;

  /* ────────── mutations ────────── */
  const [approveDeposit, { isLoading: isApproving }] =
    useApproveDepositByAgentMutation();

  const [rejectDeposit, { isLoading: isRejecting }] =
    useRejectDepositByAgentMutation();

  /* ────────── modal states ────────── */
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  /* ────────── amount edit ────────── */
  const [editAmount, setEditAmount] = useState<string>("");
  const [savedAmount, setSavedAmount] = useState<number | null>(null);
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  const {
    amount,
    name,
    phone,
    customerId,
    userId,
    status,

    destinationAddress,
    qrCode,
    orderId,
    txId,

    isApproved,
    isExpired,

    note,
    createdAt,

    approvedAt,

    receivedAmount,

    destinationNumber,

    walletTitle,

    walletType,
  } = deposit ?? {};

  /* ────────── sync server amount -> local states ────────── */
  useEffect(() => {
    if (amount === undefined || amount === null) return;

    /* ────────── initial load ────────── */
    if (savedAmount === null) setSavedAmount(Number(amount));

    /* ────────── keep input sync only when not editing ────────── */
    if (!isEditingAmount) setEditAmount(String(savedAmount ?? amount));
  }, [amount]);

  /* ────────── guards ────────── */
  const canTakeAction = useMemo(() => {
    return status === "pending" && !isApproved && !isExpired;
  }, [status, isApproved, isExpired]);

  /* ────────── reject preset reasons ────────── */
  const rejectPresets = useMemo(
    () => [
      "Wrong Transaction ID",
      "Transaction ID already used",
      "Amount mismatch",
      "Sender number mismatch",
      "Invalid payment proof",
      "Suspicious activity",
      "Payment not received",
    ],
    [],
  );

  /* ────────── amount for UI ────────── */
  const displayAmount = useMemo(() => {
    /* ────────── pending screen should show edited amount if exists ────────── */
    if (status === "pending" && savedAmount !== null) return savedAmount;
    return amount ?? 0;
  }, [status, savedAmount, amount]);

  /* ────────── actions ────────── */
  const handleApproveConfirm = async () => {
    if (!depositId) return;

    /* ────────── validate edited amount ────────── */
    const finalAmount = Number(savedAmount ?? editAmount);
    if (!finalAmount || Number.isNaN(finalAmount) || finalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const res: any = await approveDeposit({
        depositId,
        amount: finalAmount,
      }).unwrap();

      toast.success(res?.message || "Deposit approved ✅");

      setApproveOpen(false);

      /* ────────── after approve, server amount becomes source of truth ────────── */
      setSavedAmount(null);
      setEditAmount("");

      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Approve failed");
    }
  };

  const handleRejectConfirm = async () => {
    if (!depositId) return;

    const reason = String(rejectReason || "").trim();
    if (!reason) {
      toast.error("Reject reason is required");
      return;
    }

    try {
      const res: any = await rejectDeposit({ depositId, reason }).unwrap();
      toast.success(res?.message || "Deposit rejected ❌");

      setRejectOpen(false);
      setRejectReason("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Reject failed");
    }
  };

  /* ────────── preset click ────────── */
  const setPresetReason = (text: string) => {
    /* ────────── if already has text, append nicely ────────── */
    if (String(rejectReason || "").trim()) {
      setRejectReason((prev) => `${prev}\n- ${text}`);
      return;
    }
    setRejectReason(text);
  };

  /* ────────── amount edit handlers ────────── */
  const onClickEdit = () => {
    setIsEditingAmount(true);
    setEditAmount(String(savedAmount ?? amount ?? ""));
  };

  const onClickCancelEdit = () => {
    setEditAmount(String(savedAmount ?? amount ?? ""));
    setIsEditingAmount(false);
  };

  const onClickDoneEdit = () => {
    const v = Number(editAmount);
    if (!v || Number.isNaN(v) || v <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    /* ────────── save for UI + approve ────────── */
    setSavedAmount(v);
    setIsEditingAmount(false);
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-5xl py-4 sm:p-6">
        <Card className="overflow-hidden p-0">
          {/* ────────── header ────────── */}
          <div className="border-b border-white/10 p-2 text-center">
            <h2 className="text-base font-semibold">
              <span
                className={`mr-2 ${
                  status === "pending"
                    ? "text-[#FF6A1A]"
                    : status === "approved"
                      ? "text-emerald-400"
                      : "text-rose-400"
                }`}
              >
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : ""}
              </span>
              <span className="text-white/50">Deposit Details</span>
            </h2>
          </div>

          {/* ────────── content ────────── */}
          <div className="py-4">
            <div className="rounded-xl border border-white/10">
              {/* User */}
              <Row label="User name:">
                <span className="font-semibold">{name ?? "-"}</span>
              </Row>

              <Row label="User Id:">
                <span className="flex items-center gap-2 font-semibold">
                  {customerId ?? "-"}
                  {userId && (
                    <Link
                      href={`/users/${userId}`}
                      className="text-[#21D3B3]"
                      title="Open profile"
                    >
                      <FaArrowUpRightFromSquare />
                    </Link>
                  )}
                </span>
              </Row>

              <Row label="Phone:">
                <span className="font-semibold">{phone ?? "-"}</span>
              </Row>

              {/* Amounts */}
              <Row label="Amount:">
                {/* ────────── mobile responsive layout ────────── */}
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {/* ────────── left: value / input ────────── */}
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
                    {!isEditingAmount ? (
                      <span className="font-semibold">
                        {fmtUSD(displayAmount)}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          inputMode="decimal"
                          className="w-40 max-w-[60vw] rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white outline-none focus:border-white/20"
                          placeholder="Amount"
                        />
                        <span className="text-xs text-white/50">BDT</span>
                      </div>
                    )}
                  </div>

                  {/* ────────── right: action buttons (wrap/stack on mobile) ────────── */}
                  {canTakeAction && (
                    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                      {!isEditingAmount ? (
                        <button
                          type="button"
                          onClick={onClickEdit}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 sm:w-auto"
                        >
                          Edit
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={onClickCancelEdit}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 sm:w-auto"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={onClickDoneEdit}
                            className="w-full rounded-lg border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20 sm:w-auto"
                          >
                            Done
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Row>

              <Row label="Tx ID:">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 font-semibold">
                    {txId ?? "-"}
                    {txId && <CopyToClipboard text={txId} />}
                  </span>

                  <span className="text-xs text-white/50">
                    ({walletTitle} - {walletType})
                  </span>
                </div>
              </Row>

              <Row label="Destination Number:">
                <span className="flex items-center gap-2 font-semibold">
                  {destinationNumber ?? "-"}
                  {destinationAddress && (
                    <CopyToClipboard text={destinationAddress} />
                  )}
                </span>
              </Row>

              <Row label="Order ID:">
                <span className="flex items-center gap-2 font-semibold">
                  {orderId ?? "-"}
                  {orderId && <CopyToClipboard text={orderId} />}
                </span>
              </Row>

              <Row label="Received Amount:">
                <span className="flex items-center gap-2 font-semibold text-emerald-400">
                  {fmtUSD(receivedAmount)}
                  {receivedAmount !== undefined && (
                    <CopyToClipboard text={String(receivedAmount)} />
                  )}
                </span>
              </Row>

              <Row label="Note:">
                <span className="text-white/80">{note ?? "-"}</span>
              </Row>

              <Row label="Created At:">
                <span className="font-semibold">{fmtDate(createdAt)}</span>
              </Row>

              <Row label="Approved At:">
                <span className="font-semibold">{fmtDate(approvedAt)}</span>
              </Row>

              {qrCode && (
                <Row label="QR Code:">
                  <div className="flex items-center gap-3">
                    <img
                      src={dataUrlFromBase64(qrCode)}
                      alt="Payment QR"
                      className="h-24 w-24 rounded-lg border border-white/10 bg-white/5 object-contain p-1"
                    />
                    <span className="text-xs text-white/60">Scan to pay</span>
                  </div>
                </Row>
              )}

              <Row label="Status:">
                <span
                  className={
                    status === "pending"
                      ? "rounded-lg border border-[#FF8A1A]/30 bg-[#FF8A1A]/15 px-2 py-0.5 text-xs text-[#FF8A1A]"
                      : status === "approved"
                        ? "rounded-lg border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-400"
                        : "rounded-lg border border-rose-400/30 bg-rose-400/15 px-2 py-0.5 text-xs text-rose-400"
                  }
                >
                  {status ?? "-"}
                </span>
              </Row>
            </div>

            {/* ────────── bottom actions ────────── */}
            {canTakeAction && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setRejectOpen(true)}
                  disabled={!canTakeAction || isApproving || isRejecting}
                  className="rounded-lg border border-rose-400/30 bg-rose-400/15 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-400/20 disabled:opacity-50"
                >
                  Reject
                </button>

                <button
                  onClick={() => setApproveOpen(true)}
                  disabled={!canTakeAction || isApproving || isRejecting}
                  className="rounded-lg border border-emerald-400/30 bg-emerald-400/15 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/20 disabled:opacity-50"
                >
                  Approve
                </button>

                <button
                  onClick={() => refetch()}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ────────── Approve Confirm Modal ────────── */}
      <ConfirmModal
        open={approveOpen}
        title="Approve Deposit?"
        description="Please verify the amount and transaction ID before approving."
        confirmText="Confirm Approve"
        onConfirm={handleApproveConfirm}
        onClose={() => setApproveOpen(false)}
        loading={isApproving}
      >
        {/* ────────── highlighted info ────────── */}
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-emerald-200">AMOUNT</div>
            <div className="text-sm font-bold text-emerald-200">
              {fmtUSD(Number(savedAmount ?? editAmount ?? amount ?? 0))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-emerald-200">TX ID</div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-bold text-emerald-200">
                {txId ?? "-"}
              </div>
              {txId && <CopyToClipboard text={txId} />}
            </div>
          </div>
        </div>
      </ConfirmModal>

      {/* ────────── Reject Confirm Modal ────────── */}
      <ConfirmModal
        open={rejectOpen}
        title="Reject Deposit?"
        description="Select a reason or write your own."
        confirmText="Confirm Reject"
        onConfirm={handleRejectConfirm}
        onClose={() => {
          setRejectOpen(false);
          setRejectReason("");
        }}
        loading={isRejecting}
      >
        {/* ────────── preset reasons ────────── */}
        <div className="flex flex-wrap gap-2">
          {rejectPresets.map((txt) => (
            <button
              key={txt}
              type="button"
              onClick={() => setPresetReason(txt)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              {txt}
            </button>
          ))}
        </div>

        {/* ────────── reason textarea ────────── */}
        <div className="mt-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Type reject reason..."
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
          />
          <div className="mt-1 text-[11px] text-white/50">
            Tip: You can edit the selected reason or add more details.
          </div>
        </div>
      </ConfirmModal>
    </main>
  );
}
