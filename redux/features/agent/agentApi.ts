import { IUser } from "../admin/adminApi";
import { UsersResponse } from "../admin/adminUsersApi";
import { apiSlice } from "../api/apiSlice";

export const agentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── Admin Login Mutations ────────── */
    agentLogin: builder.mutation<IUser, any>({
      query: (body) => ({
        url: "/agent/login",
        method: "POST",
        body,
      }),
    }),
    // get agents from api with typescript
    getAgents: builder.query<any, void>({
      query: () => "/agents",
    }),

    // get agent by id from api with typescript
    getAgentById: builder.query<any, string>({
      query: (id) => `/agents/${id}`,
    }),

    // agent register
    agentRegister: builder.mutation<any, any>({
      query: (body) => ({
        url: "/agent-register",
        method: "POST",
        body,
      }),
    }),

    // update agent
    updateAgent: builder.mutation<any, any>({
      query: (body) => ({
        url: "/agents",
        method: "PUT",
        body,
      }),
    }),

    // delete agent
    deleteAgent: builder.mutation<any, string>({
      query: (id) => ({
        url: `/agents/${id}`,
        method: "DELETE",
      }),
    }),

    /* ────────── Get My Agents All Users ────────── */
    getMyAgentsAllUsers: builder.query<
      UsersResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        role?: string;
        is_active?: "true" | "false";
      }
    >({
      query: (q) => {
        const params = new URLSearchParams();
        if (q.page) params.set("page", String(q.page));
        if (q.limit) params.set("limit", String(q.limit));
        if (q.search) params.set("search", q.search);
        if (q.sortBy) params.set("sortBy", q.sortBy);
        if (q.sortOrder) params.set("sortOrder", q.sortOrder);
        if (q.role) params.set("role", q.role);
        if (q.is_active) params.set("is_active", q.is_active);
        const qs = params.toString();
        return { url: `/agent/users${qs ? `?${qs}` : ""}` };
      },
    }),
  }),
});

export const {
  useAgentLoginMutation,
  useGetAgentsQuery,
  useGetAgentByIdQuery,
  useAgentRegisterMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useGetMyAgentsAllUsersQuery,
} = agentApi;
