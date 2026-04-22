// app/dashboard/settings/profile/page.tsx
"use client";

/* ── page: assemble all profile/verification blocks ───────── */
import AccountSummary from "@/components/profile/AccountSummary";
import AddProfileForm from "@/components/profile/AddProfileForm";
import VerificationSteps from "@/components/profile/VerificationSteps";
import VerifyEmailCard from "@/components/profile/VerifyEmailCard";

import { go } from "@/redux/features/kyc/kycSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ProfilePage() {
  const d = useDispatch();
  const router = useRouter();

  const { user } = useSelector((state: any) => state.auth);

  /* ── mocked progress state (তুমি API দিয়ে বাঁধবে) ───────── */
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [basicInfoDone, setBasicInfoDone] = useState(false);

  const completed =
    Number(emailVerified) + Number(basicInfoDone) + Number(phoneVerified);

  /* ── helper: KYC পেজে নিয়ে যাও + স্টেপ স্টার্ট করো ───────── */
  const startKyc = () => {
    d(go("start")); // redux step সেট
    router.push("/kyc"); // পেজ ন্যাভিগেশন
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 md:px-6 md:py-6">
      {/* ── top cards: status + deposit limit ────────────────── */}
      <AccountSummary
        status={completed === 3 ? "verified" : "not_verified"}
        completed={completed}
        total={3}
        depositLimitUSD={completed === 3 ? Infinity : 0}
      />

      {/* ── steps accordion (screenshots-এর মতো) ────────────── */}
      <VerificationSteps
        sections={[
          {
            id: "step1",
            title: "Confirm email and phone number. Add personal details",
            openByDefault: !emailVerified,
            content: (
              <div className="space-y-4">
                {!user?.email_verified && (
                  <VerifyEmailCard onSuccess={() => setEmailVerified(true)} />
                )}
                {!basicInfoDone && (
                  <AddProfileForm onSuccess={() => setBasicInfoDone(true)} />
                )}
              </div>
            ),
            done: emailVerified && basicInfoDone,
          },
          {
            id: "step2",
            title: "Provide a document confirming your name",
            openByDefault: false,
            content: (
              <div className="space-y-3 text-neutral-300">
                <p className="text-sm">
                  You can add your ID info later. For now we’ll keep this
                  collapsed to match the mock.
                </p>
                <ul className="list-disc pl-5 text-sm text-neutral-400">
                  <li>Deposits up to 10000 USD</li>
                  <li>Global and local payment methods</li>
                  <li>Bank card and crypto payments</li>
                  <li>Trading</li>
                </ul>

                {/* ── এখানে ক্লিক করলে KYC পেজ ওপেন হবে ─────── */}
                <button
                  onClick={startKyc}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white"
                >
                  Complete now
                </button>
              </div>
            ),
            done: false,
          },
          {
            id: "step3",
            title: "Provide proof of your place of residence",
            openByDefault: !phoneVerified && emailVerified,
            content: (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-neutral-200">
                    Features and limits
                  </div>
                  <ul className="list-disc pl-5 text-sm text-neutral-400">
                    <li>Unlimited deposits</li>
                  </ul>
                </div>
                <button
                  disabled
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-500"
                >
                  Complete now
                </button>
              </div>
            ),
            done: phoneVerified,
          },
        ]}
      />
    </div>
  );
}
