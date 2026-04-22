/* ────────── imports ────────── */
"use client";
import { AdminTransactionRow } from "@/redux/features/admin/adminUsersApi";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid";
import { useMemo } from "react";

/* ────────── helpers ────────── */
const fmtCurrency = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

/* ────────── columns ────────── */
const columns: GridColDef<AdminTransactionRow>[] = [
  { field: "unique_id", headerName: "ID", width: 140 },
  { field: "transactionType", headerName: "Type", width: 120 },
  {
    field: "amount",
    headerName: "Amount",
    width: 120,
    type: "number",
    valueGetter: (p: any) => Number(p?.row?.amount ?? 0),
    renderCell: (p: GridRenderCellParams<AdminTransactionRow>) =>
      fmtCurrency(p?.row?.amount ?? 0),
  },
  { field: "purpose", headerName: "Purpose", width: 200 },
  { field: "description", headerName: "Description", width: 300 },
  {
    field: "isCashIn",
    headerName: "Cash In",
    width: 100,
    renderCell: (p) => (p?.row?.isCashIn ? "Yes" : "No"),
  },
  {
    field: "isCashOut",
    headerName: "Cash Out",
    width: 100,
    renderCell: (p) => (p?.row?.isCashOut ? "Yes" : "No"),
  },
  {
    field: "previous_m_balance",
    headerName: "Prev Balance",
    width: 140,
    renderCell: (p) => fmtCurrency(p?.row?.previous_m_balance ?? 0),
  },
  {
    field: "current_m_balance",
    headerName: "Curr Balance",
    width: 140,
    renderCell: (p) => fmtCurrency(p?.row?.current_m_balance ?? 0),
  },
  {
    field: "createdAt",
    headerName: "Time",
    width: 180,
    valueGetter: (p: any) => {
      const iso = p?.row?.createdAt as string | undefined;
      return iso ? new Date(iso).getTime() : null;
    },
    renderCell: (p) =>
      p?.row?.createdAt
        ? new Date(p.row.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
  },
];

/* ────────── component ────────── */
export default function UserTransactionsTable(props: {
  rows: AdminTransactionRow[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  onSortChange: (m: GridSortModel) => void;
  initialSort?: GridSortModel;
}) {
  const {
    rows,
    loading,
    total,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    initialSort,
  } = props;

  const dgRows = useMemo(
    () => rows.map((t) => ({ id: t._id ?? crypto.randomUUID(), ...t })),
    [rows]
  );

  return (
    <div className="h-full min-h-0">
      <DataGrid
        rows={dgRows}
        columns={columns}
        loading={loading}
        paginationMode="server"
        sortingMode="server"
        rowCount={total}
        pageSizeOptions={[10, 20, 50, 100, 200]}
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={(m) => {
          onPageChange(m.page + 1);
          onPageSizeChange(m.pageSize);
        }}
        onSortModelChange={onSortChange}
        initialState={
          initialSort ? { sorting: { sortModel: initialSort } } : undefined
        }
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
          "& .MuiDataGrid-row:hover": { bgcolor: "rgba(255,255,255,0.03)" },
          "& .MuiTablePagination-root": { color: "rgba(255,255,255,0.75)" },
        }}
      />
    </div>
  );
}
