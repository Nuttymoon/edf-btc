import {
  ComposedChart,
  Bar,
  Line,
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

interface InvestmentMinersChartProps {
  data: ChartDataPoint[];
  title: string;
  note: string;
  investmentLabel: string;
  totalMinersLabel: string;
  currencySymbol: string;
  numberLocale: string;
}

export function InvestmentMinersChart({
  data,
  title,
  note,
  investmentLabel,
  totalMinersLabel,
  currencySymbol,
  numberLocale,
}: InvestmentMinersChartProps) {
  return (
    <div className={chartCardClass}>
      <h3 className="text-3xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-lg text-slate-400 mb-4 leading-relaxed">{note}</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis {...xAxisProps} />
            <YAxis
              yAxisId="capex"
              stroke="#8b5cf6"
              tick={{ fill: "#8b5cf6", fontSize: 16 }}
              tickFormatter={(value) => `${currencySymbol}${value}M`}
            />
            <YAxis
              yAxisId="miners"
              orientation="right"
              stroke="#f59e0b"
              tick={{ fill: "#f59e0b", fontSize: 16 }}
              tickFormatter={(value) => `${value.toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              formatter={(
                value: number | undefined,
                name: string | undefined
              ) => {
                if (name === "capex") {
                  return [
                    `${currencySymbol}${(value ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 1 })}M`,
                    investmentLabel,
                  ];
                }
                return [
                  `${((value ?? 0) * 1000).toLocaleString(numberLocale, { maximumFractionDigits: 0 })}`,
                  totalMinersLabel,
                ];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) =>
                value === "capex" ? investmentLabel : totalMinersLabel
              }
            />
            <Bar
              yAxisId="capex"
              dataKey="capex"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="miners"
              type="monotone"
              dataKey="totalMiners"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

