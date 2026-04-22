/* ────────── imports ────────── */
"use client";
import UserTransactionsTable from "@/components/admin/UserTransactionsTable";
import UserTransactionsToolbar from "@/components/admin/UserTransactionsToolbar";
import {
  useGetUserByIdQuery,
  useGetUserTransactionsQuery,
} from "@/redux/features/admin/adminUsersApi";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

/* ────────── page ────────── */
export default function AdminUserTransactionsPage() {
  /* ────────── params ────────── */
  const params = useParams<{ id: string }>();
  const id = params.id;

  /* ────────── UI state ────────── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [transactionType, setTransactionType] = useState<string | undefined>();
  const [isCashIn, setIsCashIn] = useState<"true" | "false" | undefined>();
  const [isCashOut, setIsCashOut] = useState<"true" | "false" | undefined>();

  /* ────────── user header (optional) ────────── */
  const { data: userData } = useGetUserByIdQuery({ id });
  const user = userData?.user;

  /* ────────── data ────────── */
  const { data, isLoading, isFetching } = useGetUserTransactionsQuery({
    id,
    page,
    limit: pageSize,
    search: search || undefined,
    sortBy,
    sortOrder,
    transactionType,
    isCashIn,
    isCashOut,
  });

  const rows = data?.transactions ?? [];
  const total = data?.pagination?.total ?? 0;

  /* ────────── grid sort handler ────────── */
  const handleSortChange = (m: any) => {
    const first = Array.isArray(m) && m.length ? m[0] : undefined;
    if (first?.field) setSortBy(first.field);
    if (first?.sort) setSortOrder(first.sort);
  };

  /* ────────── initial sort ────────── */
  const initialSort = useMemo(
    () => [{ field: sortBy, sort: sortOrder }] as any,
    []
  );

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Transactions</h1>
            <p className="text-xs text-white/50">
              {user ? `${user.name} (${user.customerId})` : "User"} · All
              transactions
            </p>
          </div>
          <Link
            href={`/users/${id}`}
            className="text-sm text-teal-300 hover:underline"
          >
            ← Back to user
          </Link>
        </div>

        <UserTransactionsToolbar
          search={search}
          onSearchChange={(v) => {
            setPage(1);
            setSearch(v);
          }}
          transactionType={transactionType}
          onTypeChange={(v) => {
            setPage(1);
            setTransactionType(v);
          }}
          isCashIn={isCashIn}
          onCashInChange={(v) => {
            setPage(1);
            setIsCashIn(v);
          }}
          isCashOut={isCashOut}
          onCashOutChange={(v) => {
            setPage(1);
            setIsCashOut(v);
          }}
          pageSize={pageSize}
          onPageSizeChange={(n) => {
            setPage(1);
            setPageSize(n);
          }}
        />

        <UserTransactionsTable
          rows={rows}
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
}
