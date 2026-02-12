import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartDataPoint } from "@/types";
import {
  tooltipContentStyle,
  tooltipLabelStyle,
  gridStroke,
  xAxisProps,
  chartCardClass,
} from "./shared";

interface HashRateChartProps {
  data: ChartDataPoint[];
  title: string;
  edfHashRateLabel: string;
  networkHashRateLabel: string;
  numberLocale: string;
}

export function HashRateChart({
  data,
  title,
  edfHashRateLabel,
  networkHashRateLabel,
  numberLocale,
}: HashRateChartProps) {
  return (
    <div className={chartCardClass}>
      <h3 className="text-3xl font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="networkGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="edfGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis {...xAxisProps} />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 16 }}
              tickFormatter={(value) => `${Math.round(value)}`}
              label={{
                value: "EH/s",
                angle: -90,
                position: "insideLeft",
                fill: "#64748b",
                fontSize: 16,
              }}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(
                value: number | undefined,
                name: string | undefined
              ) => {
                const label =
                  name === "edfHashRateEh"
                    ? edfHashRateLabel
                    : networkHashRateLabel;
                return [
                  `${(value ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 2 })} EH/s`,
                  label,
                ];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) =>
                value === "edfHashRateEh"
                  ? edfHashRateLabel
                  : networkHashRateLabel
              }
            />
            <Area
              type="monotone"
              dataKey="networkHashRateEh"
              stroke="#64748b"
              strokeWidth={1}
              fill="url(#networkGradient)"
            />
            <Area
              type="monotone"
              dataKey="edfHashRateEh"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#edfGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

