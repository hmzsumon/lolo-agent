"use client";

import AccountSelect from "@/components/transfer/AccountSelect";
import AmountInput from "@/components/transfer/AmountInput";
import SubmitButton from "@/components/transfer/SubmitButton";
import {
  LiteAccount,
  useCreateTransferMutation,
  useListMyAccountsLiteQuery,
} from "@/redux/features/transfer/transferApi";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function TransferForm() {
  const router = useRouter();
  const { user } = useSelector((s: any) => s.auth);

  const { data, isLoading, isError } = useListMyAccountsLiteQuery();
  const accounts: LiteAccount[] = data?.items || [];

  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  const fromAcc = useMemo(
    () => accounts.find((a) => a.id === fromId),
    [accounts, fromId]
  );
  const toAcc = useMemo(
    () => accounts.find((a) => a.id === toId),
    [accounts, toId]
  );

  const mainBalance = Number(user?.m_balance || 0);
  const mainCurrency = user?.currency || "USD";

  const [submit, { isLoading: isSubmitting }] = useCreateTransferMutation();

  // ব্যালান্স/কারেন্সি ঠিক করো (main হলে user, নইলে account)
  const fromCurrency =
    fromId === "main" ? mainCurrency : fromAcc?.currency || "USD";
  const fromBalance =
    fromId === "main" ? mainBalance : Number(fromAcc?.balance || 0);

  const canSubmit =
    !!fromId &&
    !!toId &&
    fromId !== toId &&
    amount > 0 &&
    fromBalance >= amount;

  async function onSubmit() {
    if (!canSubmit) {
      toast.error("Please complete the form correctly");
      return;
    }
    try {
      // 👇 backend-এ 'main' id সাপোর্ট করবে
      await submit({ fromId, toId, amount }).unwrap();
      toast.success("Transfer completed");
      setAmount(0);
      router.push("/accounts");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Transfer failed");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        Loading accounts…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-red-400">
        Failed to load accounts
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 space-y-4">
      <div className="text-lg font-bold text-neutral-200">Transfer</div>

      {/* From */}
      <AccountSelect
        label="Transfer out account"
        accounts={accounts}
        value={fromId}
        onChange={(v) => {
          setFromId(v);
          if (v === toId) setToId("");
        }}
      />

      <div className="text-sm text-neutral-400">
        Available amount:&nbsp;
        <span className="text-neutral-200">
          {fromCurrency} {fromBalance.toFixed(2)}
        </span>
      </div>

      {/* To */}
      <AccountSelect
        label="Transfer in account"
        accounts={accounts}
        value={toId}
        excludeId={fromId}
        onChange={setToId}
      />

      <AmountInput
        currency={fromCurrency}
        value={amount}
        onChange={setAmount}
        max={fromBalance}
      />

      <div className="pt-1">
        <SubmitButton
          disabled={!canSubmit || isSubmitting}
          loading={isSubmitting}
          onClick={onSubmit}
        >
          Submit
        </SubmitButton>
      </div>

      <div className="text-xs text-neutral-500">
        If the margin ratio is less than 150%, it will not be executed.
      </div>
    </div>
  );
}
