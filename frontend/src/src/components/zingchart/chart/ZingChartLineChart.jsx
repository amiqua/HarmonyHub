// src/components/zingchart/chart/ZingChartLineChart.jsx
import { useMemo } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/**
 * ZingChartLineChart
 * - Chart đường giống UI demo
 * - Dùng recharts (đã có trong deps của bạn)
 * - activeIndex: vạch dọc màu tím ở 1 mốc thời gian
 *
 * Props:
 * - labels: string[]
 * - series: { name: string, data: number[] }[]
 * - activeIndex?: number
 */
export default function ZingChartLineChart({
  labels = [],
  series = [],
  activeIndex = 0,
}) {
  const data = useMemo(() => {
    // build [{ time, s0, s1, s2 }]
    return labels.map((time, idx) => {
      const row = { time };
      series.forEach((s, si) => {
        row[`s${si}`] = s?.data?.[idx] ?? null;
      });
      return row;
    });
  }, [labels, series]);

  const activeTime = labels?.[activeIndex] ?? labels?.[0];

  // Không fix màu theo rule; dùng default recharts.
  // Nếu bạn muốn đúng màu y chang ảnh, mình sẽ map stroke cụ thể theo yêu cầu sau.
  const lines = useMemo(() => {
    return series.map((s, si) => ({
      key: `line-${si}`,
      dataKey: `s${si}`,
      name: s?.name ?? `Series ${si + 1}`,
    }));
  }, [series]);

  if (!labels.length || !series.length) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
        <div className="text-sm text-muted-foreground">
          Chưa có dữ liệu biểu đồ.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-4 md:p-6">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis dataKey="time" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ReTooltip
              contentStyle={{ borderRadius: 12 }}
              formatter={(val, name) => [val, name]}
              labelFormatter={(label) => `Time: ${label}`}
            />

            {/* Vạch dọc tím như UI demo */}
            {activeTime ? (
              <ReferenceLine x={activeTime} strokeDasharray="3 3" />
            ) : null}

            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.dataKey}
                dot={false}
                strokeWidth={2}
                name={l.name}
                isAnimationActive={false}
                onClick={() => {
                  toast.message("Chart clicked (demo).");
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
