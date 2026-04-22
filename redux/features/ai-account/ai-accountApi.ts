/* ──────────────────────────────────────────────────────────────────────────
   accountApi — create/list/update/default/transfer/close
────────────────────────────────────────────────────────────────────────── */
import { apiSlice } from "../api/apiSlice";

export type TAccountType =
  | "lite"
  | "core"
  | "prime"
  | "elite"
  | "ultra"
  | "infinity"
  | "titan";
export interface IAccount {
  _id: string;
  accountNumber: number;
  type: TAccountType;
  currency: "USD" | "BDT";
  leverage: number;
  balance: number;
  isDefault: boolean;
  status: "active" | "closed";
  mode: "ai";
  plan: string;
  planPrice: number;
  createdAt: string;
  equity: number;
  profit: number;
}

export interface IPositionAccount {
  _id: string;
  balance: number;
  equity: number;
}

export interface IPositionUser {
  _id: string;
  name: string;
  agentId: string;
  agentName: string;
}

export interface IPosition {
  _id: string;
  accountId: IPositionAccount;
  userId: IPositionUser;

  customerId: string;
  symbol: string;
  side: "buy" | "sell"; // চাইলে শুধু string রেখেও চালাতে পারো

  lots: number;
  contractSize: number;
  entryPrice: number;
  closePrice: number;
  manipulateClosePrice: number;
  margin: number;
  commissionOpen: number;
  commissionClose: number;

  status: "open" | "closed" | string; // চাইলে শুধু string
  openedAt: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  stopLoss: number;
  plan: string;
  planPrice: number;

  is_loss: boolean;
  isStopLoss: boolean;
  isGlobal: boolean;

  __v: number;
}

export interface PlaceLossTradeBody {
  accountNumbers: (number | string)[];
  symbol: string;
  side: "buy" | "sell";
  lots: number;
  price: number;
  maxSlippageBps?: number;
  stopLoss: number;
}

export const aiAccountApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createAiAccount: builder.mutation<
      { success: true; account: IAccount },
      {
        plan: string;
        amount: number;
      }
    >({
      query: (body) => ({ url: "/create-ai-accounts", method: "POST", body }),
      invalidatesTags: ["Accounts"],
    }),
    getMyAiAccounts: builder.query<{ success: true; items: IAccount[] }, void>({
      query: () => ({ url: "/my-ai-accounts" }),
      providesTags: ["Accounts"],
    }),
    updateAccount: builder.mutation<
      { success: true; account: IAccount },
      { id: string; name?: string; leverage?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/accounts/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Accounts"],
    }),
    setDefaultAccount: builder.mutation<
      { success: true; account: IAccount },
      { id: string }
    >({
      query: ({ id }) => ({ url: `/accounts/${id}/default`, method: "PATCH" }),
      invalidatesTags: ["Accounts"],
    }),
    transferInternal: builder.mutation<
      { success: true; account: IAccount },
      { id: string; direction: "fund" | "defund"; amount: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/accounts/${id}/transfer`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Accounts"],
    }),
    closeAccount: builder.mutation<{ success: true }, { id: string }>({
      query: ({ id }) => ({ url: `/accounts/${id}`, method: "DELETE" }),
      invalidatesTags: ["Accounts"],
    }),
    /* ────────── demoTopUp mutation ────────── */
    demoTopUp: builder.mutation<
      {
        success: true;
        account: IAccount;
        receipt: { status: "accepted"; amount: number; currency: string };
      },
      { id: string; amount: number }
    >({
      query: ({ id, amount }) => ({
        url: `/accounts/${id}/demo-deposit`,
        method: "POST",
        body: { amount },
      }),
      invalidatesTags: ["Accounts"],
    }),
    /* ────────── get all active ai accounts ────────── */
    getAllAiAccounts: builder.query<{ success: true; items: IAccount[] }, void>(
      {
        query: () => ({ url: "/all-active-ai-accounts" }),
        providesTags: ["Accounts"],
      }
    ),

    /* ────────── get all admin ai accounts ────────── */
    getAllAdminAiAccounts: builder.query<
      { success: true; items: IAccount[] },
      void
    >({
      query: () => ({ url: "/all-ai-accounts-for-admin" }),
      providesTags: ["Accounts"],
    }),

    /* ────────── Place ai order Trade ────────── */
    placeAiOrder: builder.mutation<any, any>({
      query: (body) => ({ url: "/place-order-ai-trade", method: "POST", body }),
    }),

    /* ────────── get all active ai positions ────────── */
    getAllAiPositions: builder.query<
      { success: true; items: IAccount[] },
      void
    >({
      query: () => ({ url: "/all-active-ai-positions" }),
      providesTags: ["Positions"],
    }),

    /* ────────── close ai position ────────── */
    closeAiPosition: builder.mutation<any, { id: string; price: number }>({
      query: (body) => ({
        url: `/close-ai-position/${body.id}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Positions"],
    }),

    /* ────────── get all active ai accounts by plan ────────── */
    getAllAiAccountsByPlan: builder.query<
      { success: true; items: IAccount[] },
      string
    >({
      query: (plan) => ({
        url: `/get-active-ai-accounts-by-plan?plan=${plan}`,
        method: "GET",
      }),
      providesTags: ["Accounts"],
    }),

    /* ──────────create Ai Loss Position ────────── */
    createAiLossPosition: builder.mutation<any, PlaceLossTradeBody>({
      query: (body) => ({
        url: "/ai-accounts/loss-trade", // নিচে route এ এটা ব্যবহার করব
        method: "POST",
        body,
      }),
      invalidatesTags: ["Positions", "Accounts"],
    }),

    /* ──────────get-active-ai-positions-by-is-stop-loss ────────── */
    getActiveAiPositionsByIsStopLoss: builder.query<
      { success: true; positions: IPosition[] },
      void
    >({
      query: () => ({
        url: `/get-active-ai-positions-by-is-stop-loss`,
        method: "GET",
      }),
      providesTags: ["Positions"],
    }),

    /* ──────────delete AiPositions By IsStopLoss ────────── */
    deleteAiPositionsByIsStopLoss: builder.mutation<
      { success: boolean; deletedCount: number; updatedAccounts: number },
      string[]
    >({
      query: (positionIds) => ({
        url: `/delete-ai-positions-by-is-stop-loss`,
        method: "POST",
        body: { positionIds },
      }),
      invalidatesTags: ["Positions", "Accounts"],
    }),
  }),
});

export const {
  useCreateAiAccountMutation,
  useGetMyAiAccountsQuery,
  useUpdateAccountMutation,
  useSetDefaultAccountMutation,
  useTransferInternalMutation,
  useCloseAccountMutation,
  useDemoTopUpMutation,
  useGetAllAiAccountsQuery,
  useGetAllAdminAiAccountsQuery,
  usePlaceAiOrderMutation,
  useGetAllAiPositionsQuery,
  useCloseAiPositionMutation,
  useGetAllAiAccountsByPlanQuery,
  useCreateAiLossPositionMutation,
  useGetActiveAiPositionsByIsStopLossQuery,
  useDeleteAiPositionsByIsStopLossMutation,
} = aiAccountApi;
