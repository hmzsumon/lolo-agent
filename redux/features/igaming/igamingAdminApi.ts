/* ────────── redux/features/igaming/igamingAdminApi.ts ─────────── */

import { apiSlice } from "../api/apiSlice";

/* ────────── types ─────────── */
export type IgamingCategory = {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  showOnHome: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

type ListRes = {
  success: boolean;
  data: IgamingCategory[];
};

type OneRes = {
  success: boolean;
  data: IgamingCategory;
};

type CreateReq = {
  title: string;
  slug?: string;
  isActive?: boolean;
  showOnHome?: boolean;
  sortOrder?: number;
};

type UpdateReq = CreateReq;

/* ────────── endpoints ─────────── */
export const igamingAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── GET: admin categories ─────────── */
    getAdminIgamingCategories: builder.query<ListRes, void>({
      query: () => "/admin/igaming/categories",
      providesTags: (result) => {
        const listTag = { type: "IgamingCategories" as const, id: "LIST" };
        if (!result?.data?.length) return [listTag];
        return [
          listTag,
          ...result.data.map((c) => ({
            type: "IgamingCategories" as const,
            id: c._id,
          })),
        ];
      },
    }),

    /* ────────── POST: create category ─────────── */
    createAdminIgamingCategory: builder.mutation<OneRes, CreateReq>({
      query: (body) => ({
        url: "/admin/igaming/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "IgamingCategories", id: "LIST" }],
    }),

    /* ────────── PATCH: update category ─────────── */
    updateAdminIgamingCategory: builder.mutation<
      OneRes,
      { id: string; body: UpdateReq }
    >({
      query: ({ id, body }) => ({
        url: `/admin/igaming/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "IgamingCategories", id: "LIST" },
        { type: "IgamingCategories", id: arg.id },
      ],
    }),

    /* ────────── DELETE: delete category ─────────── */
    deleteAdminIgamingCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/admin/igaming/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "IgamingCategories", id: "LIST" },
        { type: "IgamingCategories", id },
      ],
    }),

    /* ────────── add inside igamingAdminApi.injectEndpoints({ endpoints: (builder) => ({ ... }) }) ─────────── */
    /* ────────── PATCH /admin/igaming/games/:id ─────────── */
    updateAdminIgamingGame: builder.mutation<
      { success: boolean; data: any },
      {
        id: string;
        body: {
          isActive?: boolean;
          isPopular?: boolean;
          isHomeFeatured?: boolean;
          popularRank?: number;
          thumb?: string;
          img?: string;
          game_img?: string;
          meta?: { img?: string; game_img?: string };
          categories?: string[];
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/admin/igaming/games/${id}`,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetAdminIgamingCategoriesQuery,
  useCreateAdminIgamingCategoryMutation,
  useUpdateAdminIgamingCategoryMutation,
  useDeleteAdminIgamingCategoryMutation,
  /* ────────── add this ─────────── */
  useUpdateAdminIgamingGameMutation,
} = igamingAdminApi;
