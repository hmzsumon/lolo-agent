import { apiSlice } from "../api/apiSlice";

/* ─────────────────────────────────────────────────────────────
 * Agent Float API
 * - Admin-created deposit methods দেখা
 * - Agent topup/return request create করা
 * - নিজের request list দেখা
 * ──────────────────────────────────────────────────────────── */

export type AgentDepositPaymentMethod = {
  _id: string;
  title: string;
  methodName: string;
  accountNumber: string;
  instructions?: string;
  isActive: boolean;
};

export const agentFloatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAgentDepositPaymentMethods: builder.query<any, void>({
      query: () => ({ url: "/agent/deposit-payment-methods", method: "GET" }),
      providesTags: ["AgentDepositPaymentMethods"],
    }),

    createAgentFloatRequest: builder.mutation<
      any,
      {
        type: "topup" | "return";
        amount: number;
        txnId: string;
        note?: string;
        paymentMethodId?: string;
        senderNumber?: string;
      }
    >({
      query: (body) => ({
        url: "/agent/float-requests",
        method: "POST",
        body: {
          type: body.type,
          amount: body.amount,
          txnId: body.txnId,
          note: body.note || "",

          // topup হলে admin-created payment method attach হবে।
          paymentMethodId: body.paymentMethodId || undefined,
          senderNumber: body.senderNumber || "",
        },
      }),
      invalidatesTags: ["MyFloatRequests"],
    }),

    getMyFloatRequests: builder.query<
      any,
      { status?: "pending" | "approved" | "rejected" | "" }
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.status) qs.set("status", params.status);
        return { url: `/agent/float-requests?${qs.toString()}`, method: "GET" };
      },
      providesTags: ["MyFloatRequests"],
    }),
  }),
});

export const {
  useGetAgentDepositPaymentMethodsQuery,
  useCreateAgentFloatRequestMutation,
  useGetMyFloatRequestsQuery,
} = agentFloatApi;
