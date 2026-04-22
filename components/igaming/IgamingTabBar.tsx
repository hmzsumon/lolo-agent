"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

type TabItem = {
  _id: string;
  slug: string;
  label: string;
  count?: number;
};

export default function IgamingTabBar({
  title,
  items,
  activeSlug,
  allHref,
  makeHref,
}: {
  title: string;
  items: TabItem[];
  activeSlug?: string | null;
  allHref: string;
  makeHref: (slug: string) => string;
}) {
  /* ────────── coment style ─────────── */
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-200">
          {title}
        </h2>
        <span className="text-xs text-neutral-500">
          {items.length ? `${items.length} tabs` : ""}
        </span>
      </div>

      <div
        className={cn(
          "flex gap-2 overflow-x-auto pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        <Link
          href={allHref}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
            !activeSlug
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
              : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:bg-neutral-900/70"
          )}
        >
          All
        </Link>

        {items.map((it) => {
          const isActive = activeSlug === it.slug;
          return (
            <Link
              key={it._id}
              href={makeHref(it.slug)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                isActive
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                  : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:bg-neutral-900/70"
              )}
              title={it.label}
            >
              {it.label}
              {typeof it.count === "number" ? (
                <span className="ml-2 text-[11px] text-neutral-400">
                  {it.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
