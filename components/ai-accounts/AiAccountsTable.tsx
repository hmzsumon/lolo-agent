// FILE: components/ai-accounts/AiAccountsTable.tsx
"use client";

/* ────────── imports ────────── */
import type { IAccount } from "@/redux/features/ai-account/ai-accountApi";
import { setSelectedAccountNumbers } from "@/redux/features/ai-account/ai-accountUISlice";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

/* ────────── helpers ────────── */
const StatusPill = ({ status }: { status: string }) => {
  const active = status === "active";
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

/* ────────── columns (তোমার গুলোই) ────────── */
const columns: GridColDef<IAccount>[] = [
  {
    field: "userName",
    headerName: "User Name",
    width: 180,
    renderCell: (params: GridRenderCellParams<IAccount>) => (
      <span>{(params.row as any).userId?.name ?? "-"}</span>
    ),
    sortable: false,
  },
  {
    field: "agentName",
    headerName: "Agent Name",
    width: 180,
    renderCell: (params: GridRenderCellParams<IAccount>) => (
      <span>{(params.row as any).userId?.agentName ?? "-"}</span>
    ),
    sortable: false,
  },
  { field: "customerId", headerName: "Customer ID", width: 130 },
  { field: "accountNumber", headerName: "Account No", width: 130 },

  {
    field: "balance",
    headerName: "Balance",
    width: 110,
    renderCell: (params: GridRenderCellParams<IAccount>) => (
      <span>{params.row.balance}</span>
    ),
  },
  {
    field: "equity",
    headerName: "Equity",
    width: 110,
    renderCell: (params: GridRenderCellParams<IAccount>) => (
      <span>{params.row.equity}</span>
    ),
  },
  {
    field: "profit",
    headerName: "Profit",
    width: 110,
    renderCell: (params: GridRenderCellParams<IAccount>) => (
      <span>{params.row.profit}</span>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params: GridRenderCellParams<IAccount>) => (
      <StatusPill status={params.row.status} />
    ),
  },
];

/* ────────── component ────────── */
export function AiAccountsTable({
  rows,
  loading,
  plan,
}: {
  rows: IAccount[];
  loading?: boolean;
  plan: string;
}) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const dispatch = useDispatch();

  // Redux থেকে selected account numbers নিয়ে আসলাম (show করার জন্য)
  const { selectedAccountNumbers } = useSelector(
    (state: any) => state.aiAccountUI
  );

  // DataGrid rows (id compulsory)
  const dgRows = useMemo(
    () =>
      rows.map((a) => ({
        id: a._id ?? a.accountNumber ?? crypto.randomUUID(),
        ...a,
      })),
    [rows]
  );

  const handleSendToBackend = async () => {
    try {
      const res = await fetch("/api/selected-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumbers: selectedAccountNumbers,
        }),
      });

      if (!res.ok) {
        console.error("Failed to send selected accounts");
        return;
      }

      console.log("Successfully sent:", selectedAccountNumbers);
    } catch (err) {
      console.error("Error sending selected accounts", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="h-[calc(100vh-300px)]">
        <DataGrid
          rows={dgRows}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          pageSizeOptions={[10, 20, 50, 100]}
          checkboxSelection
          // ⭐ selection -> { type, ids? } / অথবা সরাসরি ids
          onRowSelectionModelChange={(selection: any) => {
            console.log("selection -> ", selection);

            let ids: (string | number)[] = [];

            // নতুন স্টাইল: { type: "include" | "all" | "exclude", ids?: Set }
            if (
              selection &&
              typeof selection === "object" &&
              "type" in selection
            ) {
              const type = selection.type;
              const rawIds: any = selection.ids;

              if (type === "include" && rawIds) {
                // শুধু যেগুলো include করা হয়েছে
                ids = Array.from(rawIds) as (string | number)[];
              } else if (type === "all") {
                // হেডার checkbox দিয়ে পেজের সব row select
                ids = dgRows.map((r) => r.id);
              } else if (type === "exclude" && rawIds) {
                // সব row, কিন্তু rawIds বাদ
                const excluded = new Set<string | number>(
                  Array.from(rawIds) as (string | number)[]
                );
                ids = dgRows.map((r) => r.id).filter((id) => !excluded.has(id));
              }
            } else {
              // পুরোনো স্টাইল: selection স্রেফ array / Set
              const raw = selection;
              ids = Array.isArray(raw) ? raw : Array.from(raw ?? []) ?? [];
            }

            console.log("resolved ids -> ", ids);

            const numbers = dgRows
              .filter((row) => ids.includes(row.id))
              .map((row) => row.accountNumber);

            console.log("Selected account numbers:", numbers);
            // 🔥 Redux এ সেভ
            dispatch(setSelectedAccountNumbers(numbers));
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
          <Link
            href={`/ai-trade?plan=${plan}&isTradeForLoss=true`}
            className="flex flex-wrap items-center gap-4"
          >
            <button
              onClick={handleSendToBackend}
              className="rounded-md bg-teal-500 px-3 py-1 text-xs font-semibold text-black hover:bg-teal-400"
            >
              Go to Trade
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
