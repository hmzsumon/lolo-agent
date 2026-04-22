/* ──────────────────────────────────────────────────────────────────────────
   OpenAccountFab — floating plus button
────────────────────────────────────────────────────────────────────────── */
export default function OpenAccountFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-6 bottom-6 w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 text-2xl"
      aria-label="Open account"
      title="Open account"
    >
      +
    </button>
  );
}
