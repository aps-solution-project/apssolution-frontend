import { useMemo, useState } from "react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// 색상 유틸리티
const getBlueGradient = (index, total) => {
  const start = 190;
  const end = 70;
  const totalCount = total > 1 ? total - 1 : 1;
  const value = Math.round(start - ((start - end) * index) / totalCount);
  return `rgb(${value}, ${value + 40}, 255)`;
};

export default function ProcessBarChart({ productName, tasks = [] }) {
  const [mode, setMode] = useState("duration");

  const chartData = useMemo(() => {
    let sum = 0;
    return tasks.map((t, i) => {
      sum += t.duration;
      return {
        name: `${t.seq}. ${t.name}`,
        value: mode === "duration" ? t.duration : sum,
        fill: getBlueGradient(i, tasks.length),
      };
    });
  }, [tasks, mode]);

  const chartConfig = {
    value: { label: mode === "duration" ? "소요 시간 (분)" : "누적 시간 (분)" },
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-sm font-black text-slate-800">
            {productName} 공정 시각화
          </h4>
          <p className="text-[11px] text-slate-400 font-medium">
            실시간 데이터 기반 분석
          </p>
        </div>

        {/* 미니 탭 스타일 모드 전환 */}
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
          {["duration", "cumulative"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1 text-[10px] font-black rounded-md transition-all",
                mode === m
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              {m === "duration" ? "소요시간" : "누적시간"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full relative">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full absolute inset-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 10, right: 30, top: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
              />
              <ChartTooltip
                cursor={{ fill: "#f8fafc" }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
