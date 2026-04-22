// /components/admin/MetricCard.tsx
"use client";

import { ReactNode } from "react";

/* ────────── Comments lik this ────────── */
/* small summary card used on the top row */

type MetricCardProps = {
  title: string;
  value: string;
  accent?: ReactNode; // icon or delta
  subtitle?: string; // e.g., "+12.5%"
};

export default function MetricCard({
  title,
  value,
  accent,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-[#0E1014] border border-white/5 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">{title}</p>
        {accent}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-2xl font-semibold tracking-tight">{value}</h3>
        {subtitle && (
          <span className="text-xs text-emerald-400">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
