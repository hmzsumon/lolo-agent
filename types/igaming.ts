/* ────────── types/igaming.ts ─────────── */

export type IgamingBrandTab = {
  _id: string;
  name: string;
  slug: string;
  brand_id: string;
  logo?: string;
  gamesCount: number;
};

export type IgamingCategoryTab = {
  _id: string;
  title: string;
  slug: string;
  sortOrder?: number;
  gamesCount: number;
};

export type IgamingGameListItem = {
  _id: string;
  name: string;
  thumb?: string;
  provider: string;
  brand_id: string;
  brand_name: string;
  game_uid: string;
  meta?: any;
};

export type IgamingGamesResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  received: number;
  hasMore: boolean;
  brand: null | { _id: string; name: string; slug: string; brand_id: string };
  category: null | { _id: string; title: string; slug: string };
  items: IgamingGameListItem[];
};

export type IgamingTabsResponse<T> = {
  success: boolean;
  total: number;
  items: T[];
};

export type IgamingGameDetailsResponse = {
  success: boolean;
  data: any;
};
