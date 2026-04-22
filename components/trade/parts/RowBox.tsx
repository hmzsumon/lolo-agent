// FILE: components/trade/parts/RowBox.tsx
"use client";
import { ReactNode } from "react";

export default function RowBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 ${className}`}
    >
      {children}
    </div>
  );
}
