"use client";

import Link from "next/link";
import { INVITE_CARD } from "./sidebar-data";

/* ── small reusable invite card ────────────────────────────── */
export default function SidebarInviteCard() {
  return (
    <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
      <div className="text-sm font-medium">{INVITE_CARD.title}</div>
      <Link
        href={INVITE_CARD.href}
        className="mt-2 inline-flex rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-neutral-950"
      >
        Open
      </Link>
    </div>
  );
}
