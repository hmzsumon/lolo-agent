/* ────────── imports ────────── */
"use client";
import React from "react";

/* ────────── component ────────── */
export default function UserKeyStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E1014] p-4">
      <div className="text-xs uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-white/90">{value}</div>
    </div>
  );
}
