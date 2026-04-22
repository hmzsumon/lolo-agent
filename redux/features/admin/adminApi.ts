import { apiSlice } from "../api/apiSlice";

export interface IUser {
  user: any;
  token: string;
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // get users from api with typescript
    getUsers: builder.query<any, void>({
      query: () => "/admin/users",
      providesTags: ["Users"],
    }),

    /* ────────── Admin Login Mutations ────────── */
    loginAdmin: builder.mutation<IUser, any>({
      query: (body) => ({
        url: "/admin/login",
        method: "POST",
        body,
      }),
    }),
    /* ────────── Get admin dashboard data ────────── */
    getAdminDashboard: builder.query<any, void>({
      query: () => "/admin/dashboard-summary",
    }),

    /* ────────── End Admin Login Mutations ────────── */
  }),
});

export const {
  useGetUsersQuery,
  useLoginAdminMutation,
  useGetAdminDashboardQuery,
} = adminApi;
