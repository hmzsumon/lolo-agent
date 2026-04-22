// FILE: components/ai-positions/AiPositionsTable.tsx
"use client";

import type { IPosition } from "@/redux/features/ai-account/ai-accountApi";
import { useDeleteAiPositionsByIsStopLossMutation } from "@/redux/features/ai-account/ai-accountApi";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import toast from "react-hot-toast"; // 👈 এখানেই ইম্পোর্ট

/* ────────── helpers ────────── */
const StatusPill = ({ status }: { status: string }) => {
  const active = status === "open";
  return (
    <span
      className={
        active
          ? "rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-400"
          : "rounded-full border border-rose-400/30 bg-rose-400/15 px-2 py-0.5 text-xs text-rose-400"
      }
    >
      {status}
    </span>
  );
};

/* ────────── columns ────────── */
const columns: GridColDef<IPosition>[] = [
  {
    field: "userName",
    headerName: "User Name",
    width: 180,
    renderCell: (params: GridRenderCellParams<IPosition>) => (
      <span>{(params.row as any).userId?.name ?? "-"}</span>
    ),
    sortable: false,
  },
  {
    field: "agentName",
    headerName: "Agent Name",
    width: 180,
    renderCell: (params: GridRenderCellParams<IPosition>) => (
      <span>{(params.row as any).userId?.agentName ?? "-"}</span>
    ),
    sortable: false,
  },
  { field: "customerId", headerName: "Customer ID", width: 130 },
  {
    field: "accountNumber",
    headerName: "Account No",
    width: 130,
    renderCell: (params: GridRenderCellParams<IPosition>) => (
      <span>{(params.row as any).accountId?._id ?? "-"}</span>
    ),
  },
  {
    field: "balance",
    headerName: "Balance",
    width: 110,
    renderCell: (params: GridRenderCellParams<IPosition>) => (
      <span>{(params.row as any).accountId?.balance ?? "-"}$</span>
    ),
  },
  {
    field: "equity",
    headerName: "Equity",
    width: 110,
    renderCell: (params: GridRenderCellParams<IPosition>) => (
      <span>{(params.row as any).accountId?.equity ?? "-"}$</span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params: GridRenderCellParams<IPosition>) => (
      <StatusPill status={params.row.status} />
    ),
  },
];

/* ────────── component ────────── */
const AiPositionsTable = ({
  rows,
  loading,
}: {
  rows: IPosition[];
  loading?: boolean;
}) => {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // সিলেক্টেড পজিশনের _id গুলো
  const [selectedPositionIds, setSelectedPositionIds] = useState<string[]>([]);

  const [deletePositions, { isLoading: isDeleting }] =
    useDeleteAiPositionsByIsStopLossMutation();

  // DataGrid rows (id compulsory)
  const dgRows = useMemo(
    () =>
      rows.map((a) => ({
        id: a._id ?? crypto.randomUUID(),
        ...a,
      })),
    [rows]
  );

  // UI তে "Selected accounts" দেখানোর জন্য
  const selectedAccountNumbers = useMemo(() => {
    const byId = new Map<string, IPosition>();
    rows.forEach((p) => byId.set(p._id, p));

    const accs = selectedPositionIds
      .map((pid) => byId.get(pid))
      .filter(Boolean)
      .map((p) => p!.accountId?._id ?? null)
      .filter((x): x is string => Boolean(x));

    // unique
    return Array.from(new Set(accs));
  }, [rows, selectedPositionIds]);

  const handleClosePositions = async () => {
    if (selectedPositionIds.length === 0) {
      toast.error("Please select at least one position.");
      return;
    }

    try {
      await deletePositions(selectedPositionIds).unwrap();
      setSelectedPositionIds([]);
      toast.success(
        `Successfully closed ${selectedPositionIds.length} position${
          selectedPositionIds.length > 1 ? "s" : ""
        }.`
      );
    } catch (error: any) {
      console.error("Failed to delete positions", error);
      const msg =
        error?.data?.message ||
        error?.message ||
        "Failed to close selected positions.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-3">
      <div className="h-[calc(100vh-300px)]">
        <DataGrid
          rows={dgRows}
          columns={columns}
          loading={loading || isDeleting}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          pageSizeOptions={[10, 20, 50, 100]}
          checkboxSelection
          onRowSelectionModelChange={(
            selection: GridRowSelectionModel | any
          ) => {
            let ids: (string | number)[] = [];

            // নতুন স্টাইল: { type, ids? }
            if (
              selection &&
              typeof selection === "object" &&
              "type" in selection
            ) {
              const type = selection.type;
              const rawIds: any = selection.ids;

              if (type === "include" && rawIds) {
                ids = Array.from(rawIds) as (string | number)[];
              } else if (type === "all") {
                ids = dgRows.map((r) => r.id);
              } else if (type === "exclude" && rawIds) {
                const excluded = new Set<string | number>(
                  Array.from(rawIds) as (string | number)[]
                );
                ids = dgRows.map((r) => r.id).filter((id) => !excluded.has(id));
              }
            } else {
              // পুরনো স্টাইল: array / Set
              const raw = selection;
              ids = Array.isArray(raw) ? raw : Array.from(raw ?? []) ?? [];
            }

            // id -> position._id map
            const selectedPosIds = dgRows
              .filter((row) => ids.includes(row.id))
              .map((row) => row._id as string);

            setSelectedPositionIds(selectedPosIds);
          }}
          disableRowSelectionOnClick
          columnHeaderHeight={44}
          getRowHeight={() => 56}
          sx={{
            bgcolor: "#0E1014",
            color: "#E6E6E6",
            border: "1px solid rgba(255,255,255,0.08)",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 12,
            },
            "& .MuiDataGrid-cell": {
              borderColor: "rgba(255,255,255,0.06)",
              fontSize: 12,
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "rgba(255,255,255,0.03)",
            },
            "& .MuiTablePagination-root": {
              color: "rgba(255,255,255,0.75)",
            },
          }}
        />
      </div>

      {/* নিচে summary + send button */}
      <div className="flex items-center justify-between text-sm">
        <div>
          Selected accounts:{" "}
          <span className="font-semibold">{selectedAccountNumbers.length}</span>
        </div>

        {selectedAccountNumbers.length > 0 && (
          <button
            onClick={handleClosePositions}
            disabled={isDeleting}
            className="rounded-md bg-teal-500 px-3 py-1 text-xs font-semibold text-black hover:bg-teal-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Closing..." : "Close Selected Positions"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AiPositionsTable;
