"use client";

import { useGetMyFloatRequestsQuery } from "@/redux/features/agent/agentFloatApi";
import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa";

/*
 * Agent Deposit History Page
 * এখানে agent নিজের deposit/topup request history দেখতে পারবে।
 * Admin approve/reject করলে status এখানেই update হয়ে দেখাবে।
 */

type FloatRequest = {
  _id: string;
  type?: "topup" | "return";
  amount?: number;
  status?: "pending" | "approved" | "rejected";
  txnId?: string;
  senderNumber?: string;
  note?: string;
  adminNote?: string;

  paymentMethodTitle?: string;
  paymentMethodName?: string;
  paymentMethodType?: "agent" | "personal";
  paymentAccountNumber?: string;

  createdAt?: string;
  updatedAt?: string;
};

const getStatusClass = (status?: string) => {
  if (status === "approved") {
    return "bg-green-500/15 text-green-300 border-green-500/30";
  }

  if (status === "rejected") {
    return "bg-red-500/15 text-red-300 border-red-500/30";
  }

  return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
};

const getStatusText = (status?: string) => {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
};

const formatDate = (date?: string) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AgentDepositHistoryPage() {
  const router = useRouter();

  /*
   * Agent এর নিজের float/topup requests load করা হচ্ছে।
   * status empty দিলে সব request আসবে।
   */
  const { data, isLoading, isError, refetch } = useGetMyFloatRequestsQuery({
    status: "",
  });

  const requests: FloatRequest[] = data?.data || data?.requests || [];

  /*
   * শুধু deposit/topup type দেখানো হচ্ছে।
   * যদি backend already only topup return করে, তবুও এটা safe থাকবে।
   */
  const depositRequests = requests.filter(
    (request) => !request.type || request.type === "topup",
  );

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-4">
        {/* Back button */}
        <div className="mb-4">
          <button
            className="flex items-center gap-1 text-sm text-gray-100 hover:underline"
            onClick={() => router.back()}
          >
            <FaAngleLeft />
            Back
          </button>
        </div>

        {/* Page header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agent Deposit History</h1>
            <p className="mt-1 text-sm text-gray-400">
              আপনার deposit request, transaction details এবং approval status
              এখানে দেখাবে।
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="w-fit rounded border border-[#2a7565] bg-[#01241D] px-4 py-2 text-sm hover:bg-[#00493B]"
          >
            Refresh
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="rounded-lg border border-[#00493B] bg-[#01241D] p-5 text-sm text-gray-300">
            Loading deposit history...
          </div>
        ) : null}

        {/* Error state */}
        {isError ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-300">
            Deposit history load failed. Please try again.
          </div>
        ) : null}

        {/* Empty state */}
        {!isLoading && !isError && depositRequests.length === 0 ? (
          <div className="rounded-lg border border-[#00493B] bg-[#01241D] p-5 text-sm text-gray-300">
            No deposit request found.
          </div>
        ) : null}

        {/* History list */}
        {!isLoading && !isError && depositRequests.length > 0 ? (
          <div className="space-y-4">
            {depositRequests.map((request) => (
              <div
                key={request._id}
                className="rounded-lg border border-[#00493B] bg-[#01241D] p-4 shadow-lg"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        ৳ {Number(request.amount || 0).toLocaleString()}
                      </h2>

                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                          request.status,
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    <div className="grid gap-1 text-sm text-gray-300">
                      <p>
                        <span className="text-gray-500">Transaction ID:</span>{" "}
                        <span className="font-mono text-gray-100">
                          {request.txnId || "N/A"}
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-500">Sender Number:</span>{" "}
                        {request.senderNumber || "N/A"}
                      </p>

                      <p>
                        <span className="text-gray-500">Request Type:</span>{" "}
                        {String(request.type || "topup").toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Right date */}
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500">Requested At</p>
                    <p className="text-sm text-gray-300">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Payment method details */}
                <div className="mt-4 rounded-md border border-[#2a7565]/60 bg-[#031a15] p-3">
                  <p className="mb-2 text-sm font-semibold text-gray-100">
                    Payment Method Details
                  </p>

                  <div className="grid gap-1 text-sm text-gray-300 sm:grid-cols-2">
                    <p>
                      <span className="text-gray-500">Method Title:</span>{" "}
                      {request.paymentMethodTitle || "N/A"}
                    </p>

                    <p>
                      <span className="text-gray-500">Method Name:</span>{" "}
                      {request.paymentMethodName || "N/A"}
                    </p>

                    <p>
                      <span className="text-gray-500">Method Type:</span>{" "}
                      <span className="capitalize">
                        {request.paymentMethodType || "N/A"}
                      </span>
                    </p>

                    <p>
                      <span className="text-gray-500">Account Number:</span>{" "}
                      {request.paymentAccountNumber || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {request.note || request.adminNote ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {request.note ? (
                      <div className="rounded-md border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-gray-500">Your Note</p>
                        <p className="mt-1 text-sm text-gray-300">
                          {request.note}
                        </p>
                      </div>
                    ) : null}

                    {request.adminNote ? (
                      <div className="rounded-md border border-white/10 bg-white/5 p-3">
                        <p className="text-xs text-gray-500">Admin Note</p>
                        <p className="mt-1 text-sm text-gray-300">
                          {request.adminNote}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {/* Status helper text */}
                <div className="mt-4 text-xs text-gray-400">
                  {request.status === "pending" ? (
                    <p>
                      আপনার request pending আছে। Admin approve করলে balance
                      update হবে।
                    </p>
                  ) : null}

                  {request.status === "approved" ? (
                    <p className="text-green-300">
                      আপনার deposit approved হয়েছে।
                    </p>
                  ) : null}

                  {request.status === "rejected" ? (
                    <p className="text-red-300">
                      আপনার deposit rejected হয়েছে। Admin note দেখে আবার submit
                      করুন।
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
