"use client";

/* ────────── app/(public)/casino-games/game/[id]/GameDetailsClient.tsx ─────────── */

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateAdminIgamingGameMutation } from "@/redux/features/igaming/igamingAdminApi";
import { useGetIgamingGameByIdQuery } from "@/redux/features/igaming/igamingApi";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import GameCategoryPicker from "./GameCategoryPicker";

export default function GameDetailsClient({ id }: { id: string }) {
  /* ────────── coment style ─────────── */
  const { data, isLoading, isError, refetch } = useGetIgamingGameByIdQuery(id);
  const [updateGame, { isLoading: saving }] =
    useUpdateAdminIgamingGameMutation();

  const g = data?.data;

  /* ────────── local editable state ─────────── */
  const [isActive, setIsActive] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [isHomeFeatured, setIsHomeFeatured] = useState(false);
  const [popularRank, setPopularRank] = useState<number>(0);

  const [thumb, setThumb] = useState("");
  const [metaImg, setMetaImg] = useState("");
  const [metaGameImg, setMetaGameImg] = useState("");

  useEffect(() => {
    /* ────────── sync state when game loads ─────────── */
    if (!g) return;

    setIsActive(!!g.isActive);
    setIsPopular(!!g.isPopular);
    setIsHomeFeatured(!!g.isHomeFeatured);
    setPopularRank(Number(g.popularRank || 0));

    setThumb(String(g.thumb || ""));
    setMetaImg(String(g?.meta?.img || ""));
    setMetaGameImg(String(g?.meta?.game_img || ""));
  }, [g]);

  const currentCategoryIds: string[] = useMemo(() => {
    return Array.isArray(g?.categories)
      ? g.categories.map((c: any) => String(c?._id || c))
      : [];
  }, [g]);

  const previewSrc =
    thumb ||
    metaImg ||
    metaGameImg ||
    g?.thumb ||
    g?.meta?.img ||
    g?.meta?.game_img;

  async function saveFlags() {
    /* ────────── coment style ─────────── */
    try {
      await updateGame({
        id: String(g._id),
        body: { isActive, isPopular, isHomeFeatured },
      }).unwrap();

      toast.success("Flags updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || "Update failed");
    }
  }

  async function saveRank() {
    /* ────────── coment style ─────────── */
    try {
      await updateGame({
        id: String(g._id),
        body: { popularRank: Number(popularRank || 0) },
      }).unwrap();

      toast.success("Popular rank updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || "Update failed");
    }
  }

  async function saveImages() {
    /* ────────── coment style ─────────── */
    try {
      await updateGame({
        id: String(g._id),
        body: {
          thumb: thumb.trim(),
          meta: { img: metaImg.trim(), game_img: metaGameImg.trim() },
        },
      }).unwrap();

      toast.success("Images updated");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || "Update failed");
    }
  }

  function resetToDB() {
    /* ────────── coment style ─────────── */
    if (!g) return;

    setIsActive(!!g.isActive);
    setIsPopular(!!g.isPopular);
    setIsHomeFeatured(!!g.isHomeFeatured);
    setPopularRank(Number(g.popularRank || 0));

    setThumb(String(g.thumb || ""));
    setMetaImg(String(g?.meta?.img || ""));
    setMetaGameImg(String(g?.meta?.game_img || ""));
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-4xl p-4 md:p-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <Skeleton className="h-24 w-full" />
        </div>
      </main>
    );
  }

  if (isError || !g) {
    return (
      <main className="mx-auto w-full max-w-4xl p-4 md:p-6">
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-red-200">
          Failed to load game details.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <Toaster position="top-right" />

      {/* ────────── Header ─────────── */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{g.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {g.brand_name} • {g.provider} • UID: {g.game_uid}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDB} disabled={saving}>
            Reset
          </Button>
          <Link href="/casino-games">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>

      {/* ────────── small preview image ─────────── */}
      {previewSrc ? (
        <div className="mx-auto max-w-[240px] overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/60">
          <img
            src={previewSrc}
            alt={g.name}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      {/* ────────── Category toggle block ─────────── */}
      <GameCategoryPicker
        gameId={String(g._id)}
        currentCategoryIds={currentCategoryIds}
        onAfterUpdate={() => refetch()}
      />

      {/* ────────── Smart Edit Panels ─────────── */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* ────────── Flags ─────────── */}
        <Panel title="Quick Toggles">
          <ToggleRow label="isActive" value={isActive} onChange={setIsActive} />
          <ToggleRow
            label="isPopular"
            value={isPopular}
            onChange={setIsPopular}
          />
          <ToggleRow
            label="isHomeFeatured"
            value={isHomeFeatured}
            onChange={setIsHomeFeatured}
          />

          <div className="mt-3 flex justify-end">
            <Button onClick={saveFlags} disabled={saving}>
              Save Toggles
            </Button>
          </div>
        </Panel>

        {/* ────────── Rank ─────────── */}
        <Panel title="Ranking">
          <label className="block text-sm text-neutral-400">popularRank</label>
          <input
            type="number"
            value={popularRank}
            onChange={(e) => setPopularRank(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none"
          />

          <div className="mt-3 flex justify-end">
            <Button onClick={saveRank} disabled={saving}>
              Save Rank
            </Button>
          </div>
        </Panel>
      </div>

      {/* ────────── Images ─────────── */}
      <div className="mt-4">
        <Panel title="Images (thumb / meta.img / meta.game_img)">
          <Field
            label="thumb"
            value={thumb}
            onChange={setThumb}
            placeholder="https://.../thumb.png"
          />
          <Field
            label="meta.img"
            value={metaImg}
            onChange={setMetaImg}
            placeholder="https://.../img.png"
          />
          <Field
            label="meta.game_img"
            value={metaGameImg}
            onChange={setMetaGameImg}
            placeholder="https://.../game_img.png"
          />

          <div className="mt-3 flex justify-end">
            <Button onClick={saveImages} disabled={saving}>
              Save Images
            </Button>
          </div>
        </Panel>
      </div>

      {/* ────────── Info ─────────── */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel title="Basic Info">
          <Row label="_id" value={String(g._id)} />
          <Row label="game_uid" value={String(g.game_uid)} />
          <Row label="provider" value={String(g.provider)} />
          <Row label="brand_id" value={String(g.brand_id)} />
          <Row label="brand_name" value={String(g.brand_name)} />
        </Panel>

        <Panel title="Categories">
          <div className="flex flex-wrap gap-2">
            {(g.categories || []).length ? (
              g.categories.map((c: any) => (
                <span
                  key={String(c._id || c)}
                  className="rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200"
                >
                  {c.title || String(c)}
                </span>
              ))
            ) : (
              <span className="text-sm text-neutral-500">No categories</span>
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Meta">
          <pre className="max-h-[360px] overflow-auto rounded-xl bg-black/40 p-3 text-xs text-neutral-200">
            {JSON.stringify(g.meta || {}, null, 2)}
          </pre>
        </Panel>
      </div>
    </main>
  );
}

/* ────────── UI helpers ─────────── */
function Panel({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4">
      <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-neutral-900 bg-neutral-950/40 px-3 py-2">
      <span className="text-sm text-neutral-200">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-neutral-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex items-start justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="max-w-[70%] break-words text-right text-neutral-200">
        {value}
      </span>
    </div>
  );
}
