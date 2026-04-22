import { apiSlice } from "../api/apiSlice";

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── list ────────── */
    getMyNotifications: builder.query<any, { unread?: boolean } | void>({
      query: (arg) => {
        const unread = arg && (arg as any)?.unread ? "1" : "0";
        return `/my-notifications?unread=${unread}&limit=50&skip=0`;
      },
      providesTags: ["Notifications"],
    }),

    /* ────────── count ────────── */
    getMyUnreadCount: builder.query<any, void>({
      query: () => `/my-unread-notifications-count`,
      providesTags: ["Notifications"],
    }),

    /* ────────── mark one read ────────── */
    markRead: builder.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/notification/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),

    /* ────────── mark all read ────────── */
    markAllRead: builder.mutation<any, void>({
      query: () => ({
        url: `/update-all-notifications`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetMyUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationApi;
