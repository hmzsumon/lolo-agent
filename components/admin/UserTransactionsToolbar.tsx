/* ────────── imports ────────── */
"use client";
import { useEffect, useMemo, useState } from "react";

/* ────────── props ────────── */
export default function UserTransactionsToolbar({
  search,
  onSearchChange,
  transactionType,
  onTypeChange,
  isCashIn,
  onCashInChange,
  isCashOut,
  onCashOutChange,
  pageSize,
  onPageSizeChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  transactionType?: string;
  onTypeChange: (v?: string) => void;
  isCashIn?: "true" | "false";
  onCashInChange: (v?: "true" | "false") => void;
  isCashOut?: "true" | "false";
  onCashOutChange: (v?: "true" | "false") => void;
  pageSize: number;
  onPageSizeChange: (n: number) => void;
}) {
  /* ────────── debounced search ────────── */
  const [localSearch, setLocalSearch] = useState(search);
  useEffect(() => setLocalSearch(search), [search]);
  useEffect(() => {
    const t = setTimeout(() => onSearchChange(localSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [localSearch, onSearchChange]);

  const pageSizeOptions = useMemo(() => [10, 20, 50, 100, 200], []);

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
      <input
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search purpose / description / unique id"
        className="w-full rounded-xl border border-white/10 bg-[#0E1014] px-3 py-2 text-sm text-white/90 outline-none"
      />
      <input
        value={transactionType ?? ""}
        onChange={(e) => onTypeChange(e.target.value || undefined)}
        placeholder="Type (e.g., cashIn, cashOut)"
        className="w-full rounded-xl border border-white/10 bg-[#0E1014] px-3 py-2 text-sm text-white/90 outline-none"
      />
      <select
        value={isCashIn ?? ""}
        onChange={(e) => onCashInChange((e.target.value as any) || undefined)}
        className="rounded-xl border border-white/10 bg-[#0E1014] px-3 py-2 text-sm text-white/90"
      >
        <option value="">All CashIn</option>
        <option value="true">CashIn</option>
        <option value="false">Not CashIn</option>
      </select>
      <select
        value={isCashOut ?? ""}
        onChange={(e) => onCashOutChange((e.target.value as any) || undefined)}
        className="rounded-xl border border-white/10 bg-[#0E1014] px-3 py-2 text-sm text-white/90"
      >
        <option value="">All CashOut</option>
        <option value="true">CashOut</option>
        <option value="false">Not CashOut</option>
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
