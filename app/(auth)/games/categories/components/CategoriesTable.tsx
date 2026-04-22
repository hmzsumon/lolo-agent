"use client";

/* ────────── app/(auth)/games/categories/components/CategoriesTable.tsx ─────────── */

import Button from "@/components/new-ui/Button";
import StatusPill from "./StatusPill";

type Category = {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
  showOnHome: boolean;
  sortOrder: number;
};

export default function CategoriesTable({
  items,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
}: {
  items: Category[];
  isLoading: boolean;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/80">
          <tr>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Slug</th>
            <th className="px-4 py-3 text-left">Sort</th>
            <th className="px-4 py-3 text-left">Active</th>
            <th className="px-4 py-3 text-left">Home</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {isLoading ? (
            <tr>
              <td className="px-4 py-4 text-white/60" colSpan={6}>
                Loading...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td className="px-4 py-4 text-white/60" colSpan={6}>
                No categories found.
              </td>
            </tr>
          ) : (
            items.map((c) => (
              <tr key={c._id} className="text-white/85">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3 text-white/55">{c.slug}</td>
                <td className="px-4 py-3">{c.sortOrder}</td>
                <td className="px-4 py-3">
                  <StatusPill active={!!c.isActive} />
                </td>
                <td className="px-4 py-3">
                  <StatusPill active={!!c.showOnHome} />
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      className="w-auto px-3 py-2"
                      onClick={() => onEdit(c)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="warning"
                      className="w-auto px-3 py-2"
                      loading={isDeleting}
                      onClick={() => onDelete(c._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
