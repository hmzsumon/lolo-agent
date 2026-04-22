import { apiSlice } from "../api/apiSlice";

export type GrantAgentRewardsBody = {
  userIds: string[];
  title: string;
  amount: number;
  turnoverMultiplier: number;
  note?: string;
};

export const rewardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    grantAgentRewards: builder.mutation<any, GrantAgentRewardsBody>({
      query: (body) => ({
        url: "/agent/rewards/grant",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AgentRewards"],
    }),
  }),
});

export const { useGrantAgentRewardsMutation } = rewardApi;
