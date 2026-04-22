"use client";

import AiPositionsTable from "@/components/ai-positions/AiPositionsTable";
import {
  IPosition,
  useGetActiveAiPositionsByIsStopLossQuery,
} from "@/redux/features/ai-account/ai-accountApi";

const AiLossPositions = () => {
  const { data, isLoading, isError, error } =
    useGetActiveAiPositionsByIsStopLossQuery();

  const rows: IPosition[] = data?.positions ?? [];
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        All Ai positions -
        <span className="uppercase text-teal-300">{rows?.length}</span>
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
          <AiPositionsTable rows={rows} loading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default AiLossPositions;
