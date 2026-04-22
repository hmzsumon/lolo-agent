/* ── Capitalise Auth Page (modular) ─────────────────────────────────────────── */
"use client";

import RegisterForm from "@/components/reagiter-login/RegisterForm";
import SignInForm from "@/components/reagiter-login/SignInForm";
import { TabButton } from "@/components/reagiter-login/Tabs";
import { useState } from "react";

export default function AuthPage(): JSX.Element {
  const [tab, setTab] = useState<"signin" | "create">("signin");

  return (
    <section className="mx-auto max-w-xl px-2 py-8">
      <h1 className="mb-6 text-center text-2xl font-extrabold tracking-tight text-white">
        Welcome to Capitalise
      </h1>

      <div className="mb-6 flex justify-center gap-8">
        <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
          Sign in
        </TabButton>
        <TabButton active={tab === "create"} onClick={() => setTab("create")}>
          Create an account
        </TabButton>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_10px_50px_-20px_rgba(0,0,0,0.6)]">
        {tab === "signin" ? (
          <SignInForm onSuccess={() => setTab("signin")} />
        ) : (
          <RegisterForm onSuccess={() => setTab("signin")} />
        )}
      </div>
    </section>
  );
}
