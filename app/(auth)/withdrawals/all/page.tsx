"use client";

/* ────────── imports ────────── */
import CustomLoadingOverlay from "@/components/CustomLoadingOverlay";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import Card from "@/components/new-ui/Card";
import StatusChip from "@/components/new-ui/StatusChip";
import Tabs, { Tab } from "@/components/new-ui/Tabs";
import { formatDate } from "@/lib/functions";
import { useGetAllWithdrawRequestsQuery } from "@/redux/features/withdraw/withdrawApi";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueGetter, // ← v6: this exists, but we won't strictly need it
} from "@mui/x-data-grid";
import Link from "next/link";
import { useMemo, useState } from "react";

/* ────────── types ────────── */
type Withdraw = {
  _id: string;
  sl_no: number;
  name: string;
  customerId: string;
  amount: number;
  netAmount: number;
  status: "pending" | "approved" | "rejected";
  netWork?: string;
  createdAt: string; // ISO string
};
type WithdrawRow = Withdraw & { id: string };

const AllWithdraw = () => {
  /* ────────── data fetch ────────── */
  const { data, isLoading } = useGetAllWithdrawRequestsQuery(undefined);
  const withdraws = (data?.withdraws ?? []) as Withdraw[];

  /* ────────── UX state ────────── */
  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  /* ────────── derived data ────────── */
  const filtered: Withdraw[] = useMemo(() => {
    if (selectedTab === "all") return withdraws;
    return withdraws.filter((w) => w.status === selectedTab);
  }, [withdraws, selectedTab]);

  const sum = (arr: Withdraw[], key: keyof Withdraw) =>
    arr.reduce((acc, w) => acc + (Number(w[key]) || 0), 0);

  const totalAmount = sum(filtered, "amount");
  const totalNetAmount = sum(filtered, "netAmount");

  const statusCounts = useMemo(() => {
    const base = {
      all: withdraws.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    withdraws.forEach((w) => (base[w.status] += 1));
    return base;
  }, [withdraws]);

  /* ────────── columns (v6-safe) ────────── */
  const columns: GridColDef<WithdrawRow>[] = [
    { field: "sl_no", headerName: "SL No", width: 90 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 160,
      // v6: valueGetter signature is (value, row, colDef)
      valueGetter: ((_value, row) =>
        row.createdAt) as GridValueGetter<WithdrawRow>,
      renderCell: (p) => (
        <span className="text-xs">
          {/* convert string -> Date for your util */}
          {formatDate(new Date(p.row.createdAt))}
        </span>
      ),
    },
    { field: "customerId", headerName: "Customer ID", width: 130 },
    { field: "name", headerName: "Name", width: 180 },
    {
      field: "method",
      headerName: "Method",
      width: 120,
      renderCell: (p) => (
        <span className="text-xs text-white/70">{p.row.netWork}</span>
      ), // demo
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 130,
      renderCell: (p: GridRenderCellParams<WithdrawRow>) => (
        <span className="text-xs">
          {Number(p.row.amount).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </span>
      ),
    },
    {
      field: "netAmount",
      headerName: "Net Amount",
      width: 140,
      renderCell: (p: GridRenderCellParams<WithdrawRow>) => (
        <span className="text-xs text-emerald-400">
          {Number(p.row.netAmount).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (p: GridRenderCellParams<WithdrawRow>) => (
        <StatusChip status={p.row.status} />
      ),
      sortable: false,
    },
    {
      field: "view",
      headerName: "",
      width: 72,
      sortable: false,
      disableColumnMenu: true,
      align: "center",
      headerAlign: "center",
      renderCell: (p) => (
        <div className="w-full flex items-center justify-center">
          <Link
            href={`/withdrawals/${p.row.id || p.row._id}`}
            aria-label="View"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="opacity-80 hover:opacity-100"
            >
              <path
                fill="currentColor"
                d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7Zm0 11a4 4 0 1 1 0-8a4 4 0 0 1 0 8Z"
              />
            </svg>
          </Link>
        </div>
      ),
    },
  ];

  /* ────────── rows (stable order) ────────── */
  const rows: WithdrawRow[] = filtered
    .slice()
    .sort((a, b) => (a.sl_no ?? 0) - (b.sl_no ?? 0))
    .map((w) => ({ id: w._id, ...w }));

  /* ────────── UI ────────── */
  const tabs: Tab[] = [
    { key: "all", label: "All withdraw", badge: statusCounts.all },
    { key: "pending", label: "Pending", badge: statusCounts.pending },
    { key: "approved", label: "Approved", badge: statusCounts.approved },
    { key: "rejected", label: "Rejected", badge: statusCounts.rejected },
  ];

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl  py-4 md:p-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-4">
          All Withdraw
        </h2>

        {/* ────────── summary cards ────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <div className="flex items-center gap-3">
              <span className="text-white/60">Total Requests</span>
              <span className="ml-auto text-lg font-semibold">
                {filtered.length}
              </span>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <span className="text-white/60">Amount</span>
              <span className="ml-auto text-lg font-semibold">
                {Number(totalAmount).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <span className="text-white/60">Net Amount</span>
              <span className="ml-auto text-lg font-semibold text-emerald-400">
                {Number(totalNetAmount).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
            </div>
          </Card>
        </div>

        {/* ────────── tabs ────────── */}
        <Card
          className="mt-4"
          right={
            <span className="text-xs text-white/50">Filter by status</span>
          }
        >
          <Tabs
            tabs={tabs}
            active={selectedTab}
            onChange={(k) => setSelectedTab(k as any)}
          />
        </Card>

        {/* ────────── table ────────── */}
        <div className="mt-4 h-[calc(100vh-320px)]">
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) =>
              r.id || (r as any)._id
            } /* ────────── fallback id ────────── */
            loading={isLoading}
            disableRowSelectionOnClick
            density="compact"
            columnHeaderHeight={48}
            getRowHeight={() => 56}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
              loadingOverlay: CustomLoadingOverlay,
            }}
            sx={{
              bgcolor: "#0E1014",
              color: "#E6E6E6",
              borderColor: "rgba(255,255,255,0.08)",
              "& .MuiDataGrid-columnSeparator": { display: "none" },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.85)",
                fontSize: 12,
              },
              "& .MuiDataGrid-cell": {
                fontSize: 13,
                borderColor: "rgba(255,255,255,0.06)",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "rgba(255,255,255,0.03)",
              },
              "& .MuiTablePagination-root": { color: "rgba(255,255,255,0.75)" },
              "& .MuiDataGrid-cell[data-field='view']": {
                display: "flex",
                justifyContent: "center",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default AllWithdraw;
