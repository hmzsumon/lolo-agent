// /components/admin/LatestTransactionsTable.tsx
"use client";

import { formatCurrency } from "@/lib/format";

/* ────────── Comments lik this ────────── */
/* plain table – keep it small and readable */

export type Txn = {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO
};

export default function LatestTransactionsTable({ rows }: { rows: Txn[] }) {
  return (
    <div className="rounded-2xl bg-[#0E1014] border border-white/5 p-5">
      <p className="text-sm text-white/60 mb-3">Latest Transactions</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/50 border-b border-white/5">
              <th className="py-2 text-left font-medium">Name</th>
              <th className="py-2 text-left font-medium">Amount</th>
              <th className="py-2 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-white/5 last:border-0">
                <td className="py-3">{r.name}</td>
                <td
                  className={`py-3 ${
                    r.amount >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {r.amount >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(r.amount))}
                </td>
                <td className="py-3 text-white/60">
                  {new Date(r.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
