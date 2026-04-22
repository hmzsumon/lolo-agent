"use client";

/* ────────── app/(auth)/games/categories/components/CategoryFormSheet.tsx ─────────── */

import Button from "@/components/new-ui/Button";
import Sheet from "@/components/new-ui/Sheet";

export default function CategoryFormSheet({
  open,
  mode,
  editingId,
  onClose,
  onSave,
  isSaving,

  title,
  slug,
  isActive,
  showOnHome,
  sortOrder,

  setTitle,
  setSlug,
  setIsActive,
  setShowOnHome,
  setSortOrder,

  slugifySafe,
}: {
  open: boolean;
  mode: "create" | "edit";
  editingId: string | null;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;

  title: string;
  slug: string;
  isActive: boolean;
  showOnHome: boolean;
  sortOrder: number;

  setTitle: (v: string) => void;
  setSlug: (v: string) => void;
  setIsActive: (v: boolean) => void;
  setShowOnHome: (v: boolean) => void;
  setSortOrder: (v: number) => void;

  slugifySafe: (v: string) => string;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-white">
            {mode === "create" ? "Create Category" : "Edit Category"}
          </div>
          <div className="text-xs text-white/50">
            {mode === "edit" ? editingId : ""}
          </div>
        </div>
      }
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" className="w-auto" onClick={onClose}>
            Cancel
          </Button>

          <Button className="w-auto" onClick={onSave} loading={isSaving}>
            {mode === "create" ? "Create" : "Update"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3">
        <div>
          <label className="mb-1 block text-sm text-white/70">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Slots"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. slots"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
          />
          <p className="mt-1 text-xs text-white/50">
            Final slug: {slugifySafe(slug || title)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-white/70">
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="text-sm text-white/80">Active</span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <input
              type="checkbox"
              checked={showOnHome}
              onChange={(e) => setShowOnHome(e.target.checked)}
            />
            <span className="text-sm text-white/80">Show On Home</span>
          </label>
        </div>
      </div>
    </Sheet>
  );
}
