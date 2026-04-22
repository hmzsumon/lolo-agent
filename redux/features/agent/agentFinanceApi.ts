"use client";

import { apiSlice } from "../api/apiSlice";

export type AgentPaymentMethod = {
  _id: string;
  accountNumber: string;
  methodName: string;
  methodType: string;
  title?: string;
  isActive?: boolean;
  isDefault?: boolean;
  isHiddenFromAgent?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DeleteMyPaymentMethodResponse = {
  success: boolean;
  message?: string;
  data: AgentPaymentMethod;
};
export type CreateMyPaymentMethodBody = {
  accountNumber: string;
  methodName: string;
  methodType: string;
};

export type CreateMyPaymentMethodResponse = {
  success: boolean;
  message: string;
  paymentMethod: AgentPaymentMethod;
};

export type GetMyPaymentMethodsResponse = {
  success: boolean;
  paymentMethods: AgentPaymentMethod[];
};

/* ✅ NEW types for manager actions (added, nothing removed) */
export type GetMyPaymentMethodsResponseV2 = {
  success: boolean;
  data: AgentPaymentMethod[];
};

export type PaymentMethodSingleResponse = {
  success: boolean;
  data: AgentPaymentMethod;
};

export type UpdateMyPaymentMethodBody = Partial<
  Pick<AgentPaymentMethod, "accountNumber" | "methodName" | "methodType">
>;

/**
 * Agent Finance ("/agent/me/*") endpoints
 * Backend routes were added in: agent.finance.controller
 */
export const agentFinanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ✅ EXISTING (unchanged) */
    createMyPaymentMethod: builder.mutation<
      CreateMyPaymentMethodResponse,
      CreateMyPaymentMethodBody
    >({
      query: (body) => ({
        url: "/agent/me/payment-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AgentPaymentMethods"],
    }),

    /* ✅ EXISTING (kept) */
    getMyPaymentMethods: builder.query<GetMyPaymentMethodsResponse, void>({
      query: () => ({ url: "/agent/me/payment-methods", method: "GET" }),
      providesTags: ["AgentPaymentMethods"],
    }),

    /* ✅ NEW (for PaymentMethodManagerPage)
       Your backend controller returns: { success: true, data: list }
       So this endpoint matches that response shape.
       If you don't need it now, you can ignore it—it's additive only.
    */
    getMyPaymentMethodsV2: builder.query<GetMyPaymentMethodsResponseV2, void>({
      query: () => ({ url: "/agent/me/payment-methods", method: "GET" }),
      providesTags: ["AgentPaymentMethods"],
    }),

    /* ✅ NEW: toggle active/inactive */
    toggleMyPaymentMethod: builder.mutation<
      PaymentMethodSingleResponse,
      string
    >({
      query: (id) => ({
        url: `/agent/me/payment-methods/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["AgentPaymentMethods"],
    }),

    /* ✅ NEW: set default payment method */
    setMyDefaultPaymentMethod: builder.mutation<
      PaymentMethodSingleResponse,
      string
    >({
      query: (id) => ({
        url: `/agent/me/payment-methods/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: ["AgentPaymentMethods"],
    }),

    /* ✅ NEW: edit/update payment method
       NOTE: You must add backend route:
       PATCH /agent/me/payment-methods/:id
    */
    updateMyPaymentMethod: builder.mutation<
      PaymentMethodSingleResponse,
      { id: string; body: UpdateMyPaymentMethodBody }
    >({
      query: ({ id, body }) => ({
        url: `/agent/me/payment-methods/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AgentPaymentMethods"],
    }),

    /* ────────── Delete My Payment Method ────────── */
    deleteMyPaymentMethod: builder.mutation<
      DeleteMyPaymentMethodResponse,
      string
    >({
      query: (id) => ({
        url: `/agent/me/payment-methods/${id}/delete`,
        method: "PATCH",
      }),
      invalidatesTags: ["AgentPaymentMethods"],
    }),

    /* ────────── Commission Summary ────────── */
    getMyCommissionSummary: builder.query<any, void>({
      query: () => ({
        url: "/agent/me/commission-summary",
        method: "GET",
      }),
    }),

    /* ────────── dashboard Summary ────────── */
    getMyDashboardSummary: builder.query<any, void>({
      query: () => ({
        url: "/agent/me/dashboard-summary",
        method: "GET",
      }),
    }),

    /* ────────── End Payment Method api ────────── */
  }),
});

export const {
  /* ✅ EXISTING hooks (unchanged) */
  useCreateMyPaymentMethodMutation,
  useGetMyPaymentMethodsQuery,
  useLazyGetMyPaymentMethodsQuery,

  /* ✅ NEW hooks (added) */
  useGetMyPaymentMethodsV2Query,
  useLazyGetMyPaymentMethodsV2Query,
  useToggleMyPaymentMethodMutation,
  useSetMyDefaultPaymentMethodMutation,
  useUpdateMyPaymentMethodMutation,

  /* ────────── Delete My Payment Method ────────── */
  useDeleteMyPaymentMethodMutation,

  /* ────────── Commission Summary ────────── */
  useGetMyCommissionSummaryQuery,

  /* ────────── dashboard Summary ────────── */
  useGetMyDashboardSummaryQuery,
} = agentFinanceApi;
