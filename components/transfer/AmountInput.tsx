"use client";

import { useEffect, useState } from "react";

export default function AmountInput({
  currency = "USD",
  value,
  onChange,
  max,
}: {
  currency?: string;
  value: number;
  onChange: (v: number) => void;
  max?: number; // from-account available balance
}) {
  const [txt, setTxt] = useState(String(value || ""));

  useEffect(() => setTxt(String(value || "")), [value]);

  const n = Number(txt);
  const invalid =
    !txt ||
    !Number.isFinite(n) ||
    n <= 0 ||
    (typeof max === "number" && n > max) ||
    (txt.includes(".") && txt.split(".")[1].length > 2);

  return (
    <div>
      <div className="mb-1 text-sm text-neutral-300">Transfer amount</div>
      <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
        <span className="px-3 py-2 text-neutral-400 text-sm">{currency}</span>
        <input
          inputMode="decimal"
          value={txt}
          onChange={(e) => setTxt(e.target.value.replace(/[^0-9.]/g, ""))}
          onBlur={() => onChange(Number(Number(txt).toFixed(2)) || 0)}
          placeholder="Keep up to 2 decimal"
          className="flex-1 bg-transparent px-3 py-2 outline-none"
        />
      </div>
      {invalid && (
        <div className="mt-1 text-xs text-red-400">
          {txt ? "Invalid amount or exceeds balance" : "Amount required"}
        </div>
      )}
    </div>
  );
}
