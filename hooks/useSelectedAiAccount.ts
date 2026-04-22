// hooks/useSelectedAccount.ts
"use client";

import { useGetAllAdminAiAccountsQuery } from "@/redux/features/ai-account/ai-accountApi";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export function useSelectedAiAccount() {
  const { data, isLoading, isFetching } = useGetAllAdminAiAccountsQuery();
  const selectedId = useSelector(
    (s: RootState) => s.accountUI.selectedAccountId
  );

  const items = data?.items ?? [];
  const account = items.find((a) => a._id === selectedId) || items[0] || null;
  return {
    account,
    items,
    loading: (isLoading || isFetching) && !data,
  };
}
