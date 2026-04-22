"use client";

/* ────────── app/(public)/casino-games/game/[id]/GameCategoryPicker.tsx ─────────── */

import { useUpdateAdminIgamingGameMutation } from "@/redux/features/igaming/igamingAdminApi";
import { useGetAdminIgamingCategoriesQuery } from "@/redux/features/igaming/igamingApi";
import { toast } from "react-hot-toast";

type CatItem = {
  _id: string;
  title: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
  showOnHome?: boolean;
};

export default function GameCategoryPicker({
  gameId,
  currentCategoryIds,
  onAfterUpdate,
}: {
  gameId: string;
  currentCategoryIds: string[];
  onAfterUpdate?: () => void;
}) {
  /* ────────── coment style ─────────── */
  const { data, isLoading, refetch } = useGetAdminIgamingCategoriesQuery(
    undefined,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );

  const [updateGame, { isLoading: updating }] =
    useUpdateAdminIgamingGameMutation();

  /* ────────── admin list returns { success:true, data:[...] } ─────────── */
  const cats: CatItem[] = (data as any)?.data || [];

  const assignedSet = new Set((currentCategoryIds || []).map((x) => String(x)));

  function unique(ids: string[]) {
    /* ────────── coment style ─────────── */
    const out: string[] = [];
    for (const x of ids) {
      if (!out.includes(x)) out.push(x);
    }
    return out;
  }

  async function toggleCategory(catId: string) {
    /* ────────── coment style ─────────── */
    const id = String(catId || "").trim();
    if (!id) return;

    const base = (currentCategoryIds || []).map((x) => String(x));

    const isAssigned = assignedSet.has(id);

    /* ────────── add/remove (toggle) ─────────── */
    const next = isAssigned
      ? base.filter((x) => x !== id)
      : unique([...base, id]);

    try {
      await updateGame({ id: gameId, body: { categories: next } }).unwrap();

      toast.success(isAssigned ? "Category removed" : "Category assigned");

      /* ────────── refresh details + keep list fresh ─────────── */
      onAfterUpdate?.();
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || "Update failed");
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-neutral-900 bg-neutral-950/60 p-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-neutral-200">Category</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Click করলে toggle হবে: assigned থাকলে remove, না থাকলে assign.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-neutral-500">Loading categories...</div>
      ) : cats.length === 0 ? (
        <div className="text-sm text-neutral-500">No categories found.</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {cats
            .slice()
            .sort(
              (a, b) =>
                Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
                a.title.localeCompare(b.title)
            )
            .map((c) => {
              const id = String(c._id);
              const isAssigned = assignedSet.has(id);

              return (
                <button
                  key={id}
                  disabled={updating}
                  onClick={() => toggleCategory(id)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    isAssigned
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-200 hover:bg-neutral-900/70"
                  } ${updating ? "opacity-70" : ""}`}
                  title={isAssigned ? "Click to remove" : "Click to assign"}
                >
                  {c.title}
                  {isAssigned ? " ✓" : ""}
                </button>
              );
            })}
        </div>
      )}
    </section>
  );
}
