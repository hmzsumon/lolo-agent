"use client";

/* ─────────────────────────────────────────────────────────────
 * Agent Deposit / Float Topup UI
 * - Admin-created active payment method list দেখায়।
 * - Agent টাকা পাঠানোর পর txnId দিয়ে topup request submit করে।
 * - Admin পরে /float-requests থেকে approve/reject করবে।
 * ──────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AgentDepositPaymentMethod,
  useCreateAgentFloatRequestMutation,
  useGetAgentDepositPaymentMethodsQuery,
  useGetMyFloatRequestsQuery,
} from "@/redux/features/agent/agentFloatApi";

export default function AgentDepositPage() {
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [note, setNote] = useState("");

  const {
    data: methodsRes,
    isLoading: methodsLoading,
    refetch: refetchMethods,
  } = useGetAgentDepositPaymentMethodsQuery();
  const methods: AgentDepositPaymentMethod[] = methodsRes?.data || [];

  const selectedMethod = useMemo(
    () => methods.find((m) => m._id === paymentMethodId),
    [methods, paymentMethodId],
  );

  const { data: requestsRes, refetch: refetchRequests } =
    useGetMyFloatRequestsQuery({ status: "" });
  const requests = requestsRes?.data || [];

  const [createRequest, createState] = useCreateAgentFloatRequestMutation();

  const submit = async () => {
    const reqAmount = Number(amount);

    if (!paymentMethodId) return toast.error("Payment method select করুন");
    if (!reqAmount || reqAmount <= 0) return toast.error("Valid amount দিন");
    if (!txnId.trim()) return toast.error("Transaction ID দিন");

    try {
      await createRequest({
        type: "topup",
        amount: reqAmount,
        txnId: txnId.trim(),
        paymentMethodId,
        senderNumber: senderNumber.trim(),
        note: note.trim(),
      }).unwrap();

      toast.success(
        "Deposit request submitted. Admin approve করলে balance update হবে।",
      );
      setAmount("");
      setTxnId("");
      setSenderNumber("");
      setNote("");
      refetchRequests();
    } catch (e: any) {
      toast.error(e?.data?.message || "Request submit failed");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Agent Deposit</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Admin provided method এ payment করে Transaction ID দিয়ে request
            submit করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <Card className="border-neutral-800 bg-neutral-900/60 text-white lg:col-span-5">
            <CardHeader>
              <CardTitle>Submit Deposit Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-neutral-400">Payment Method</p>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none"
                >
                  <option value="">Select method</option>
                  {methods.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} - {m.methodName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMethod ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm">
                  <p className="font-semibold text-emerald-200">
                    {selectedMethod.title}
                  </p>
                  <p className="mt-1 text-emerald-100/80">
                    Method: {selectedMethod.methodName}
                  </p>
                  <p className="mt-1 text-emerald-100/80">
                    Account: {selectedMethod.accountNumber}
                  </p>
                  {selectedMethod.instructions ? (
                    <p className="mt-2 text-xs text-emerald-100/70">
                      {selectedMethod.instructions}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <p className="mb-1 text-xs text-neutral-400">Amount</p>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Deposit amount"
                  inputMode="decimal"
                  className="border-neutral-800 bg-neutral-950"
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-neutral-400">Transaction ID</p>
                <Input
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="Payment transaction/reference ID"
                  className="border-neutral-800 bg-neutral-950"
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-neutral-400">
                  Sender Number / Account (optional)
                </p>
                <Input
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="যে number/account থেকে পাঠিয়েছেন"
                  className="border-neutral-800 bg-neutral-950"
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-neutral-400">Note (optional)</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional note"
                  className="min-h-20 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={submit}
                  disabled={createState.isLoading || methodsLoading}
                  className="flex-1"
                >
                  {createState.isLoading
                    ? "Submitting..."
                    : "Submit Deposit Request"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => refetchMethods()}
                  disabled={methodsLoading}
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-800 bg-neutral-900/60 text-white lg:col-span-7">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Deposit Requests</CardTitle>
              <Button variant="secondary" onClick={() => refetchRequests()}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-sm text-neutral-400">No requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {requests.map((r: any) => (
                    <div
                      key={r._id}
                      className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              {String(r.type || "").toUpperCase()} • {r.amount}
                            </p>
                            <span
                              className={
                                r.status === "approved"
                                  ? "rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-300"
                                  : r.status === "rejected"
                                    ? "rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300"
                                    : "rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300"
                              }
                            >
                              {r.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-neutral-400">
                            Txn: {r.txnId}
                          </p>
                          {r.paymentMethodTitle ? (
                            <p className="mt-1 text-xs text-neutral-400">
                              Method: {r.paymentMethodTitle} (
                              {r.paymentMethodName}) • {r.paymentAccountNumber}
                            </p>
                          ) : null}
                          {r.adminNote ? (
                            <p className="mt-1 text-xs text-neutral-500">
                              Admin note: {r.adminNote}
                            </p>
                          ) : null}
                        </div>
                        <p className="text-xs text-neutral-500">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
