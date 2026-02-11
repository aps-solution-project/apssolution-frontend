"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, Legend, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/* ===============================
   블루 그라데이션
================================ */
function getBlueGradient(index, total) {
  const start = 190;
  const end = 70;
  const value = Math.round(start - ((start - end) * index) / (total - 1));
  return `rgb(${value}, ${value + 40}, 255)`;
}

export default function ProcessBarChartPage() {
  const [mode, setMode] = useState("duration");

  const [tasks] = useState([
    { seq: 1, name: "원료 계량", duration: 70 },
    { seq: 2, name: "반죽 믹싱", duration: 60 },
    { seq: 3, name: "오토리즈", duration: 60 },
    { seq: 4, name: "1차 발효", duration: 180 },
    { seq: 5, name: "분할", duration: 50 },
    { seq: 6, name: "중간 둥글리기", duration: 60 },
    { seq: 7, name: "중간 휴지", duration: 50 },
    { seq: 8, name: "성형", duration: 140 },
    { seq: 9, name: "최종 발효", duration: 120 },
    { seq: 10, name: "스팀 굽기", duration: 120 },
    { seq: 11, name: "냉각", duration: 80 },
    { seq: 12, name: "보관", duration: 10 },
  ]);

  const chartData = useMemo(() => {
    if (mode === "duration") {
      return tasks.map((t, i) => ({
        name: `${t.seq}. ${t.name}`,
        value: t.duration,
        fill: getBlueGradient(i, tasks.length),
      }));
    }

    let sum = 0;
    return tasks.map((t, i) => {
      sum += t.duration;
      return {
        name: `${t.seq}. ${t.name}`,
        value: sum,
        fill: getBlueGradient(i, tasks.length),
      };
    });
  }, [tasks, mode]);

  const chartConfig = {
    value: {
      label: mode === "duration" ? "소요 시간 (분)" : "누적 시간 (분)",
    },
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">바게트 클래식 공정</CardTitle>
        <CardDescription className="text-sm">
          {mode === "duration" ? "공정별 작업 시간" : "공정 누적 시간"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Menubar */}
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger
              onClick={() => setMode("duration")}
              className={mode === "duration" ? "font-semibold" : ""}
            >
              소요시간
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger
              onClick={() => setMode("cumulative")}
              className={mode === "cumulative" ? "font-semibold" : ""}
            >
              누적시간
            </MenubarTrigger>
          </MenubarMenu>
        </Menubar>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[380px]">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 30, right: 30, top: 10, bottom: 10 }}
            barSize={18}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={120}
              tick={{ fontSize: 12 }}
            />
            <XAxis type="number" />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="square"
              payload={[
                {
                  value: chartConfig.value.label,
                  type: "square",
                  color: "rgb(96, 165, 250)", // 사각형 색 (파란색)
                },
              ]}
              formatter={(value) => (
                <span style={{ color: "#000" }}>{value}</span> // 글자색 검정
              )}
              wrapperStyle={{ fontSize: "12px" }}
            />

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="value"
              name={chartConfig.value.label}
              layout="vertical"
              radius={6}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        {mode === "duration"
          ? "각 공정별 실제 작업 소요 시간"
          : "공정이 진행됨에 따른 누적 시간 증가"}
      </CardFooter>
    </Card>
  );
}
