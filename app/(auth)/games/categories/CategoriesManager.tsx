"use client";

/* ────────── app/(auth)/games/categories/CategoriesManager.tsx ─────────── */

import Card from "@/components/new-ui/Card";
import {
  useCreateAdminIgamingCategoryMutation,
  useDeleteAdminIgamingCategoryMutation,
  useGetAdminIgamingCategoriesQuery,
  useUpdateAdminIgamingCategoryMutation,
} from "@/redux/features/igaming/igamingAdminApi";
import { useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import CategoriesHeader from "./components/CategoriesHeader";
import CategoriesTable from "./components/CategoriesTable";
import CategoryFormSheet from "./components/CategoryFormSheet";

/* ────────── helpers ─────────── */
function slugifySafe(s: string) {
  /* ────────── coment style ─────────── */
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/(^-|-$)/g, "");
}

type Category = {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  showOnHome: boolean;
  sortOrder: number;
};

export default function CategoriesManager() {
  /* ────────── RTK Query ─────────── */
  const { data, isLoading, isFetching, refetch, error } =
    useGetAdminIgamingCategoriesQuery();

  const [createCat, { isLoading: isCreating }] =
    useCreateAdminIgamingCategoryMutation();

  const [updateCat, { isLoading: isUpdating }] =
    useUpdateAdminIgamingCategoryMutation();

  const [deleteCat, { isLoading: isDeleting }] =
    useDeleteAdminIgamingCategoryMutation();

  /* ────────── UI state ─────────── */
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ────────── form state ─────────── */
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showOnHome, setShowOnHome] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(0);

  const items: Category[] = (data?.data || []) as any;

  const sorted = useMemo(() => {
    return [...items].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
    );
  }, [items]);

  /* ────────── handlers ─────────── */
  function openCreate() {
    /* ────────── coment style ─────────── */
    setMode("create");
    setEditingId(null);
    setTitle("");
    setSlug("");
    setIsActive(true);
    setShowOnHome(true);
    setSortOrder(0);
    setOpen(true);
  }

  function openEdit(c: Category) {
    /* ────────── coment style ─────────── */
    setMode("edit");
    setEditingId(c._id);
    setTitle(c.title);
    setSlug(c.slug);
    setIsActive(!!c.isActive);
    setShowOnHome(!!c.showOnHome);
    setSortOrder(Number(c.sortOrder || 0));
    setOpen(true);
  }

  async function onSave() {
    /* ────────── coment style ─────────── */
    const t = title.trim();
    if (!t) return toast.error("Title is required");

    const finalSlug = slugifySafe((slug || t).trim());

    try {
      if (mode === "create") {
        await createCat({
          title: t,
          slug: finalSlug,
          isActive,
          showOnHome,
          sortOrder: Number(sortOrder || 0),
        }).unwrap();

        toast.success("Category created");
      } else {
        if (!editingId) return toast.error("Missing category id");

        await updateCat({
          id: editingId,
          body: {
            title: t,
            slug: finalSlug,
            isActive,
            showOnHome,
            sortOrder: Number(sortOrder || 0),
          },
        }).unwrap();

        toast.success("Category updated");
      }

      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || "Save failed");
    }
  }

  async function onDelete(id: string) {
    /* ────────── coment style ─────────── */
    const ok = confirm("Delete this category?");
    if (!ok) return;

    try {
      await deleteCat(id).unwrap();
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || "Delete failed");
    }
  }

  const isSaving = isCreating || isUpdating;

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-6xl p-6 md:p-8">
        <CategoriesHeader
          onRefresh={() => refetch()}
          onCreate={openCreate}
          isFetching={isFetching}
        />

        {/* ────────── Error View ─────────── */}
        {error ? (
          <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            API Error (check auth/proxy). Try refresh.
          </div>
        ) : null}

        {/* ────────── List ─────────── */}
        <Card className="overflow-hidden p-0">
          <CategoriesTable
            items={sorted}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </Card>

        {/* ────────── Drawer (Create/Edit) ─────────── */}
        <CategoryFormSheet
          open={open}
          mode={mode}
          editingId={editingId}
          onClose={() => setOpen(false)}
          onSave={onSave}
          isSaving={isSaving}
          title={title}
          slug={slug}
          isActive={isActive}
          showOnHome={showOnHome}
          sortOrder={sortOrder}
          setTitle={(v) => {
            setTitle(v);
            /* ────────── auto slug only when create & slug empty ─────────── */
            if (mode === "create" && !slug.trim()) setSlug(slugifySafe(v));
          }}
          setSlug={setSlug}
          setIsActive={setIsActive}
          setShowOnHome={setShowOnHome}
          setSortOrder={setSortOrder}
          slugifySafe={slugifySafe}
        />
      </div>
    </main>
  );
}
