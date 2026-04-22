// /components/ui/DetailsList.tsx
/* ────────── key-value list rows ────────── */
import { ReactNode } from "react";

export function Row({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center w-full   px-4 gap-2 border-t border-white/10 py-4 md:grid md:grid-cols-12 first:border-t-0">
      <div className="md:col-span-3 text-white/70">{label}</div>
      <div className="md:col-span-9">{children}</div>
    </div>
  );
}
