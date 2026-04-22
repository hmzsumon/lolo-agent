"use client";
/* ────────── Approve & Reject bottom-drawers (reusable) ────────── */

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

/* helper */
const fmtUSD = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

type Props = {
  openApprove: boolean;
  setOpenApprove: (v: boolean) => void;
  openReject: boolean;
  setOpenReject: (v: boolean) => void;

  amount?: number;

  a_isLoading?: boolean;
  r_isLoading?: boolean;

  onApprove: () => void;
  onReject: (reason: string) => void;

  defaultReason?: string;
};

export default function WithdrawSheets({
  openApprove,
  setOpenApprove,
  openReject,
  setOpenReject,
  amount,
  a_isLoading,
  r_isLoading,
  onApprove,
  onReject,
  defaultReason = "Transaction Id not matching",
}: Props) {
  const [reason, setReason] = useState(defaultReason);

  return (
    <>
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
              className="rounded-xl px-4 py-2 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onApprove}
              disabled={a_isLoading}
              className="rounded-xl px-4 py-2 bg-[#21D3B3] text-[#0B0D12] hover:bg-[#1EC6A7] disabled:opacity-50"
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
              className="rounded-xl px-4 py-2 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => onReject(reason)}
              disabled={r_isLoading}
              className="rounded-xl px-4 py-2 bg-[#FF6A1A] text-white hover:bg-[#ff7d38] disabled:opacity-50"
            >
              {r_isLoading ? "Rejecting..." : "Reject"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
