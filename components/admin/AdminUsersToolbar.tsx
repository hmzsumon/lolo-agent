/* ────────── imports ────────── */
"use client";
import { useEffect, useMemo, useState } from "react";

/* ────────── props ────────── */
type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  role?: string;
  onRoleChange: (v?: string) => void;
  is_active?: "true" | "false";
  onActiveChange: (v?: "true" | "false") => void;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
};

/* ────────── component ────────── */
export default function AdminUsersToolbar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  is_active,
  onActiveChange,
  pageSize,
  onPageSizeChange,
}: Props) {
  /* ────────── debounce local ────────── */
  const [localSearch, setLocalSearch] = useState(search);
  useEffect(() => setLocalSearch(search), [search]);

  useEffect(() => {
    const t = setTimeout(() => onSearchChange(localSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [localSearch, onSearchChange]);

  const pageSizeOptions = useMemo(() => [10, 20, 50, 100, 200], []);

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      <input
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search name / email / phone / ID"
        className="w-full rounded-xl border border-white/10 bg-[#0E1014] px-3 py-2 text-sm text-white/90 outline-none ring-0 placeholder:text-white/40"
      />
      <select
        value={role ?? ""}
        onChange={(e) => onRoleChange(e.target.value || undefined)}
        className="rounded-xl border border-white/10 bg-[#0E1014] px-3 py-2 text-sm text-white/90"
      >
        <option value="">All roles</option>
        <option value="user">User</option>
        <option value="agent">Agent</option>
        <option value="admin">Admin</option>
      </select>
      <select
        value={is_active ?? ""}
        onChange={(e) => onActiveChange((e.target.value as any) || undefined)}
        className="rounded-xl border border-white/10 bg-[#0E1014] px-3 py-2 text-sm text-white/90"
      >
        <option value="">All status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="rounded-xl border border-white/10 bg-[#0E1014] px-3 py-2 text-sm text-white/90"
      >
        {pageSizeOptions.map((n) => (
          <option key={n} value={n}>
            {n} / page
          </option>
        ))}
      </select>
    </div>
  );
}
