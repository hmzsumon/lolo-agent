/* ────────── redux/features/igaming/igamingApi.ts ─────────── */

import { apiSlice } from "@/redux/features/api/apiSlice";
import type {
  IgamingBrandTab,
  IgamingCategoryTab,
  IgamingGameDetailsResponse,
  IgamingGamesResponse,
  IgamingTabsResponse,
} from "@/types/igaming";

export const igamingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIgamingBrands: builder.query<IgamingTabsResponse<IgamingBrandTab>, void>(
      {
        query: () => ({
          url: "/igaming/brands",
          method: "GET",
        }),
        providesTags: ["IgamingBrands"],
      }
    ),

    getIgamingCategories: builder.query<
      IgamingTabsResponse<IgamingCategoryTab>,
      void
    >({
      query: () => ({
        url: "/igaming/categories",
        method: "GET",
      }),
      providesTags: ["IgamingCategories"],
    }),

    getIgamingGames: builder.query<
      IgamingGamesResponse,
      {
        page?: number;
        limit?: number;
        q?: string;
        brand?: string;
        category?: string;
      }
    >({
      query: (params) => ({
        url: "/igaming/games",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((g) => ({
                type: "IgamingGames" as const,
                id: g._id,
              })),
              "IgamingGames",
            ]
          : ["IgamingGames"],
    }),

    getIgamingGameById: builder.query<IgamingGameDetailsResponse, string>({
      query: (id) => ({
        url: `/igaming/games/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "IgamingGames", id }],
    }),

    /* ────────── GET /admin/igaming/categories (Admin সব category) ─────────── */
    getAdminIgamingCategories: builder.query<any, void>({
      query: () => ({
        url: "/admin/igaming/categories",
        method: "GET",
      }),
      providesTags: ["IgamingCategories"],
    }),
  }),
});

export const {
  useGetIgamingBrandsQuery,
  useGetIgamingCategoriesQuery,
  useGetIgamingGamesQuery,
  useLazyGetIgamingGamesQuery,
  useGetIgamingGameByIdQuery,
  /* ────────── add this ─────────── */
  useGetAdminIgamingCategoriesQuery,
} = igamingApi;
