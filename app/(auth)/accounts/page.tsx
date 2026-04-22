/* ──────────────────────────────────────────────────────────────────────────
   Accounts Page — add SelectedAccountCard + AccountPickerSheet
────────────────────────────────────────────────────────────────────────── */
"use client";

import AccountPickerSheet from "@/components/accounts/AccountPickerSheet";
import OpenAccountFab from "@/components/accounts/OpenAccountFab";
import PromoCard from "@/components/accounts/PromoCard";
import SelectedAccountCard from "@/components/accounts/SelectedAccountCard";
import OpenAccountWizard from "@/components/accounts/wizard/OpenAccountWizard";
import { useGetMyAccountsQuery } from "@/redux/features/account/accountApi";
import { setSelectedAccountId } from "@/redux/features/account/accountUISlice";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AccountsPage() {
  const { data, isLoading } = useGetMyAccountsQuery();
  const [openPicker, setOpenPicker] = useState(false);
  const [openWizard, setOpenWizard] = useState(false);
  const dispatch = useDispatch();
  const selectedId = useSelector(
    (s: RootState) => s.accountUI.selectedAccountId
  );

  useEffect(() => {
    const items = data?.items ?? [];
    if (!selectedId && items.length) {
      const firstReal =
        items.find((a) => a.status === "active" && a.mode === "real") ||
        items[0];
      dispatch(setSelectedAccountId(firstReal._id));
    }
  }, [data, selectedId, dispatch]);

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="pt-6">
          <h1 className="text-3xl font-bold">Accounts</h1>
        </div>

        <PromoCard />

        {/* ড্যাশবোর্ডে সিলেক্টেড অ্যাকাউন্ট কার্ড */}
        <div className="mt-4">
          {isLoading ? (
            <div className="rounded-2xl bg-neutral-900 p-6 border border-neutral-800">
              Loading...
            </div>
          ) : (
            <SelectedAccountCard onOpenPicker={() => setOpenPicker(true)} />
          )}
        </div>

        {/* FABs */}
        <OpenAccountFab onClick={() => setOpenWizard(true)} />

        {/* Sheets */}
        <AccountPickerSheet
          open={openPicker}
          onClose={() => setOpenPicker(false)}
          onOpenCreate={() => {
            setOpenPicker(false);
            setOpenWizard(true);
          }}
        />
        <OpenAccountWizard
          open={openWizard}
          onClose={() => setOpenWizard(false)}
        />
      </div>
    </div>
  );
}
