/* ────────── imports ────────── */
"use client";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminUsersToolbar from "@/components/admin/AdminUsersToolbar";
import { useGetAllUsersQuery } from "@/redux/features/admin/adminUsersApi";

import { useMemo, useState } from "react";

/* ────────── page ────────── */
const AllUsersPage = () => {
  /* ────────── UI state ────────── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string | undefined>();
  const [is_active, setIsActive] = useState<"true" | "false" | undefined>();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  /* ────────── data ────────── */
  const { data, isLoading, isFetching } = useGetAllUsersQuery({
    page,
    limit: pageSize,
    search: search || undefined,
    role,
    is_active,
    sortBy,
    sortOrder,
  });

  const users = data?.users ?? [];
  const total = data?.pagination?.total ?? 0;

  /* ────────── sort handler ────────── */
  const handleSortChange = (m: any) => {
    const first = Array.isArray(m) && m.length ? m[0] : undefined;
    if (first?.field) setSortBy(first.field);
    if (first?.sort) setSortOrder(first.sort);
  };

  /* ────────── initial sort for grid ────────── */
  const initialSort = useMemo(
    () => [{ field: sortBy, sort: sortOrder }] as any,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">All Users</h1>
            <p className="text-xs text-white/50">
              Admin dashboard • manage users
            </p>
          </div>
        </div>

        <AdminUsersToolbar
          search={search}
          onSearchChange={(v) => {
            setPage(1);
            setSearch(v);
          }}
          role={role}
          onRoleChange={(v) => {
            setPage(1);
            setRole(v);
          }}
          is_active={is_active}
          onActiveChange={(v) => {
            setPage(1);
            setIsActive(v);
          }}
          pageSize={pageSize}
          onPageSizeChange={(n) => {
            setPage(1);
            setPageSize(n);
          }}
        />

        <AdminUsersTable
          rows={users}
          loading={isLoading || isFetching}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPage(1);
            setPageSize(n);
          }}
          onSortChange={handleSortChange}
          initialSort={initialSort}
        />
      </div>
    </main>
  );
};

export default AllUsersPage;
