/* ================================================
   FILE: app/components/steps/PlanCarousel.tsx
   DESC: Multi-card slider (Step 1)
================================================= */
"use client";

import { useMemo, useState } from "react";

// Single source of truth for plans
export const PLANS = [
  {
    key: "lite" as const,
    title: "Trade Lite",
    subtitle: "Smaller lots, lower risk. Great for practicing.",
    amount: 30,
    rows: [
      ["Min deposit", "30 USD"],
      ["Profit target", "2% - 4% per day"],
      ["Max leverage", "1:Unlimited"],
    ],
  },
  {
    key: "core" as const,
    title: "Trade Core",
    subtitle: "Balanced spreads with fast execution.",
    amount: 50,
    rows: [
      ["Min deposit", "50 USD"],
      ["Profit target", "2% - 4% per day"],
      ["Max leverage", "1:Unlimited"],
    ],
  },
  {
    key: "prime" as const,
    title: "Trade Prime",
    subtitle: "Lower spreads for active day traders.",
    amount: 80,
    rows: [
      ["Min deposit", "80 USD"],
      ["Profit target", "2% - 4% per day"],
      ["Max leverage", "1:Unlimited"],
    ],
  },
  {
    key: "elite" as const,
    title: "Trade Elite",
    subtitle: "Priority routing & premium support.",
    amount: 100,
    rows: [
      ["Min deposit", "100 USD"],
      ["Profit target", "2% - 4% per day"],
      ["Max leverage", "1:Unlimited"],
    ],
  },
  {
    key: "ultra" as const,
    title: "Trade Ultra",
    subtitle: "Ultra-tight spreads for scalping.",
    amount: 200,
    rows: [
      ["Min deposit", "200 USD"],
      ["Profit target", "2% - 4% per day"],
      ["Max leverage", "1:Unlimited"],
    ],
  },
  {
    key: "infinity" as const,
    title: "Trade Infinity",
    subtitle: "Deep liquidity with VIP features.",
    amount: 500,
    rows: [
      ["Min deposit", "500 USD"],
      ["Profit target", "2% - 4% per day"],
      ["Max leverage", "1:Unlimited"],
    ],
  },
  {
    key: "titan" as const,
    title: "Trade Titan",
    subtitle: "Institutional grade execution & tools.",
    amount: 1000,
    rows: [
      ["Min deposit", "1000 USD"],
      ["Profit target", "2% - 4% per day"],
      ["Max leverage", "1:Unlimited"],
    ],
  },
] as const;

export type PlanKey = (typeof PLANS)[number]["key"]; // "lite" | "core" | ...

export default function PlanCarousel({
  value,
  onContinue,
  cards = PLANS,
}: {
  value: PlanKey; // starting plan key
  onContinue: (type: PlanKey) => void; // return the selected key
  cards?: typeof PLANS; // allow overriding cards if needed
}) {
  const startIndex = useMemo(() => {
    const i = cards.findIndex((c) => c.key === value);
    return i >= 0 ? i : 0;
  }, [cards, value]);

  const [idx, setIdx] = useState(startIndex);
  const active = cards[idx];

  const goTo = (i: number) =>
    setIdx(((i % cards.length) + cards.length) % cards.length);
  const next = () => goTo(idx + 1);
  const prev = () => goTo(idx - 1);

  return (
    <div className="p-4">
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-bold">{active.title}</div>
          </div>

          {/* Arrow controls */}
          <div className="flex items-center gap-2">
            <button
              className="h-9 w-9 rounded-full border border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
              onClick={prev}
              aria-label="previous"
            >
              ‹
            </button>
            <button
              className="h-9 w-9 rounded-full border border-neutral-800 bg-neutral-900 hover:bg-neutral-800"
              onClick={next}
              aria-label="next"
            >
              ›
            </button>
          </div>
        </div>
        <div className="text-xs text-neutral-400 mt-2">{active.subtitle}</div>

        <div className="mt-4 space-y-2 text-sm">
          {active.rows.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between border-b border-neutral-800 py-1"
            >
              <div className="text-neutral-400">{k}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots — dynamically match `cards.length` */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {cards.map((_, i) => (
          <button
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${
              i === idx ? "bg-neutral-200" : "bg-neutral-700"
            }`}
            onClick={() => goTo(i)}
            aria-current={i === idx}
            aria-label={`slide-${i + 1}`}
          />
        ))}
      </div>

      <div className="p-2" />

      <button
        className="w-full py-3 rounded-xl bg-yellow-400 text-black font-semibold"
        onClick={() => onContinue(active.key)}
      >
        Continue
      </button>
    </div>
  );
}
