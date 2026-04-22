// /components/admin/TradingVolumeChart.tsx
"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ────────── line chart for monthly trading volume ────────── */

type Point = { month: string; value: number };

const tooltipStyles =
  "rounded-md border border-white/10 bg-[#12151b]/90 px-3 py-2 text-xs shadow-lg backdrop-blur";

export default function TradingVolumeChart({ data }: { data: Point[] }) {
  return (
    <div className="rounded-2xl bg-[#0E1014] border border-white/5 p-5">
      <p className="text-sm text-white/60 mb-3">Trading Volume</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              contentStyle={{ background: "transparent", border: "none" }}
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
              formatter={(val: any) => [val, "Volume"]}
              labelStyle={{ display: "none" }}
              wrapperClassName={tooltipStyles}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#21D3B3"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
