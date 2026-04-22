// FILE: app/ai-accounts/[slug]/page.tsx
"use client";

import { AiAccountsTable } from "@/components/ai-accounts/AiAccountsTable";
import type { IAccount } from "@/redux/features/ai-account/ai-accountApi";
import { useGetAllAiAccountsByPlanQuery } from "@/redux/features/ai-account/ai-accountApi";

interface PageProps {
  params: { slug: string };
}

const AiAccountPageByPlan = ({ params }: PageProps) => {
  const { slug } = params;

  const { data, isLoading, isError, error } =
    useGetAllAiAccountsByPlanQuery(slug);

  const rows: IAccount[] = data?.items ?? [];

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        AI Accounts - Plan:{" "}
        <span className="uppercase text-teal-300">{slug}</span>
      </h2>

      {isLoading && <p>Loading accounts...</p>}

      {isError && (
        <p className="text-red-400 text-sm">
          Failed to load data: {JSON.stringify(error)}
        </p>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <p>No accounts found for this plan.</p>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <div className="mx-auto max-w-7xl ">
          <AiAccountsTable rows={rows} loading={isLoading} plan={slug} />
        </div>
      )}
    </div>
  );
};

export default AiAccountPageByPlan;
