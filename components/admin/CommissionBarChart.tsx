// /components/admin/CommissionBarChart.tsx
"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ────────── vertical bar chart for commission per month ────────── */

type Point = { month: string; value: number };

export default function CommissionBarChart({ data }: { data: Point[] }) {
  return (
    <div className="rounded-2xl bg-[#0E1014] border border-white/5 p-5">
      <p className="text-sm text-white/60 mb-3">Commission Breakdown</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
          >
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#12151b",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
              }}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(val: any) => [val, "Commission"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#FF8A00" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
