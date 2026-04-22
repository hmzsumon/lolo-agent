"use client";

/* ────────── imports ────────── */
import CustomLoadingOverlay from "@/components/CustomLoadingOverlay";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";
import Card from "@/components/new-ui/Card";
import Tabs, { Tab } from "@/components/new-ui/Tabs";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Link from "next/link";
import { useMemo, useState } from "react";

/* ────────── API ────────── */
import { useGetAllDepositRequestsQuery } from "@/redux/features/deposit/depositApi";

/* ────────── helpers ────────── */
// /* ────────── Comments lik this ────────── */
const fmtUSD = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

const fmtDate = (d: any) => {
  const iso =
    typeof d === "string"
      ? d
      : d?.$date
        ? d.$date
        : d?._seconds
          ? new Date(d._seconds * 1000).toISOString()
          : "";
  return iso
    ? new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : "-";
};

/* ────────── types ────────── */
type Deposit = {
  _id: string;
  userId?: string;
  orderId?: string;
  name?: string;
  phone?: string;
  email?: string;
  customerId?: string;
  amount: number;
  charge?: number;
  receivedAmount?: number;
  destinationAddress?: string;
  qrCode?: string; // base64
  chain?: string; // e.g. "usdt"
  status: "pending" | "approved" | "rejected";
  isApproved?: boolean;
  isExpired?: boolean;
  confirmations?: number;
  isManual?: boolean;
  callbackUrl?: string;
  note?: string;
  createdAt?: string | { $date: string };
  updatedAt?: string | { $date: string };
  approvedAt?: string | { $date: string };
  callbackReceivedAt?: string | { $date: string };
  txId?: string;
  sl_no?: number;
};

/* ────────── page ────────── */
const AllDepositPage = () => {
  const { data, isLoading } = useGetAllDepositRequestsQuery(undefined);
  const deposits = (data?.deposits ?? []) as Deposit[];

  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  /* ────────── filter/sum ────────── */
  const filtered = useMemo(() => {
    if (selectedTab === "all") return deposits;
    return deposits.filter((d) => d.status === selectedTab);
  }, [deposits, selectedTab]);

  const sum = (arr: Deposit[], key: keyof Deposit) =>
    arr.reduce((acc, d) => acc + (Number(d[key]) || 0), 0);

  const totalAmount = sum(filtered, "amount");
  const totalReceived = sum(filtered, "receivedAmount");

  const statusCounts = useMemo(() => {
    const base = { all: deposits.length, pending: 0, approved: 0, rejected: 0 };
    deposits.forEach((d) => (base[d.status] += 1));
    return base;
  }, [deposits]);

  /* ────────── columns ────────── */
  const columns: GridColDef<Deposit & { id: string }>[] = [
    {
      field: "createdAt",
      headerName: "Created At",
      width: 160,
      renderCell: (p) => (
        <span className="text-xs">{fmtDate(p.row.createdAt)}</span>
      ),
    },
    { field: "customerId", headerName: "Customer ID", width: 120 },
    { field: "name", headerName: "Name", width: 160 },

    {
      field: "amount",
      headerName: "Amount",
      width: 120,
      renderCell: (p) => (
        <span className="text-xs">{fmtUSD(p.row.amount)}</span>
      ),
    },
    {
      field: "receivedAmount",
      headerName: "Received",
      width: 130,
      renderCell: (p) => (
        <span className="text-xs text-emerald-400">
          {fmtUSD(p.row.receivedAmount ?? 0)}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      sortable: false,
      renderCell: (p) => (
        <span
          className={
            p.row.status === "pending"
              ? "rounded-full border border-[#FF8A1A]/30 bg-[#FF8A1A]/15 px-2 py-0.5 text-xs text-[#FF8A1A]"
              : p.row.status === "approved"
                ? "rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-400"
                : "rounded-full border border-rose-400/30 bg-rose-400/15 px-2 py-0.5 text-xs text-rose-400"
          }
        >
          {p.row.status}
        </span>
      ),
    },
    {
      field: "view",
      headerName: "",
      width: 72,
      align: "center",
      headerAlign: "center",
      sortable: false,
      disableColumnMenu: true,
      renderCell: (p) => (
        <div className="w-full flex items-center justify-center">
          <Link href={`/deposits/${p.row.id || p.row._id}`} aria-label="View">
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

  const rows = filtered
    .slice()
    .sort((a, b) => (a.sl_no ?? 0) - (b.sl_no ?? 0))
    .map((d) => ({ id: d._id, ...d }));

  const tabs: Tab[] = [
    { key: "all", label: "All", badge: statusCounts.all },
    { key: "pending", label: "Pending", badge: statusCounts.pending },
    { key: "approved", label: "Approved", badge: statusCounts.approved },
    { key: "rejected", label: "Rejected", badge: statusCounts.rejected },
  ];

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl py-4 md:p-8">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          All Deposit
        </h2>

        {/* ────────── summary cards ────────── */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Card>
            <div className="flex items-center gap-2">
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
                {fmtUSD(totalAmount)}
              </span>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <span className="text-white/60">Received</span>
              <span className="ml-auto text-lg font-semibold text-emerald-400">
                {fmtUSD(totalReceived)}
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
            getRowId={(r) => r.id || (r as any)._id}
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

export default AllDepositPage;
