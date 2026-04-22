/* ===========================================================
   FILE: app/components/steps/ConfirmAccount.tsx
   DESC: Step 2 — preview chosen plan & confirm (no password)
=========================================================== */
"use client";

import { useCreateAiAccountMutation } from "@/redux/features/ai-account/ai-accountApi";
import { useMemo } from "react";
import type { WizardState } from "../OpenAccountWizard";
import { PLANS } from "./PlanCarousel";

export default function ConfirmAccount({
  state,
  onBack,
  onConfirm,
}: {
  state: WizardState;
  onBack: () => void;
  onConfirm: () => void; // called after successful API
}) {
  const [createAccount, { isLoading }] = useCreateAiAccountMutation();
  const plan = useMemo(
    () => PLANS.find((p) => p.key === state.type)!,
    [state.type]
  );

  const submitHandler = async () => {
    const payload = {
      plan: state.type,
      currency: state.currency,
      mode: state.mode,
      amount: state.amount, // <<==== amount যোগ হল
    } as const;

    const res = await createAccount(payload).unwrap();
    if (res?.success) onConfirm();
    console.log("payload", payload);
    onConfirm(); // remove this when you enable the API call above
  };

  return (
    <div className="p-4">
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
        <div className="text-lg font-semibold">Review & confirm</div>

        <div className="mt-3 rounded-xl border border-neutral-800">
          <div className="p-4 border-b border-neutral-800">
            <div className="text-xl font-bold">{plan.title}</div>
            <div className="text-xs text-neutral-400 mt-1">{plan.subtitle}</div>
          </div>

          <div className="p-4 space-y-2 text-sm">
            {plan.rows.map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between border-b border-neutral-800 py-1"
              >
                <div className="text-neutral-400">{k}</div>
                <div>{v}</div>
              </div>
            ))}
            <div className="flex justify-between py-1">
              <div className="text-neutral-400">Currency</div>
              <div>{state.currency}</div>
            </div>
            <div className="flex justify-between py-1">
              <div className="text-neutral-400">Amount</div>
              <div>
                {state.amount} {state.currency}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 py-3 rounded-xl border border-neutral-800"
            onClick={onBack}
          >
            Back
          </button>
          <button
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-semibold disabled:opacity-50"
            onClick={submitHandler}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
