import {
  ComposedChart,
  Area,
  Bar,
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

interface BitcoinMiningChartProps {
  data: ChartDataPoint[];
  title: string;
  accumulatedBtcLabel: string;
  btcMinedLabel: string;
  numberLocale: string;
}

export function BitcoinMiningChart({
  data,
  title,
  accumulatedBtcLabel,
  btcMinedLabel,
  numberLocale,
}: BitcoinMiningChartProps) {
  return (
    <div className={chartCardClass}>
      <h3 className="text-3xl font-semibold text-white mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient
                id="btcGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis {...xAxisProps} />
            <YAxis
              yAxisId="accumulated"
              stroke="#f59e0b"
              tick={{ fill: "#f59e0b", fontSize: 16 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="mined"
              orientation="right"
              stroke="#10b981"
              tick={{ fill: "#10b981", fontSize: 16 }}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(
                value: number | undefined,
                name: string | undefined
              ) => {
                const label =
                  name === "btcBalance" ? accumulatedBtcLabel : btcMinedLabel;
                const decimals = name === "btcBalance" ? 0 : 2;
                return [
                  `${(value ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: decimals })} ₿`,
                  label,
                ];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) =>
                value === "btcBalance" ? accumulatedBtcLabel : btcMinedLabel
              }
            />
            <Area
              yAxisId="accumulated"
              type="monotone"
              dataKey="btcBalance"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#btcGradient)"
            />
            <Bar
              yAxisId="mined"
              dataKey="btcMined"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

