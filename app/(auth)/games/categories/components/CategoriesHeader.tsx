"use client";

/* ────────── app/(auth)/games/categories/components/CategoriesHeader.tsx ─────────── */

import Button from "@/components/new-ui/Button";

export default function CategoriesHeader({
  onRefresh,
  onCreate,
  isFetching,
}: {
  onRefresh: () => void;
  onCreate: () => void;
  isFetching: boolean;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Games Categories Management
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Create / Edit / Delete iGaming categories
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="w-auto"
          onClick={onRefresh}
          loading={isFetching}
        >
          Refresh
        </Button>

        <Button className="w-auto" onClick={onCreate} variant="primary">
          + Create Category
        </Button>
      </div>
    </div>
  );
}
