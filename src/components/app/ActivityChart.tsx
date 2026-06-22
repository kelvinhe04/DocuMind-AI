"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Metrics } from "@/types/metrics";

export function ActivityChart({ activity }: { activity: Metrics["activity"] }) {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={activity}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#71717a" }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#71717a" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            fontSize: 12,
            color: "#e4e4e7",
          }}
          cursor={{ stroke: "rgba(245,158,11,0.28)", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#f59e0b"
          fill="url(#goldGrad)"
          strokeWidth={2}
          dot={{ fill: "#f59e0b", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: "#fbbf24", strokeWidth: 0 }}
          name="Consultas"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
