// /components/ui/Badge.tsx
/* ────────── status badge ────────── */
export default function Badge({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  const s = {
    pending: {
      text: "Pending",
      cls: "bg-[#FF6A1A]/15 text-[#FF6A1A] border-[#FF6A1A]/30",
    },
    approved: {
      text: "Approved",
      cls: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
    },
    rejected: {
      text: "Rejected",
      cls: "bg-rose-400/15 text-rose-400 border-rose-400/30",
    },
  }[status];
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${s.cls}`}>
      {s.text}
    </span>
  );
}
