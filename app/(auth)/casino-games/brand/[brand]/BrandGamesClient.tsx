"use client";

/* ────────── app/(public)/casino-games/brand/[brand]/BrandGamesClient.tsx ─────────── */

import IgamingInfiniteGrid from "@/components/igaming/IgamingInfiniteGrid";
import IgamingTabBar from "@/components/igaming/IgamingTabBar";
import {
  useGetIgamingBrandsQuery,
  useGetIgamingCategoriesQuery,
} from "@/redux/features/igaming/igamingApi";
import { useEffect, useState } from "react";

export default function BrandGamesClient({ brandSlug }: { brandSlug: string }) {
  /* ────────── coment style ─────────── */
  const { data: brandRes } = useGetIgamingBrandsQuery();
  const { data: catRes } = useGetIgamingCategoriesQuery();

  /* ────────── search state ─────────── */
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 450);

  const brands = (brandRes?.items || []).map((b) => ({
    _id: b._id,
    slug: b.slug || b.brand_id,
    label: b.name,
    count: b.gamesCount,
  }));

  const categories = (catRes?.items || []).map((c) => ({
    _id: c._id,
    slug: c.slug,
    label: c.title,
    count: c.gamesCount,
  }));

  const activeBrandName = brandRes?.items?.find(
    (b) => (b.slug || b.brand_id) === brandSlug
  )?.name;

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {activeBrandName || brandSlug}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">Showing games by brand.</p>
      </div>

      {/* ────────── Smart Search Bar ─────────── */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-semibold text-neutral-300">
          Search in this brand
        </label>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by game_uid / game name…"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-emerald-500/40"
          />
          {search.trim() ? (
            <button
              onClick={() => setSearch("")}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-900/70"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <IgamingTabBar
        title="Brands"
        items={brands}
        activeSlug={brandSlug}
        allHref="/casino-games"
        makeHref={(slug) => `/casino-games/brand/${slug}`}
      />

      <IgamingTabBar
        title="Categories"
        items={categories}
        activeSlug={null}
        allHref="/casino-games"
        makeHref={(slug) => `/casino-games/category/${slug}`}
      />

      <IgamingInfiniteGrid brand={brandSlug} q={debounced} />
    </main>
  );
}

/* ────────── coment style ─────────── */
function useDebouncedValue<T>(value: T, delay = 450) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
