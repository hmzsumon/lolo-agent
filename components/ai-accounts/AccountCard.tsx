/* ──────────────────────────────────────────────────────────────────────────
   AccountCard — shows single account (chips + balance + actions)
────────────────────────────────────────────────────────────────────────── */
import { IAccount } from "@/redux/features/account/accountApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OpenAccountFab from "./OpenAccountFab";
import OpenAccountWizard from "./wizard/OpenAccountWizard";

export default function AccountCard({ acc }: { acc: IAccount }) {
  const router = useRouter();
  const [openWizard, setOpenWizard] = useState(false);
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {acc.type.toUpperCase()} <span className="text-neutral-500">#</span>{" "}
          <span className="font-medium">{acc.accountNumber}</span>
        </div>
        {/* FABs */}
        <OpenAccountFab onClick={() => setOpenWizard(true)} />
      </div>

      {/* ── chips row ── */}
      <div className="mt-2 flex gap-2 text-xs">
        <span className="px-2 py-1 rounded-lg bg-neutral-800">CGFX</span>
        <span className="px-2 py-1 rounded-lg bg-neutral-800 capitalize">
          {acc.type}
        </span>
        {/* ✅ status নয়; mode দেখাই, closed হলে 'Closed' */}
        <span className="px-2 py-1 rounded-lg bg-neutral-800">
          {acc.status !== "active"
            ? "Closed"
            : acc.mode === "demo"
            ? "Demo"
            : "Real"}
        </span>
      </div>

      <div className="mt-4 text-3xl font-semibold">
        {acc.balance.toFixed(2)} {acc.currency}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <Link href="/transfer" className="w-full">
          <button className="rounded-lg w-full bg-neutral-800 py-2">
            Transfer
          </button>
        </Link>
        <button className="rounded-lg bg-neutral-800 py-2">Withdraw</button>
        <button className="rounded-lg bg-neutral-800 py-2">Details</button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
        <Link
          href="/trade"
          className="rounded-lg bg-yellow-400 text-black py-2 font-medium"
        >
          <button className="">Open</button>
        </Link>
        <Link href="/transfer" className="w-full">
          <button className="rounded-lg w-full bg-neutral-800 py-2">
            Closed
          </button>
        </Link>
      </div>
      <OpenAccountWizard
        open={openWizard}
        onClose={() => setOpenWizard(false)}
      />
    </div>
  );
}
