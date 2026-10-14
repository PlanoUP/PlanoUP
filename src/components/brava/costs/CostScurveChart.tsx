"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CostPeriodPoint, formatCostMM } from "@/lib/brava/costs/calculations";

const ORCADO_COLOR = "#1d2939"; // brava-text — neutral baseline, dashed
const REALIZADO_COLOR = "#201475"; // brava-blue — actual spend, solid

export default function CostScurveChart({ data, height = 260 }: { data: CostPeriodPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} stroke="#EEF1F3" />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#667085" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `${v}`}
          tick={{ fontSize: 10.5, fill: "#667085" }}
          axisLine={false}
          tickLine={false}
          width={44}
          label={{ value: "R$ MM", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#667085" } }}
        />
        <Tooltip
          formatter={(value: number) => formatCostMM(value)}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="cumulativeOrcado"
          name="Orçado (acumulado)"
          stroke={ORCADO_COLOR}
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="cumulativeRealizado"
          name="Realizado (acumulado)"
          stroke={REALIZADO_COLOR}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
