// /app/(auth)/withdrawals/[withdrawId]/page.tsx
"use client";

/* ────────── imports ────────── */
import CopyToClipboard from "@/lib/CopyToClipboard";
import {
  useAdminApproveWithdrawMutation,
  useGetSingleWithdrawRequestQuery,
  useRejectWithdrawMutation,
} from "@/redux/features/withdraw/withdrawApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { toast } from "react-toastify";

import Badge from "@/components/new-ui/Badge";
import Button from "@/components/new-ui/Button";
import Card from "@/components/new-ui/Card";
import { Row } from "@/components/new-ui/DetailsList";

/* ⬇️ শোন: shadcn/ui sheet থেকে named import লাগবে */
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ────────── helpers ────────── */
const fmtUSD = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

export default function SingleWithdraw({
  params,
}: {
  params: { withdrawId: string };
}) {
  const router = useRouter();
  const { withdrawId } = params;

  /* ────────── query ────────── */
  const { data } = useGetSingleWithdrawRequestQuery(withdrawId);
  const withdraw = data?.withdraw;

  const {
    amount,
    netAmount,
    charge,
    customerId,
    name,
    phone,
    status,
    userId,
    _id,
    method,
    createdAt,
  } = withdraw ?? {};

  /* ────────── mutations ────────── */
  const [
    adminApproveWithdraw,
    {
      isLoading: a_isLoading,
      isSuccess: a_isSuccess,
      isError: a_isError,
      error: a_error,
    },
  ] = useAdminApproveWithdrawMutation();

  const [
    rejectWithdraw,
    {
      isSuccess: r_isSuccess,
      isError: r_isError,
      error: r_error,
      isLoading: r_isLoading,
    },
  ] = useRejectWithdrawMutation();

  /* ────────── local state ────────── */
  const [reason, setReason] = useState("Transaction Id not matching");
  const [openApprove, setOpenApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);

  /* ────────── handlers ────────── */
  const handleApprove = async () => adminApproveWithdraw({ id: _id });
  const handleReject = async () => rejectWithdraw({ id: _id, reason });

  /* ────────── effects ────────── */
  useEffect(() => {
    if (a_isSuccess) {
      setOpenApprove(false);
      toast.success("Withdraw approved successfully");
      router.push("/withdrawals/all");
    }
    if (a_isError && a_error) toast.error((a_error as any).data?.message);
  }, [a_isSuccess, a_isError]);

  useEffect(() => {
    if (r_isSuccess) {
      setOpenReject(false);
      toast.success("Withdraw rejected successfully");
      router.push("/withdrawals/all");
    }
    if (r_isError && r_error) toast.error((r_error as any).data?.message);
  }, [r_isSuccess, r_isError]);

  /* ────────── UI ────────── */
  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-5xl px-2 py-4 sm:p-6">
        <Card className="px-4 overflow-hidden">
          {/* ────────── header ────────── */}
          <div className="border-b border-white/10 p-6 text-center">
            <h2 className="text-xl font-semibold">
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
              <span className="text-white/50">Withdraw Details</span>
            </h2>
          </div>

          {/* ────────── content ────────── */}
          <div className="px-2 py-4">
            <div className="rounded-lg border border-white/10">
              <div className="grid border border-white/10 grid-cols-2 gap-2 ">
                <div className="border-r border-white/10">
                  <Row label="User name:">
                    <span className="font-semibold">{name || "-"}</span>
                  </Row>
                </div>
                <div>
                  <Row label="User Id:">
                    <span className="flex items-center gap-2 font-semibold">
                      {customerId || "-"}
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
                </div>
              </div>

              <div className="grid border border-white/10   grid-cols-2 gap-2 ">
                <div className="border-r border-white/10">
                  <Row label="Phone:">
                    <span className="font-semibold">{phone || "-"}</span>
                  </Row>
                </div>
                <div>
                  <Row label="Amount:">
                    <span className="font-semibold">{fmtUSD(amount)}</span>
                  </Row>
                </div>
              </div>

              <div className="grid border border-white/10   grid-cols-2 gap-2 ">
                <div className="border-r border-white/10">
                  <Row label="Net Amount:">
                    <span className="flex items-center gap-2 font-semibold text-emerald-400">
                      {fmtUSD(netAmount)}
                      {netAmount !== undefined && (
                        <CopyToClipboard text={String(netAmount)} />
                      )}
                    </span>
                  </Row>
                </div>
                <div>
                  <Row label="Charge:">
                    <span className="font-semibold">{fmtUSD(charge)}</span>
                  </Row>
                </div>
              </div>

              <Row label="Method:">
                <span className="font-semibold">
                  {method?.name.toUpperCase()}
                </span>
              </Row>
              <Row label="Account Number:">
                <span className="flex items-center gap-2 font-semibold">
                  {method?.accountNumber || "-"}

                  <CopyToClipboard text={String(method?.accountNumber)} />
                </span>
              </Row>

              <Row label="Date Time:">
                <span className="font-semibold">
                  {createdAt
                    ? new Date(createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })
                    : "-"}
                </span>
              </Row>

              <Row label="Status:">
                {status ? (
                  <Badge status={status} />
                ) : (
                  <span className="text-white/60">-</span>
                )}
              </Row>
            </div>

            {/* ────────── actions ────────── */}
            {status === "pending" && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button variant="primary" onClick={() => setOpenApprove(true)}>
                  Approve
                </Button>
                <Button variant="warning" onClick={() => setOpenReject(true)}>
                  Reject
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ────────── Approve Drawer ────────── */}
      <Sheet open={openApprove} onOpenChange={setOpenApprove}>
        <SheetContent
          side="bottom"
          className="w-full max-w-2xl mx-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle>Approve Withdraw</SheetTitle>
            <SheetDescription>
              Confirm to approve this request.
            </SheetDescription>
          </SheetHeader>

          <p className="mt-2 text-sm text-white/70">
            Are you sure you want to approve for{" "}
            <span className="text-white">{fmtUSD(amount)}</span>?
          </p>

          <SheetFooter className="mt-4">
            <button
              onClick={() => setOpenApprove(false)}
              className="rounded-lg px-4 py-2 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={a_isLoading}
              className="rounded-lg px-4 py-2 bg-[#21D3B3] text-[#0B0D12] hover:bg-[#1EC6A7] disabled:opacity-50"
            >
              {a_isLoading ? "Approving..." : "Confirm Approve"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ────────── Reject Drawer ────────── */}
      <Sheet open={openReject} onOpenChange={setOpenReject}>
        <SheetContent
          side="bottom"
          className="w-full max-w-2xl mx-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle>Reject Withdraw</SheetTitle>
            <SheetDescription>
              Provide a short reason and confirm.
            </SheetDescription>
          </SheetHeader>

          {r_isLoading ? (
            <div className="flex items-center justify-center py-6">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/60 border-r-transparent" />
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <label className="text-sm text-white/80">Reason</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                placeholder="Write a short reason…"
              />
              <p className="text-xs text-white/50">
                This note will be stored with the rejection.
              </p>
            </div>
          )}

          <SheetFooter className="mt-4">
            <button
              onClick={() => setOpenReject(false)}
              className="rounded-lg px-4 py-2 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={r_isLoading}
              className="rounded-lg px-4 py-2 bg-[#FF6A1A] text-white hover:bg-[#ff7d38] disabled:opacity-50"
            >
              {r_isLoading ? "Rejecting..." : "Reject"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}
