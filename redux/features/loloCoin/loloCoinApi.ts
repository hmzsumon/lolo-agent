import { apiSlice } from "../api/apiSlice";

export type AgentLoloCoinHistory = {
  _id: string;
  type: "earn" | "convert";
  coinAmount: number;
  btcAmount: number;
  depositAmount?: number;
  note?: string;
  createdAt: string;
};

export type AgentLoloCoinData = {
  coinBalance: number;
  availableBtc: number;
  canConvert: boolean;
  totalEarned: number;
  totalConverted: number;
  totalBtcConverted: number;
  rollingBalance: number;
  config: {
    earnPercent: number;
    minConvertCoin: number;
    coinPerBtc: number;
  };
  histories: AgentLoloCoinHistory[];
};

export const agentLoloCoinApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── আমার Agent LOLO coin summary ────────── */
    getMyAgentLoloCoin: builder.query<
      { success: boolean; data: AgentLoloCoinData },
      void
    >({
      query: () => ({ url: "/agent/lolo-coin/me", method: "GET" }),
      providesTags: ["Wallet", "AgentRewards"],
    }),

    /* ────────── coin convert করে agent balance এ নেওয়া ────────── */
    convertAgentLoloCoin: builder.mutation<
      { success: boolean; coinAmount: number; btcAmount: number; message: string },
      { coinAmount: number }
    >({
      query: (body) => ({ url: "/agent/lolo-coin/convert", method: "POST", body }),
      invalidatesTags: ["Wallet", "AgentRewards"],
    }),
  }),
});

export const { useGetMyAgentLoloCoinQuery, useConvertAgentLoloCoinMutation } = agentLoloCoinApi;
