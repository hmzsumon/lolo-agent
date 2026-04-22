/* ── SetPinPage: create or change 6-digit PIN ─────────────── */
"use client";

import { useSetSecurityPinMutation } from "@/redux/features/auth/authApi";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

export default function SetPinPage() {
  const { user } = useSelector((state: any) => state.auth);
  const hasPin = !!user?.securityPin;

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [setSecurityPin, { isLoading }] = useSetSecurityPinMutation();

  /* ── helper: only keep 0-9 and max 6 ─────────────────────── */
  const onlySixDigits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  /* ── submit ──────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // current PIN needed only if changing
    if (hasPin && currentPin.length !== 6) {
      return toast.error("Enter your current 6-digit PIN");
    }

    if (newPin.length !== 6) {
      return toast.error("New PIN must be exactly 6 digits");
    }

    if (newPin !== confirmPin) {
      return toast.error("New PIN and confirm PIN do not match");
    }

    try {
      const payload: { newPin: string; oldPin?: string } = { newPin };
      if (hasPin) payload.oldPin = currentPin;

      const res = await setSecurityPin(payload).unwrap();
      toast.success(res?.message || (hasPin ? "PIN changed" : "PIN set"));
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.data?.error || "Unable to update PIN";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-extrabold">
        {hasPin ? "Change PIN" : "Set New PIN"}
      </h1>

      {/* ── current PIN (only if changing) ───────────────────── */}
      {hasPin && (
        <label className="block text-sm">
          <span className="text-neutral-400">Current PIN</span>
          <input
            inputMode="numeric"
            pattern="\d*"
            maxLength={6}
            value={currentPin}
            onChange={(e) => setCurrentPin(onlySixDigits(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/40"
            placeholder="••••••"
          />
        </label>
      )}

      {/* ── new PIN ──────────────────────────────────────────── */}
      <label className="block text-sm">
        <span className="text-neutral-400">New PIN (6 digits)</span>
        <input
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          value={newPin}
          onChange={(e) => setNewPin(onlySixDigits(e.target.value))}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/40"
          placeholder="••••••"
        />
      </label>

      {/* ── confirm PIN ──────────────────────────────────────── */}
      <label className="block text-sm">
        <span className="text-neutral-400">Confirm New PIN</span>
        <input
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          value={confirmPin}
          onChange={(e) => setConfirmPin(onlySixDigits(e.target.value))}
          className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/40"
          placeholder="••••••"
        />
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {isLoading ? "Saving…" : hasPin ? "Change PIN" : "Save PIN"}
      </button>

      {/* ── small help ───────────────────────────────────────── */}
      <p className="text-xs text-neutral-500">
        PIN must be exactly 6 digits. Numbers only.
      </p>
    </form>
  );
}
