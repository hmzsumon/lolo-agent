// /components/admin/TeamSummaryList.tsx
"use client";

/* ────────── Comments lik this ────────── */
/* right side list of levels and commissions */

export type TeamRow = { level: string; commission: number };

export default function TeamSummaryList({ rows }: { rows: TeamRow[] }) {
  return (
    <div className="rounded-2xl bg-[#0E1014] border border-white/5 p-5">
      <p className="text-sm text-white/60 mb-3">Team Summary</p>
      <ul className="space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.level} className="flex items-center justify-between">
            <span className="text-white/70">{r.level}</span>
            <span
              className={`${
                r.commission >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {r.commission >= 0 ? "$" : "-$"}
              {Math.abs(r.commission).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
