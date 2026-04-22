"use client";

/* ────────── app/(auth)/games/categories/components/StatusPill.tsx ─────────── */

export default function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs ${
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-white/15 bg-white/5 text-white/50"
      }`}
    >
      {active ? "Yes" : "No"}
    </span>
  );
}
