import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/use-authGuard";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import backendData from "@/data/scenarioMock.json";

import { useRouter } from "next/router";
import Link from "next/link";

const MINUTE_STEP = 5;
const CELL = 15;

const TOOL_COLORS = {
  "T-MIX-SPR-001": "bg-pink-400",
  "T-MIX-SPR-002": "bg-pink-400",
  "T-MIX-SPR-003": "bg-pink-400",
  "T-OVN-COV-001": "bg-purple-500",
  "T-FRY-OIL-001": "bg-orange-500",
  "T-FER-BUL-001": "bg-lime-500",
  "T-PRO-BOX-001": "bg-amber-400",
  "T-TBL-STS-001": "bg-yellow-400",
  "T-TBL-STS-002": "bg-yellow-400",
  "T-TBL-STS-003": "bg-yellow-400",
  "T-RCK-MOV-001": "bg-indigo-400",
  "T-DEP-BAT-001": "bg-emerald-500",
  "T-TNK-BAT-001": "bg-sky-400",
};

/* ================= 시간 계산 ================= */

const baseTime = new Date(backendData.scenario.startAt).getTime();

const minutesFromBase = (iso) =>
  Math.round((new Date(iso).getTime() - baseTime) / 60000);

/* ================= 작업자 그룹 ================= */

const workerMap = {};

backendData.scenarioProductList.forEach((product, pIndex) => {
  product.scenarioSchedules.forEach((s) => {
    const workerName = s.worker?.name || `작업자-${(pIndex % 3) + 1}`;

    if (!workerMap[workerName]) {
      workerMap[workerName] = { name: workerName, tasks: [] };
    }

    workerMap[workerName].tasks.push({
      id: s.id,
      label: s.scheduleTask.name,
      product: product.name,
      start: minutesFromBase(s.startAt),
      duration: s.scheduleTask.duration,
      toolId: s.toolId,
    });
  });
});

const workers = Object.values(workerMap);

const TOTAL_MINUTES = backendData.scenario.makespan;
const SLOTS = TOTAL_MINUTES / MINUTE_STEP;

/* ================================================= */

export default function WorkersGantt() {
  useAuthGuard();
  const router = useRouter();

  const isSimulations = router.pathname === "/simulations";
  const isWorkload = router.pathname === "/workerSchedule";

  return (
    <div className="h-full w-full overflow-x-auto bg-slate-100 p-5">
      <Carousel
        opts={{ align: "start", loop: false }}
        className="w-full relative"
      >
        <Card className="rounded-sm w-full">
          <div className="relative">
            {/* ===== 상단 헤더 ===== */}
            <div className="flex items-center justify-between px-7 py-2 border-b">
              <div className="flex gap-8 text-sm font-medium">
                <Link
                  href="/simulations"
                  className={
                    isSimulations
                      ? "text-lg text-sky-600"
                      : "text-lg text-stone-300"
                  }
                >
                  시뮬레이션 결과
                </Link>
                <Link
                  href="/workerSchedule"
                  className={
                    isWorkload
                      ? "text-lg text-sky-600"
                      : "text-lg text-stone-300"
                  }
                >
                  인원별 작업량
                </Link>
              </div>

              <p className="font-medium text-slate-500">
                {new Date(backendData.scenario.startAt).toLocaleDateString()}
              </p>
            </div>

            {/* ===== 중앙 Carousel 버튼 ===== */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 z-10 flex gap-6">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="w-full overflow-auto">
                <div className="min-w-max">
                  {/* 타임라인 */}
                  <TimelineHeader />

                  {/* 본문 */}
                  <CarouselContent>
                    <CarouselItem className="basis-full pr-6">
                      <div className="space-y-4">
                        {workers.map((w) => (
                          <WorkerGroup key={w.name} worker={w} />
                        ))}
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Carousel>
    </div>
  );
}

/* ================= 타임라인 ================= */

function TimelineHeader() {
  const steps = TOTAL_MINUTES / MINUTE_STEP;

  return (
    <div className="flex ml-65 items-end h-12 text-xs text-slate-600 overflow-auto border-b">
      {Array.from({ length: steps }).map((_, i) => {
        const minutes = i * MINUTE_STEP;
        const hour = Math.floor(minutes / 60);

        const isHour = minutes % 60 === 0;
        const isHalf = minutes % 30 === 0;

        let height = 6;
        if (isHalf) height = 10;
        if (isHour) height = 16;

        return (
          <div
            key={i}
            className="relative shrink-0 flex justify-center"
            style={{ width: CELL }}
          >
            <div
              className="bg-slate-400 rounded"
              style={{ width: 1, height }}
            />

            {isHour && (
              <div className="absolute -top-4 font-medium text-slate-700">
                {String(hour).padStart(2, "0")}:00
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================= 작업자 ================= */

function WorkerGroup({ worker }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-6 py-2 rounded-4xl bg-sky-500 text-white font-semibold text-base hover:bg-sky-600 transition"
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {worker.name}
      </button>

      {open &&
        worker.tasks
          .sort((a, b) => a.start - b.start)
          .map((task) => <TaskRow key={task.id} task={task} />)}
    </div>
  );
}

/* ================= 작업 ================= */

function TaskRow({ task }) {
  const left = (task.start / MINUTE_STEP) * CELL;
  const width = (task.duration / MINUTE_STEP) * CELL;

  return (
    <div className="flex min-w-0 overflow-x-auto overflow-y-hidden">
      <div className="w-65 shrink-0 pr-3 text-sm space-y-1">
        <div className="font-medium text-stone-600">{task.label}</div>
        <div className="text-xs text-slate-400">
          {task.product} · {task.toolId}
        </div>
      </div>

      <div className="relative h-10" style={{ width: SLOTS * CELL }}>
        <HoverCard>
          <HoverCardTrigger asChild>
            <div
              className={`${
                TOOL_COLORS[task.toolId] || "bg-slate-400"
              } h-8 rounded-lg text-white text-xs px-2 shadow absolute top-1`}
              style={{ left, width }}
            >
              {formatTime(task.start)} –{" "}
              {formatTime(task.start + task.duration)}
            </div>
          </HoverCardTrigger>

          <HoverCardContent className="w-60">
            <div className="font-semibold">{task.label}</div>
            <div className="text-xs text-muted-foreground">
              {formatTime(task.start)} ~{" "}
              {formatTime(task.start + task.duration)}
            </div>
            <div className="mt-1 text-xs">{task.product}</div>
            <div className="text-xs">{task.toolId}</div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
}

function formatTime(min) {
  const baseHour = new Date(backendData.scenario.startAt).getHours();
  const h = Math.floor(min / 60) + baseHour;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
