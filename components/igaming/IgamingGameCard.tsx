"use client";

import { cn } from "@/lib/utils";
import type { IgamingGameListItem } from "@/types/igaming";
import Link from "next/link";

export default function IgamingGameCard({
  game,
  className,
}: {
  game: IgamingGameListItem;
  className?: string;
}) {
  /* ────────── coment style ─────────── */
  const imgSrc = game.thumb || game.meta?.img || game.meta?.game_img || "";

  return (
    <Link
      href={`/casino-games/game/${game._id}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/60 shadow-xl shadow-black/20",
        "hover:border-neutral-700 transition",
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={game.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-neutral-900/40 text-neutral-500">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/60" />

        <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">
          {game.brand_name}
        </div>

        <div className="absolute inset-x-0 bottom-2 flex justify-center">
          <div className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            {game.provider}
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="line-clamp-2 text-sm font-semibold text-neutral-100">
          {game.name}
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          UID: {game.game_uid}
        </div>
      </div>
    </Link>
  );
}
