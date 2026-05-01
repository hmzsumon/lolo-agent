"use client";

import {
  useCreateAgentFloatRequestMutation,
  useGetAgentDepositPaymentMethodsQuery,
} from "@/redux/features/agent/agentFloatApi";
import { fetchBaseQueryError } from "@/redux/services/helpers";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleLeft } from "react-icons/fa";

const presetAmounts = [10000, 15000, 20000, 25000, 30000];

type AgentDepositPaymentMethod = {
  _id: string;
  title?: string;
  methodName: string;
  methodType?: "agent" | "personal";
  accountNumber?: string;
  instructions?: string;
  isActive?: boolean;
};

export default function BkashPage() {
  const router = useRouter();

  /*
   * এই mutation দিয়ে agent deposit/topup request create হবে।
   * Admin পরে float requests page থেকে approve/reject করবে।
   */
  const [
    createAgentFloatRequest,
    {
      isLoading: isCreating,
      isError: isCreateError,
      isSuccess: isCreateSuccess,
      error: createError,
    },
  ] = useCreateAgentFloatRequestMutation();

  /*
   * Admin-created agent deposit payment methods load করা হচ্ছে।
   * Backend response যদি data অথবা paymentMethods নামে আসে—দুইটাই support করা হলো।
   */
  const {
    data: methodsRes,
    isLoading: isMethodsLoading,
    isError: isMethodsError,
    refetch: refetchMethods,
  } = useGetAgentDepositPaymentMethodsQuery(undefined);

  const paymentMethods: AgentDepositPaymentMethod[] =
    methodsRes?.data || methodsRes?.paymentMethods || [];

  const [amount, setAmount] = useState<number | "">("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<AgentDepositPaymentMethod>();
  const [txnId, setTxnId] = useState("");

  const min = 10000;
  const max = 30000;

  /*
   * Bkash method auto select করা হচ্ছে।
   * আগে active Bkash agent method নিবে।
   * না থাকলে যেকোনো active Bkash method নিবে।
   */
  useEffect(() => {
    if (!paymentMethods?.length) return;

    const bkashAgentMethod = paymentMethods.find(
      (method) =>
        method.methodName?.toLowerCase() === "bkash" &&
        method.methodType === "agent" &&
        method.isActive !== false,
    );

    const bkashAnyMethod = paymentMethods.find(
      (method) =>
        method.methodName?.toLowerCase() === "bkash" &&
        method.isActive !== false,
    );

    setPaymentMethod(bkashAgentMethod || bkashAnyMethod);
  }, [paymentMethods]);

  const amountError =
    amount !== "" && (Number(amount) < min || Number(amount) > max)
      ? `Amount must be between ${min} and ${max} BDT`
      : "";

  const isValid = useMemo(() => {
    if (isCreating || isMethodsLoading) return false;
    if (!paymentMethod?._id) return false;
    if (amount === "" || !!amountError) return false;
    if (!customerNumber.trim()) return false;
    if (!txnId.trim()) return false;

    return true;
  }, [
    amount,
    amountError,
    customerNumber,
    txnId,
    paymentMethod?._id,
    isCreating,
    isMethodsLoading,
  ]);

  const copyAgent = () => {
    if (!paymentMethod?.accountNumber) return;

    navigator.clipboard
      .writeText(paymentMethod.accountNumber)
      .then(() => toast.success("Number copied"))
      .catch(() => toast.error("Copy failed"));
  };

  /*
   * Submit Handler
   * এখানে user deposit API call হবে না।
   * Agent float/topup request create হবে।
   * Request successful হলে history page-এ redirect করবে।
   */
  const handleSubmit = async () => {
    if (!isValid || !paymentMethod?._id) return;

    try {
      await createAgentFloatRequest({
        type: "topup",
        amount: Number(amount),
        txnId: txnId.trim(),

        // Admin-created payment method id
        paymentMethodId: paymentMethod._id,

        // Agent যে number/account থেকে টাকা পাঠিয়েছে
        senderNumber: customerNumber.trim(),

        // Optional note, admin request details এ দেখতে পারবে
        note: `Bkash ${paymentMethod.methodType || "agent"} deposit request`,
      }).unwrap();

      toast.success("Agent deposit request submitted successfully!");

      setAmount("");
      setCustomerNumber("");
      setTxnId("");
      refetchMethods();

      /*
       * Request successful হওয়ার পরে history page-এ যাবে।
       * আপনার route যদি /agent/deposit-history হয়,
       * তাহলে নিচের path change করে দিন।
       */
      router.push("/agent-deposit-history");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.data?.error ||
          "Agent deposit request failed",
      );
    }
  };

  /*
   * API error fallback toast
   */
  useEffect(() => {
    if (isCreateError) {
      toast.error(
        (createError as fetchBaseQueryError)?.data?.error ||
          "Deposit request failed",
      );
    }
  }, [isCreateError, createError]);

  const methodTitle =
    paymentMethod?.methodType === "personal"
      ? "বিকাশ পার্সোনাল নম্বর"
      : "বিকাশ এজেন্ট নম্বর";

  return (
    <div>
      <div className="mt-2">
        <button
          className="text-gray-100 text-sm hover:underline flex items-center gap-1"
          onClick={() => router.back()}
        >
          <FaAngleLeft />
          Back
        </button>
      </div>

      <div className="min-h-screen bg-transparent text-white flex items-start justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-[#00493B] bg-[#01241D] shadow-xl">
          {/* Top notice bar */}
          <div className="rounded-t-lg bg-[#2F69B1] px-4 py-3 text-sm">
            <p className="leading-snug">
              <b>Before making a request</b>, please transfer funds within 10
              minutes using the payment details specified below.
            </p>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Payment method loading/error state */}
            {isMethodsLoading ? (
              <p className="rounded border border-[#2a7565] bg-[#031a15] px-3 py-2 text-sm text-gray-300">
                Loading payment method...
              </p>
            ) : null}

            {isMethodsError ? (
              <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                Payment method load failed. Please refresh.
              </p>
            ) : null}

            {!isMethodsLoading && !paymentMethod ? (
              <p className="rounded border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
                No active Bkash deposit method found. Please contact admin.
              </p>
            ) : null}

            {/* Payment number */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold">{methodTitle}</h2>

                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <span className="font-mono tracking-wide">
                    {paymentMethod?.accountNumber || "N/A"}
                  </span>

                  <button
                    onClick={copyAgent}
                    disabled={!paymentMethod?.accountNumber}
                    className="inline-flex items-center gap-1 rounded border border-[#2a7565] px-2 py-0.5 text-xs hover:bg-[#00493B] disabled:cursor-not-allowed disabled:opacity-50"
                    title="Copy number"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      className="fill-current"
                    >
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                    </svg>
                    Copy
                  </button>
                </div>

                {paymentMethod?.title ? (
                  <p className="text-xs text-gray-400">{paymentMethod.title}</p>
                ) : null}

                {paymentMethod?.methodType ? (
                  <p className="text-xs capitalize text-gray-400">
                    Type: {paymentMethod.methodType}
                  </p>
                ) : null}
              </div>
            </div>

            {paymentMethod?.instructions ? (
              <p className="rounded border border-[#2a7565] bg-[#031a15] px-3 py-2 text-xs leading-relaxed text-gray-300">
                {paymentMethod.instructions}
              </p>
            ) : null}

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Amount{" "}
                <span className="text-gray-300">
                  (Min {min.toFixed(2)} / Max {max.toLocaleString()} BDT)
                </span>
              </label>

              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={min}
                  max={max}
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="0.00"
                  className="w-full rounded border border-[#00493B] bg-[#031a15] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2a7565]"
                />

                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(value)}
                      className="rounded border border-[#2a7565] bg-transparent px-3 py-2 text-sm hover:bg-[#00493B]"
                    >
                      {value.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {amountError ? (
                <p className="text-xs text-red-400">{amountError}</p>
              ) : (
                <p className="text-xs text-gray-400">
                  Example: 10000, 15000, 20000…
                </p>
              )}
            </div>

            {/* Sender bKash account number */}
            <div className="space-y-1">
              <label className="text-sm font-semibold">
                আপনার বিকাশ অ্যাকাউন্ট নম্বর :
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded border border-[#00493B] bg-[#031a15] px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-[#2a7565]"
                />
              </div>
            </div>

            {/* Transaction ID */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-sm font-semibold">
                  Transaction ID :
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={20}
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g., 7AB12C3D45"
                  className="w-full rounded border border-[#00493B] bg-[#031a15] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2a7565]"
                />
              </div>
            </div>

            {/* Footer note */}
            <p className="text-xs leading-relaxed text-gray-300">
              Please recheck all information that is written in the deposit
              fields. If the relevant payment information like: [TxID, Txn ID,
              TrxID, UTR, Reference No.] is wrong – the transaction can be
              delayed.
            </p>

            {/* Confirm */}
            <button
              disabled={!isValid}
              className="mt-2 w-full rounded bg-[#4CAF50] py-3 text-center text-sm font-semibold text-white transition enabled:hover:bg-[#3ea145] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmit}
            >
              {isCreating ? "SUBMITTING..." : "CONFIRM"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
