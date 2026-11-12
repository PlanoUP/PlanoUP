"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SCurvePoint } from "@/lib/brava/scurve";

const PREVISTO_COLOR = "#1d2939"; // brava-text — baseline, dashed
const REALIZADO_COLOR = "#201475"; // brava-blue — avanço real, solid

export default function PhysicalScurveChart({ data, height = 280 }: { data: SCurvePoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} stroke="#EEF1F3" />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#667085" }} axisLine={false} tickLine={false} />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10.5, fill: "#667085" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(value) => (value === null || value === undefined ? "—" : `${value}%`)}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="previsto"
          name="Previsto (acumulado)"
          stroke={PREVISTO_COLOR}
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="realizado"
          name="Realizado (acumulado)"
          stroke={REALIZADO_COLOR}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
