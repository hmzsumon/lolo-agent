/* ── Capitalice Home (modular assembly) ─────────────────────────────────────── */

import SignInForm from "@/components/reagiter-login/SignInForm";
import PublicLayout from "./(public)/layout";

export default function CapitaliceHome(): JSX.Element {
  return (
    <PublicLayout>
      <div className="flex items-center justify-center mt-10 ">
        <div className="max-w-md w-full">
          <SignInForm />
        </div>
      </div>
    </PublicLayout>
  );
}
