"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Mail, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { useVerifyEmailMutation } from "@/redux/features/auth/authApi";
import { Button, Field, Input } from "./UI";

// ── schema (code only) ────────────────────────────────────────
const schema = z.object({
  code: z
    .string()
    .min(4, "Code must be at least 4 chars")
    .max(8, "Max 8 chars"),
});

type Values = z.infer<typeof schema>;

// ── helper: read & sanitize email from query ──────────────────
function useEmailFromQuery() {
  const qp = useSearchParams();
  const raw = qp.get("email") ?? qp.get("eamil") ?? "";
  return useMemo(() => {
    try {
      const dec = decodeURIComponent(raw);
      const trimmed = dec
        .replace(/^"+|"+$/g, "")
        .trim()
        .toLowerCase();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      return ok ? trimmed : "";
    } catch {
      return "";
    }
  }, [raw]);
}

// ── component ─────────────────────────────────────────────────
const VerifyEmailForm: React.FC<{ onSuccess?: () => void }> = ({
  onSuccess,
}) => {
  const router = useRouter();
  const email = useEmailFromQuery();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { code: "" },
  });

  const submit = handleSubmit(async ({ code }) => {
    const tId = toast.loading("Verifying email...");
    try {
      if (!email) throw new Error("Missing email in URL");
      const res = await verifyEmail({ email, code }).unwrap();
      toast.success(res?.message || "Email verified", { id: tId });
      onSuccess?.();
      router.push("/register-login");
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Verification failed", {
        id: tId,
      });
    }
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* ── email preview (read-only; taken from URL) ─────────── */}
      <div className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2">
        <Mail size={16} className="text-neutral-400" />
        <span className="text-sm">
          {email ? email : "No email found in URL"}
        </span>
      </div>

      {/* ── friendly note about the code ─────────────────────── */}
      {email && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-700/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          <Info size={16} className="mt-0.5 opacity-90" />
          <p>
            We’ve sent a verification code to{" "}
            <span className="font-medium">{email}</span>. Please check your
            inbox (and spam folder) and enter the code below.
          </p>
        </div>
      )}

      {/* ── code field ────────────────────────────────────────── */}
      <Field label="Verification code" error={errors.code?.message}>
        <div className="relative">
          <ShieldCheck
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            size={16}
          />
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            {...register("code")}
            className="pl-9 tracking-widest"
          />
        </div>
      </Field>

      {/* ── hidden email (submits with form) ──────────────────── */}
      <input type="hidden" name="email" value={email} />

      {/* ── submit ───────────────────────────────────────────── */}
      <Button type="submit" disabled={isLoading || !email} className="w-full">
        {isLoading ? "Verifying..." : "Verify Email"}
      </Button>

      {/* ── hint if email missing ────────────────────────────── */}
      {!email && (
        <p className="text-xs text-amber-400">
          Add ?email=you@example.com to the URL (or ?eamil=...) to verify.
        </p>
      )}
    </form>
  );
};

export default VerifyEmailForm;
