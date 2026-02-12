import type { CSSProperties } from "react";

export const tooltipContentStyle: CSSProperties = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "8px",
};

export const tooltipLabelStyle: CSSProperties = {
  color: "#94a3b8",
};

export const gridStroke = "#334155";

export const xAxisProps = {
  dataKey: "month" as const,
  stroke: "#64748b",
  tick: { fill: "#64748b", fontSize: 16 },
  tickFormatter: (value: string) => value.slice(2, 7),
};

export const chartCardClass =
  "bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-6 border border-slate-700/50";

