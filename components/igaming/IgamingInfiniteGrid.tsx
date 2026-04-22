"use client";

/* ────────── components/igaming/IgamingInfiniteGrid.tsx ─────────── */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLazyGetIgamingGamesQuery } from "@/redux/features/igaming/igamingApi";
import type { IgamingGameListItem } from "@/types/igaming";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import IgamingGameCard from "./IgamingGameCard";

export default function IgamingInfiniteGrid({
  brand,
  category,
  q,
  initialLimit = 24,
  className,
}: {
  brand?: string;
  category?: string;
  q?: string;
  initialLimit?: number;
  className?: string;
}) {
  /* ────────── coment style ─────────── */
  const limit = Math.min(60, Math.max(6, initialLimit));

  const [items, setItems] = useState<IgamingGameListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [trigger, { isFetching, isError }] = useLazyGetIgamingGamesQuery();

  const lockRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const queryKey = useMemo(() => {
    const qq = (q || "").trim();
    return `${brand || ""}::${category || ""}::${qq}`;
  }, [brand, category, q]);

  const fetchPage = useCallback(
    async (nextPage: number, mode: "replace" | "append") => {
      if (lockRef.current) return;
      lockRef.current = true;

      try {
        const data = await trigger({
          page: nextPage,
          limit,
          brand,
          category,
          q: (q || "").trim() || undefined,
        }).unwrap();

        setTotal(data.total || 0);
        setHasMore(!!data.hasMore);
        setPage(data.page || nextPage);

        setItems((prev) =>
          mode === "replace" ? data.items : [...prev, ...data.items]
        );
      } finally {
        lockRef.current = false;
      }
    },
    [brand, category, limit, q, trigger]
  );

  useEffect(() => {
    /* ────────── reset on filter/search change ─────────── */
    setItems([]);
    setPage(1);
    setTotal(0);
    setHasMore(true);
    fetchPage(1, "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  useEffect(() => {
    /* ────────── infinite scroll observer ─────────── */
    const el = sentinelRef.current;
    if (!el) return;
    if (!hasMore) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (isFetching) return;
        if (!hasMore) return;
        fetchPage(page + 1, "append");
      },
      { root: null, rootMargin: "400px", threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchPage, hasMore, isFetching, page]);

  const showing = items.length;

  return (
    <section className={cn("", className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-neutral-100">Games</h3>
          <p className="text-xs text-neutral-500">
            Showing {showing} of {total}
            {q?.trim() ? (
              <span className="ml-2">• Search: “{q.trim()}”</span>
            ) : null}
          </p>
        </div>

        {isError ? (
          <div className="rounded-md border border-red-900/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
            Failed to load games.
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((g) => (
          <IgamingGameCard key={g._id} game={g} />
        ))}

        {isFetching && items.length === 0
          ? Array.from({ length: Math.min(12, limit) }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/60"
              >
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          : null}

        {isFetching && items.length > 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`sk-more-${i}`}
                className="overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/60"
              >
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          : null}
      </div>

      <div ref={sentinelRef} className="h-10" />

      {!hasMore && total > 0 ? (
        <div className="mt-6 text-center text-xs text-neutral-500">
          You reached the end.
        </div>
      ) : null}

      {!isFetching && total === 0 ? (
        <div className="mt-6 text-center text-sm text-neutral-400">
          No games found.
        </div>
      ) : null}
    </section>
  );
}
