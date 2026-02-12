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

interface EnergySurplusChartProps {
  data: ChartDataPoint[];
  title: string;
  energyConsumedLabel: string;
  unusedSurplusLabel: string;
  numberLocale: string;
}

export function EnergySurplusChart({
  data,
  title,
  energyConsumedLabel,
  unusedSurplusLabel,
  numberLocale,
}: EnergySurplusChartProps) {
  return (
    <div className={chartCardClass}>
      <h3 className="text-3xl font-semibold text-white mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="surplusGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="excessGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis {...xAxisProps} />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 16 }}
              tickFormatter={(value) => `${value.toFixed(1)}`}
              label={{
                value: "TWh",
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
                  name === "energyConsumed"
                    ? energyConsumedLabel
                    : unusedSurplusLabel;
                return [
                  `${(value ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 3 })} TWh`,
                  label,
                ];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) =>
                value === "energyConsumed"
                  ? energyConsumedLabel
                  : unusedSurplusLabel
              }
            />
            <Area
              type="monotone"
              dataKey="energyConsumed"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#surplusGradient)"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="unusedSurplus"
              stroke="#64748b"
              strokeWidth={1}
              fill="url(#excessGradient)"
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

