"use client";

/* ────────── app/(auth)/games/categories/GamesCategoryClient.tsx ─────────── */

import { useEffect, useMemo, useState } from "react";

type Category = {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  showOnHome: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

function slugifySafe(s: string) {
  /* ────────── coment style ─────────── */
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/(^-|-$)/g, "");
}

export default function GamesCategoryClient() {
  /* ────────── coment style ─────────── */
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ────────── modal state ─────────── */
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ────────── form state ─────────── */
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showOnHome, setShowOnHome] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(0);

  const sorted = useMemo(() => {
    return [...items].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
    );
  }, [items]);

  async function fetchCategories() {
    /* ────────── coment style ─────────── */
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/igaming/categories", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data?.success === false)
        throw new Error(data?.error || "Failed to load categories");
      setItems(data.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

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

  function openEdit(cat: Category) {
    /* ────────── coment style ─────────── */
    setMode("edit");
    setEditingId(cat._id);
    setTitle(cat.title);
    setSlug(cat.slug);
    setIsActive(!!cat.isActive);
    setShowOnHome(!!cat.showOnHome);
    setSortOrder(Number(cat.sortOrder || 0));
    setOpen(true);
  }

  async function onSave() {
    /* ────────── coment style ─────────── */
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);

    const finalSlug = (slug || title).trim();
    const payload = {
      title: title.trim(),
      slug: slugifySafe(finalSlug),
      isActive,
      showOnHome,
      sortOrder: Number(sortOrder || 0),
    };

    try {
      if (mode === "create") {
        const res = await fetch("/api/v1/admin/igaming/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || data?.success === false)
          throw new Error(data?.error || "Create failed");
      } else {
        if (!editingId) throw new Error("Missing editing id");
        const res = await fetch(
          `/api/v1/admin/igaming/categories/${editingId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (!res.ok || data?.success === false)
          throw new Error(data?.error || "Update failed");
      }

      setOpen(false);
      await fetchCategories();
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    /* ────────── coment style ─────────── */
    const ok = confirm("Are you sure you want to delete this category?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/igaming/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || data?.success === false)
        throw new Error(data?.error || "Delete failed");
      await fetchCategories();
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">iGaming Categories</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Create / Edit / Delete categories
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchCategories}
            className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900/70"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={openCreate}
            className="rounded-xl border border-emerald-700/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
          >
            + Create Category
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/30 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/60">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-950">
              <tr className="text-neutral-300">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Home</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-900">
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-neutral-400" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-neutral-400" colSpan={6}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                sorted.map((c) => (
                  <tr key={c._id} className="text-neutral-200">
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3 text-neutral-400">{c.slug}</td>
                    <td className="px-4 py-3">{c.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.isActive ? "text-emerald-300" : "text-neutral-500"
                        }
                      >
                        {c.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.showOnHome ? "text-emerald-300" : "text-neutral-500"
                        }
                      >
                        {c.showOnHome ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-900/70"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(c._id)}
                          className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-1.5 text-xs text-red-200 hover:bg-red-950/50"
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────── Modal ─────────── */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {mode === "create" ? "Create Category" : "Edit Category"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900/70"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">
                  Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (mode === "create" && !slug.trim())
                      setSlug(slugifySafe(e.target.value));
                  }}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500/40"
                  placeholder="e.g. Slots"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-300">
                  Slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500/40"
                  placeholder="e.g. slots"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Auto slug: {slugifySafe(slug || title)}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-300">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500/40"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="text-sm text-neutral-100">Active</div>
                    <div className="text-xs text-neutral-500">Show in list</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(e) => setShowOnHome(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="text-sm text-neutral-100">Home</div>
                    <div className="text-xs text-neutral-500">Show on home</div>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900/70"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-xl border border-emerald-700/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : mode === "create"
                    ? "Create"
                    : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
