"use client";

/* ────────── imports ────────── */
import Card from "@/components/new-ui/Card";
import { useGetMyAgentsAllUsersQuery } from "@/redux/features/agent/agentApi";
import { useGrantAgentRewardsMutation } from "@/redux/features/reward/rewardApi";
import {
    DataGrid,
    GridColDef,
    GridRowId,
    GridRowSelectionModel,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

/* ────────── helpers ────────── */
const fmtMoney = (n?: number) =>
  `৳${Number(n || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

/* ────────── page ────────── */
export default function GrantRewardPage() {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set<GridRowId>(),
    });

  const [title, setTitle] = useState("Special Bonus");
  const [amount, setAmount] = useState("");
  const [turnoverMultiplier, setTurnoverMultiplier] = useState("5");
  const [note, setNote] = useState("");

  const { data, isLoading, isFetching } = useGetMyAgentsAllUsersQuery({
    page: 1,
    limit: 200,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [grantAgentRewards, { isLoading: isGranting }] =
    useGrantAgentRewardsMutation();

  const users = data?.users ?? [];

  const rows = useMemo(
    () =>
      users.map((u: any) => ({
        id: u._id,
        ...u,
      })),
    [users],
  );

  const selectedUsers = useMemo(() => {
    const selected = new Set(Array.from(rowSelectionModel.ids).map(String));
    return rows.filter((x: any) => selected.has(String(x.id)));
  }, [rowSelectionModel, rows]);

  const totalRewardAmount =
    Number(amount || 0) * Number(selectedUsers.length || 0);

  const columns: GridColDef[] = [
    { field: "customerId", headerName: "Customer ID", width: 140 },
    { field: "name", headerName: "Name", width: 180 },
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "email", headerName: "Email", width: 220 },
    {
      field: "m_balance",
      headerName: "Balance",
      width: 130,
      renderCell: (p) => (
        <span className="text-emerald-400">{fmtMoney(p.row.m_balance)}</span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 140,
      renderCell: (p) => <span>{fmtDate(p.row.createdAt)}</span>,
    },
  ];

  const handleGrant = async () => {
    const cleanAmount = Number(amount);
    const cleanMulti = Number(turnoverMultiplier);

    if (rowSelectionModel.ids.size === 0) {
      return toast.error("কমপক্ষে ১ জন user select করুন");
    }

    if (!title.trim()) {
      return toast.error("Bonus title দিন");
    }

    if (!cleanAmount || cleanAmount <= 0) {
      return toast.error("Valid amount দিন");
    }

    if (!cleanMulti || cleanMulti <= 0) {
      return toast.error("Valid turnover multiplier দিন");
    }

    const ok = window.confirm(
      `আপনি ${rowSelectionModel.ids.size} জন user-কে ${fmtMoney(cleanAmount)} reward দিতে চান?\nTurnover: ${cleanMulti}x`,
    );

    if (!ok) return;

    try {
      const res = await grantAgentRewards({
        userIds: Array.from(rowSelectionModel.ids).map(String),
        title: title.trim(),
        amount: cleanAmount,
        turnoverMultiplier: cleanMulti,
        note: note.trim(),
      }).unwrap();

      toast.success(res?.message || "Reward granted successfully");

      setRowSelectionModel({
        type: "include",
        ids: new Set<GridRowId>(),
      });
      setAmount("");
      setNote("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Reward grant failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Grant Reward</h1>
          <p className="text-xs text-white/50">
            User select করে bonus amount আর turnover multiplier দিন
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          {/* ────────── users table ────────── */}
          <Card>
            <div className="mb-4 flex flex-col gap-3 ">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name / phone / customerId / email"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
              />
            </div>

            <div className="h-[620px]">
              <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoading || isFetching}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newModel) =>
                  setRowSelectionModel(newModel)
                }
                pageSizeOptions={[20, 50, 100]}
                paginationModel={{ page: 0, pageSize }}
                onPaginationModelChange={(m) => setPageSize(m.pageSize)}
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
                  "& .MuiTablePagination-root": {
                    color: "rgba(255,255,255,0.75)",
                  },
                }}
              />
            </div>
          </Card>

          {/* ────────── form panel ────────── */}
          <Card>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs text-white/60">Bonus Title</p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
                  placeholder="Agent Deposit Bonus"
                />
              </div>

              <div>
                <p className="mb-2 text-xs text-white/60">Bonus Amount</p>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  min={0}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
                  placeholder="200"
                />
              </div>

              <div>
                <p className="mb-2 text-xs text-white/60">
                  Turnover Multiplier
                </p>
                <input
                  value={turnoverMultiplier}
                  onChange={(e) => setTurnoverMultiplier(e.target.value)}
                  type="number"
                  min={1}
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm outline-none"
                  placeholder="5"
                />
              </div>

              <div>
                <p className="mb-2 text-xs text-white/60">Note</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                  placeholder="Optional note"
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Selected Users</span>
                  <span className="font-semibold">
                    {rowSelectionModel.ids.size}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">Per User Bonus</span>
                  <span className="font-semibold">
                    {fmtMoney(Number(amount || 0))}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">Turnover</span>
                  <span className="font-semibold">
                    {Number(turnoverMultiplier || 0)}x
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-white/60">Total Grant</span>
                  <span className="font-semibold text-emerald-400">
                    {fmtMoney(totalRewardAmount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGrant}
                disabled={isGranting}
                className="h-12 w-full rounded-2xl bg-emerald-500 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGranting ? "Processing..." : "Confirm & Grant Reward"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
