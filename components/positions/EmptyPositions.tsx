// components/positions/EmptyPositions.tsx
"use client";

/* ── empty-state card ────────────────────────────────────── */

export default function EmptyPositions() {
  return (
    <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 text-center">
      <div className="text-neutral-300 font-medium">No open positions</div>
      <div className="mt-1 text-sm text-neutral-500">
        Explore more instruments and start trading.
      </div>

      <div className="mt-4 grid place-items-center">
        <button
          className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
          onClick={() => {
            // optional: route to trade page or open instrument drawer
            window.dispatchEvent(new CustomEvent("trade:openDrawer"));
          }}
        >
          Explore more instruments
        </button>
      </div>
    </div>
  );
}
