"use client";
import RowBox from "@/components/trade/parts/RowBox";
import { ReactNode } from "react";

export type NumberFieldProps = {
  label: string;
  valueText: string;
  onValueText: (t: string) => void;
  onMinus: () => void;
  onPlus: () => void;
  right?: ReactNode;
  inputAria?: string;
};

export default function NumberField({
  label,
  valueText,
  onValueText,
  onMinus,
  onPlus,
  right,
  inputAria,
}: NumberFieldProps) {
  return (
    <div>
      <div className="mb-1 text-sm text-neutral-400">{label}</div>

      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          className="shrink-0 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-lg hover:bg-neutral-800 active:scale-[0.98]"
          onClick={onMinus}
        >
          −
        </button>

        <RowBox className="flex-1">
          {/* type=text + inputMode=decimal → মোবাইলে numeric keypad */}
          <input
            type="text"
            inputMode="decimal"
            aria-label={inputAria || label}
            pattern="[0-9]*[.]?[0-9]*"
            value={valueText}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.]/g, "");
              const parts = raw.split(".");
              const safe =
                parts.length > 1
                  ? parts[0] + "." + parts.slice(1).join("")
                  : raw;
              onValueText(safe);
            }}
            className="w-full bg-transparent text-center font-semibold outline-none focus:outline-none"
          />
        </RowBox>

        <button
          type="button"
          className="shrink-0 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-lg hover:bg-neutral-800 active:scale-[0.98]"
          onClick={onPlus}
        >
          +
        </button>

        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}
