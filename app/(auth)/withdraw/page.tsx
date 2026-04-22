"use client";

import {
  useResendVerificationEmailMutation,
  useVerifyOtpForForgotPasswordMutation,
} from "@/redux/features/auth/authApi";
import { useCreateWithdrawRequestMutation } from "@/redux/features/withdraw/withdrawApi";
import { fetchBaseQueryError } from "@/redux/services/helpers";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiInfo,
  FiMail,
} from "react-icons/fi";
import { useSelector } from "react-redux";

/* ── UI helpers ───────────────────────────────────────────── */
const StatPill = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-emerald-700/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
    {children}
  </span>
);

export default function WithdrawPage() {
  const { user } = useSelector((state: any) => state.auth);

  /* ── withdraw create ────────────────────────────────────── */
  const [
    createWithdrawRequest,
    {
      isLoading: isCreateLoading,
      isError: isCreateError,
      isSuccess: isCreateSuccess,
      error: createApiError,
    },
  ] = useCreateWithdrawRequestMutation();

  /* ── OTP verify (withdrawal গেটের মতো ব্যবহার) ───────────── */
  const [
    verifyOtpForForgotPassword,
    {
      isLoading: isVerifyLoading,
      isError: isVerifyError,
      isSuccess: isVerifySuccess,
      error: verifyApiError,
    },
  ] = useVerifyOtpForForgotPasswordMutation();

  /* ── resend OTP ─────────────────────────────────────────── */
  const [
    resendVerificationEmail,
    {
      isLoading: isResendLoading,
      isError: isResendError,
      isSuccess: isResendSuccess,
      error: resendApiError,
    },
  ] = useResendVerificationEmailMutation();

  /* ── local states ───────────────────────────────────────── */
  const [amount, setAmount] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [network, setNetwork] = useState<"TRC20" | "BEP20">("TRC20");
  const [otp, setOtp] = useState<string>("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [amountError, setAmountError] = useState<string>("");

  /* ── constants / derived ────────────────────────────────── */
  const minWithdraw = 30;
  const feeRate = 0.05;
  const availableBalance = useMemo(
    () => Math.max(0, (user?.m_balance || 0) - 3),
    [user?.m_balance]
  );

  const withdrawFee = useMemo(() => {
    const n = parseFloat(amount || "0");
    return isNaN(n) ? 0 : +(n * feeRate).toFixed(2);
  }, [amount]);

  const actualReceipt = useMemo(() => {
    const n = parseFloat(amount || "0");
    return isNaN(n) ? 0 : +(n - n * feeRate).toFixed(2);
  }, [amount]);

  /* ── handlers ───────────────────────────────────────────── */
  const handleAmountChange = (value: string) => {
    setAmount(value);
    const parsed = parseFloat(value);

    if (!value) return setAmountError("");
    if (isNaN(parsed) || parsed <= 0)
      return setAmountError("Enter a valid amount");
    if (parsed < minWithdraw)
      return setAmountError(`Minimum withdrawal amount is ${minWithdraw} USDT`);
    if (parsed > availableBalance)
      return setAmountError("Amount exceeds available balance");

    setAmountError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !!amountError) {
      toast.error(amountError || `Enter amount (min $${minWithdraw})`);
      return;
    }
    if (!walletAddress) {
      toast.error("Please enter your wallet address");
      return;
    }
    if (user?.is_withdraw_block) {
      toast.error("You must complete at least 9 tasks to withdraw");
      return;
    }
    // ── send OTP to email
    resendVerificationEmail({ email: user?.email });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }
    verifyOtpForForgotPassword({ email: user?.email, otp }).unwrap();
  };

  const handleRequestWithdraw = () => {
    const payload = {
      amount: parseFloat(amount),
      withdrawAddress: walletAddress,
      network,
      withdrawFee,
      receiptAmount: actualReceipt,
    };
    createWithdrawRequest(payload).unwrap();
  };

  /* ── effects: resend OTP result ─────────────────────────── */
  useEffect(() => {
    if (isResendError) {
      const msg =
        (resendApiError as fetchBaseQueryError)?.data?.error ||
        "Failed to send OTP";
      toast.error(msg);
    } else if (isResendSuccess) {
      toast.success("OTP sent! Check your email.");
      setStep("verify");
    }
  }, [isResendError, isResendSuccess, resendApiError]);

  /* ── effects: verify OTP result ─────────────────────────── */
  useEffect(() => {
    if (isVerifyError) {
      const msg =
        (verifyApiError as fetchBaseQueryError)?.data?.error ||
        "OTP verification failed";
      toast.error(msg);
    } else if (isVerifySuccess) {
      handleRequestWithdraw();
      setOtp("");
      setStep("form");
    }
  }, [isVerifyError, isVerifySuccess, verifyApiError]);

  /* ── effects: create withdraw result ────────────────────── */
  useEffect(() => {
    if (isCreateError) {
      const msg =
        (createApiError as fetchBaseQueryError)?.data?.error ||
        "Unable to create request";
      toast.error(msg);
    } else if (isCreateSuccess) {
      toast.success("Withdrawal request created successfully!");
      setAmount("");
      setWalletAddress("");
      setOtp("");
      setStep("form");
    }
  }, [isCreateError, isCreateSuccess, createApiError]);

  return (
    <div className="min-h-screen bg-neutral-950 px-3 py-5 md:px-6 md:py-8">
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto w-full max-w-2xl"
      >
        {/* ── card ──────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 ring-1 ring-emerald-800/10">
          {/* ── header ─────────────────────────────────────── */}
          {/* ── header (responsive pills) ───────────────────────────── */}
          <div className="relative border-b border-neutral-800 bg-gradient-to-r from-emerald-600 to-cyan-600 p-4 text-neutral-950">
            {/* top row: back + title (mobile: stacked) */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/dashboard"
                className="inline-flex items-center self-start rounded-lg bg-black/10 px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-black/20"
              >
                <FiArrowLeft className="mr-2" /> Back
              </Link>

              {/* title: center on mobile, pill-look */}
              <h1 className="mx-auto rounded-xl bg-white/20 px-4 py-1 text-center text-base font-extrabold tracking-wide text-white shadow-sm sm:mx-0 sm:text-lg">
                Withdraw USDT
              </h1>

              {/* spacer for symmetry on desktop */}
              <div className="hidden w-[88px] sm:block" />
            </div>

            {/* pills row: mobile -> grid 2 cols, desktop -> inline */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
              {/* pill */}
              <span className="inline-flex items-center justify-between gap-2 rounded-full border border-emerald-700/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100 sm:justify-center sm:text-[13px]">
                <span className="inline-flex items-center gap-1">
                  <FiClock className="opacity-90" /> Min:
                </span>
                <strong className="text-white/95">${minWithdraw}</strong>
              </span>

              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-700/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100 sm:text-[13px]">
                Fee: <strong className="text-white/95">5%</strong>
              </span>

              <span className="col-span-2 inline-flex items-center justify-between gap-2 rounded-full border border-emerald-700/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100 sm:col-span-1 sm:justify-center sm:text-[13px]">
                <span>Available:</span>
                <strong className="text-white/95">
                  ${availableBalance.toFixed(2)}
                </strong>
              </span>
            </div>
          </div>

          {/* ── content ─────────────────────────────────────── */}
          <div className="p-5">
            {step === "form" ? (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* ── amount ────────────────────────────────── */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-200">
                    Amount (USDT)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      $
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder={`${minWithdraw} or more`}
                      className="w-full rounded-lg border border-neutral-800 bg-neutral-900/70 px-9 py-2.5 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-emerald-600/40"
                      step="0.01"
                      min={minWithdraw}
                    />
                  </div>

                  {/* ── inline calc row ─────────────────────── */}
                  {amount && !amountError && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-neutral-300 md:grid-cols-3">
                      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-1.5">
                        Fee (5%):{" "}
                        <span className="font-semibold text-emerald-300">
                          ${withdrawFee}
                        </span>
                      </div>
                      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-1.5">
                        You receive:{" "}
                        <span className="font-semibold text-emerald-300">
                          ${actualReceipt}
                        </span>
                      </div>
                      <div className="col-span-2 hidden rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 md:block">
                        Network:{" "}
                        <span className="font-semibold">{network}</span>
                      </div>
                    </div>
                  )}

                  {!!amountError && (
                    <p className="mt-1 flex items-center text-xs text-red-500">
                      <FiAlertCircle className="mr-1" /> {amountError}
                    </p>
                  )}
                </div>

                {/* ── network selector ──────────────────────── */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-200">
                    Select network
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["TRC20", "BEP20"] as const).map((n) => {
                      const active = network === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNetwork(n)}
                          className={[
                            "rounded-xl border px-4 py-2 text-sm transition",
                            active
                              ? "border-emerald-700/50 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-700/30"
                              : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700",
                          ].join(" ")}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── wallet address ────────────────────────── */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-200">
                    {network} wallet address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder={`Paste ${network} address`}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2.5 font-mono text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:ring-2 focus:ring-emerald-600/40"
                    required
                  />
                </div>

                {/* ── submit ────────────────────────────────── */}
                <button
                  type="submit"
                  disabled={
                    !amount ||
                    !!amountError ||
                    !walletAddress ||
                    user?.is_withdraw_block ||
                    !availableBalance ||
                    isResendLoading
                  }
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isResendLoading ? "Requesting..." : "Request withdrawal"}
                </button>

                {user?.is_withdraw_block && (
                  <p className="mt-1 flex items-center text-xs text-red-500">
                    <FiAlertCircle className="mr-1" />
                    You must complete at least 9 tasks to withdraw
                  </p>
                )}
              </motion.form>
            ) : (
              /* ── OTP step ───────────────────────────────── */
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleVerify}
                className="space-y-5"
              >
                {/* ── hero ─────────────────────────────────── */}
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-700/40 bg-emerald-500/10 text-emerald-300">
                    <FiMail className="text-2xl" />
                  </div>
                  <h2 className="text-lg font-semibold text-neutral-100">
                    Verify withdrawal
                  </h2>
                  <p className="text-sm text-neutral-400">
                    We’ve sent a 6-digit OTP to your email
                  </p>
                </div>

                {/* ── OTP boxes ─────────────────────────────── */}
                <div className="flex justify-center gap-2">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const next = (j: number) =>
                          document.getElementById(
                            `otp-${j}`
                          ) as HTMLInputElement | null;
                        if (!val) return;
                        const arr = otp.split("");
                        arr[i] = val[0];
                        const nextOtp = arr.join("").slice(0, 6);
                        setOtp(nextOtp);
                        const n = next(i + 1);
                        if (n) n.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) {
                          const p = document.getElementById(
                            `otp-${i - 1}`
                          ) as HTMLInputElement | null;
                          if (p) p.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        if (!pasted) return;
                        setOtp(pasted);
                        setTimeout(() => {
                          for (let j = 0; j < pasted.length; j++) {
                            const el = document.getElementById(
                              `otp-${j}`
                            ) as HTMLInputElement | null;
                            if (el) el.value = pasted[j];
                          }
                          const last = document.getElementById(
                            `otp-${Math.min(5, pasted.length - 1)}`
                          ) as HTMLInputElement | null;
                          if (last) last.focus();
                        }, 0);
                      }}
                      className="h-12 w-10 rounded-lg border border-neutral-800 bg-neutral-900/60 text-center text-lg font-semibold text-neutral-100 outline-none focus:ring-2 focus:ring-emerald-600/40"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!otp || otp.length < 6 || isVerifyLoading}
                  className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isVerifyLoading ? "Verifying..." : "Confirm withdrawal"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-sm text-neutral-300 hover:border-neutral-700"
                >
                  <span className="inline-flex items-center">
                    <FiArrowLeft className="mr-2" /> Back to form
                  </span>
                </button>
              </motion.form>
            )}

            {/* ── notes / guidelines ────────────────────────── */}
            <div className="mt-6 overflow-hidden rounded-xl border border-neutral-800">
              <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-900/60 px-4 py-2">
                <FiInfo className="text-emerald-300" />
                <h4 className="text-sm font-semibold text-neutral-200">
                  Withdrawal guidelines
                </h4>
              </div>
              <div className="space-y-3 p-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-700/40 bg-emerald-500/10 text-xs font-bold text-emerald-300">
                    1
                  </span>
                  <div>
                    <div className="font-medium text-neutral-200">
                      Minimum withdrawal
                    </div>
                    <div className="text-neutral-400">
                      ${minWithdraw} USDT required for all withdrawals.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-700/40 bg-emerald-500/10 text-xs font-bold text-emerald-300">
                    2
                  </span>
                  <div>
                    <div className="font-medium text-neutral-200">
                      Network fees
                    </div>
                    <div className="text-neutral-400">
                      5% flat fee applies to all {network} transactions.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-700/40 bg-emerald-500/10 text-xs font-bold text-emerald-300">
                    3
                  </span>
                  <div>
                    <div className="font-medium text-neutral-200">
                      Processing time
                    </div>
                    <div className="text-neutral-400">
                      Typically completes within 0–72 hours (depends on
                      network).
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-700/40 bg-emerald-500/10 text-xs font-bold text-emerald-300">
                    <FiCheck />
                  </span>
                  <div>
                    <div className="font-medium text-neutral-200">
                      Address verification
                    </div>
                    <div className="text-neutral-400">
                      Ensure your {network} address is correct. Transactions
                      cannot be reversed.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ── /notes ────────────────────────────────────── */}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
