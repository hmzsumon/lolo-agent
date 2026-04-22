/* ──────────────────────────────────────────────────────────────────────────
   PromoCard — “Trade with 3x fewer stop outs.” banner
────────────────────────────────────────────────────────────────────────── */
export default function PromoCard() {
  return (
    <div className="mt-4 rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex items-center gap-4">
      <img
        src="/assets/tick_sign.webp"
        alt="tick"
        className="w-16 h-16 object-contain"
      />
      <div>
        <div className="text-lg font-semibold">
          Trade with 3x fewer stop outs.
        </div>
        <div className="text-sm text-neutral-400">
          Trade with the lowest Stop Out Level in the market.
        </div>
      </div>
    </div>
  );
}
