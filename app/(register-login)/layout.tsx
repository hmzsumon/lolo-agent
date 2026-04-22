import CapitaliseLogo from "@/components/branding/CapitaliseLogo";
import GlowBackdrop from "@/components/decor/GlowBackdrop";
import BackgroundFX from "@/components/reagiter-login/BackgroundFX";
import Link from "next/link";
import React from "react";

const RegisterLoginLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div>
      <section className="relative bg-neutral-950">
        <GlowBackdrop variant="max" />
        <main className="relative min-h-[100dvh] overflow-hidden text-neutral-100">
          <BackgroundFX />

          <header className="border-b border-neutral-900/60 bg-neutral-950/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-3">
                <CapitaliseLogo
                  variant="full"
                  size={28}
                  className="text-white"
                  wordmarkClassName="text-white"
                />
              </Link>
              <div className="text-sm text-neutral-400">
                <Link href="#">Support</Link>
              </div>
            </div>
          </header>
          <div className="">{children}</div>
        </main>
      </section>
    </div>
  );
};

export default RegisterLoginLayout;
