// components/profile/VerifyEmailCard.tsx
"use client";

/* ── step: verify email (screenshot: big yellow button) ───── */
export default function VerifyEmailCard({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const sendCode = async () => {
    // TODO: API call → await resendVerificationEmail()
    onSuccess();
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="mb-4">
        <div className="text-2xl font-extrabold text-white">Verify email</div>
        <p className="mt-1 text-sm text-neutral-400">
          We will send the verification code to your email address.
        </p>
      </div>
      <button
        onClick={sendCode}
        className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-center text-base font-semibold text-neutral-950 hover:bg-yellow-300"
      >
        Send me a code
      </button>
      <p className="mt-3 text-xs text-neutral-500">
        All data is encrypted for security
      </p>
    </div>
  );
}
