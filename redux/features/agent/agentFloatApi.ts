import { apiSlice } from "../api/apiSlice";

/* ─────────────────────────────────────────────────────────────
 * Agent Float API
 * - Create float request (topup/return)
 * - List my float requests
 * ──────────────────────────────────────────────────────────── */

export const agentFloatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAgentFloatRequest: builder.mutation<
      any,
      { type: "topup" | "return"; amount: number; txnId: string; note?: string }
    >({
      query: (body) => ({
        url: "/agent/float-requests",
        method: "POST",
        body: {
          type: body.type,
          amount: body.amount,
          txnId: body.txnId,
          note: body.note || "",
        },
      }),
      invalidatesTags: ["MyFloatRequests"],
    }),

    getMyFloatRequests: builder.query<any, { status?: "pending" | "approved" | "rejected" | "" }>({
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
  useCreateAgentFloatRequestMutation,
  useGetMyFloatRequestsQuery,
} = agentFloatApi;