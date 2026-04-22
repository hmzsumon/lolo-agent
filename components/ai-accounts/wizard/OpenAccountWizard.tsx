/* ================================================
   FILE: app/components/OpenAccountWizard.tsx
   DESC: 2-step wizard → (1) Select Plan → (2) Confirm & Create
================================================= */
"use client";

import { useState } from "react";
import ConfirmAccount from "./steps/ConfirmAccount";
import PlanCarousel, { PlanKey, PLANS } from "./steps/PlanCarousel";

export type WizardState = {
  mode: "ai"; // fixed
  type: PlanKey; // selected plan key
  currency: "USD" | "BDT"; // simple currency choice
  nickname?: string; // optional
  amount: number; // deposit amount
};

export default function OpenAccountWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const [step, setStep] = useState<1 | 2>(1);
  const [state, setState] = useState<WizardState>({
    mode: "ai",
    type: "lite",
    currency: "USD",
    amount: 30,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-950 text-white w-full max-w-lg rounded-2xl border border-neutral-800 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="text-lg font-semibold">
            {step === 1 ? "Open account" : "Confirm details"}
          </div>
          <button onClick={onClose} className="opacity-70">
            ✕
          </button>
        </div>

        {/* steps */}
        {step === 1 && (
          <PlanCarousel
            value={state.type}
            onContinue={(type) => {
              const amt =
                PLANS.find((p) => p.key === type)?.amount ?? state.amount;
              setState((s) => ({ ...s, type, amount: amt }));
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <ConfirmAccount
            state={state}
            onBack={() => setStep(1)}
            onConfirm={() => onClose()}
          />
        )}
      </div>
    </div>
  );
}
