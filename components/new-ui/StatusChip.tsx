/* ────────── tiny Status chip ────────── */
export default function StatusChip({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  const map = {
    pending: {
      text: "Pending",
      cls: "bg-[#FF8A00]/15 text-[#FF8A00] border-[#FF8A00]/30",
    },
    approved: {
      text: "Approved",
      cls: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
    },
    rejected: {
      text: "Rejected",
      cls: "bg-rose-400/15 text-rose-400 border-rose-400/30",
    },
  } as const;

  const s = map[status] ?? map.pending;

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${s.cls}`}>
      {s.text}
    </span>
  );
}
