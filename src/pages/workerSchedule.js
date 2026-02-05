import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/use-authGuard";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useRouter } from "next/router";
import Link from "next/link";

const MINUTE_STEP = 5;
const CELL = 12;

const TOOL_COLORS = {
  "MIXER-01": "bg-pink-400",
  "PROOFER-01": "bg-blue-400",
  "OVEN-01": "bg-purple-400",
  "COOLER-01": "bg-indigo-400",
  "PACKER-01": "bg-emerald-400",
  "TABLE-01": "bg-yellow-400",
  "FERMENT-01": "bg-green-400",
  "FERMENT-02": "bg-green-600",
  "CUTTER-01": "bg-red-400",
  "MIXER-02": "bg-pink-600",
  "TABLE-02": "bg-yellow-600",
  "TABLE-03": "bg-yellow-800",
  "TABLE-04": "bg-yellow-300",
  "TABLE-05": "bg-yellow-400",
  "OVEN-02": "bg-purple-600",
  "OVEN-03": "bg-purple-800",
};

// ---------------- 더미 데이터 ----------------

const backendData = {
  scenario: {
    startAt: "2026-01-26T05:00:00",
    makespan: 480, // 8시간
  },

  scenarioProductList: [
    {
      name: "생크림 케이크",
      scenarioSchedules: [
        {
          scheduleTask: { name: "반죽 혼합", duration: 20 },
          worker: { name: "김제빵" },
          toolId: "MIXER-01",
          startAt: "2026-01-26T05:40:00",
        },
        {
          scheduleTask: { name: "1차 발효", duration: 30 },
          worker: { name: "김제빵" },
          toolId: "FERMENT-01",
          startAt: "2026-01-26T06:00:00",
        },
        {
          scheduleTask: { name: "오븐 굽기", duration: 40 },
          worker: { name: "최제빵" },
          toolId: "OVEN-01",
          startAt: "2026-01-26T06:40:00",
        },
        {
          scheduleTask: { name: "데코레이션", duration: 35 },
          worker: { name: "이제빵" },
          toolId: "TABLE-02",
          startAt: "2026-01-26T07:30:00",
        },
      ],
    },

    {
      name: "바게트",
      scenarioSchedules: [
        {
          scheduleTask: { name: "반죽 혼합", duration: 15 },
          worker: { name: "박제빵" },
          toolId: "MIXER-01",
          startAt: "2026-01-26T05:10:00",
        },
        {
          scheduleTask: { name: "성형", duration: 25 },
          worker: { name: "박제빵" },
          toolId: "TABLE-01",
          startAt: "2026-01-26T06:20:00",
        },
        {
          scheduleTask: { name: "굽기", duration: 35 },
          worker: { name: "최제빵" },
          toolId: "OVEN-02",
          startAt: "2026-01-26T07:00:00",
        },
        {
          scheduleTask: { name: "포장", duration: 20 },
          worker: { name: "김제빵" },
          toolId: "PACKER-01",
          startAt: "2026-01-26T08:35:00",
        },
      ],
    },

    {
      name: "크루아상",
      scenarioSchedules: [
        {
          scheduleTask: { name: "반죽 혼합", duration: 20 },
          worker: { name: "이제빵" },
          toolId: "MIXER-02",
          startAt: "2026-01-26T05:30:00",
        },
        {
          scheduleTask: { name: "접기 & 휴지", duration: 45 },
          worker: { name: "이제빵" },
          toolId: "TABLE-03",
          startAt: "2026-01-26T06:00:00",
        },
        {
          scheduleTask: { name: "굽기", duration: 30 },
          worker: { name: "최제빵" },
          toolId: "OVEN-01",
          startAt: "2026-01-26T07:00:00",
        },
      ],
    },

    {
      name: "식빵",
      scenarioSchedules: [
        {
          scheduleTask: { name: "반죽 혼합", duration: 25 },
          worker: { name: "김제빵" },
          toolId: "MIXER-01",
          startAt: "2026-01-26T06:10:00",
        },
        {
          scheduleTask: { name: "발효", duration: 40 },
          worker: { name: "김제빵" },
          toolId: "FERMENT-02",
          startAt: "2026-01-26T06:40:00",
        },
        {
          scheduleTask: { name: "굽기", duration: 45 },
          worker: { name: "최제빵" },
          toolId: "OVEN-02",
          startAt: "2026-01-26T07:40:00",
        },
        {
          scheduleTask: { name: "슬라이스", duration: 15 },
          worker: { name: "박제빵" },
          toolId: "CUTTER-01",
          startAt: "2026-01-26T08:40:00",
        },
      ],
    },

    {
      name: "마카롱",
      scenarioSchedules: [
        {
          scheduleTask: { name: "머랭 제조", duration: 20 },
          worker: { name: "이제빵" },
          toolId: "MIXER-02",
          startAt: "2026-01-26T05:50:00",
        },
        {
          scheduleTask: { name: "짜기", duration: 20 },
          worker: { name: "이제빵" },
          toolId: "TABLE-04",
          startAt: "2026-01-26T06:20:00",
        },
        {
          scheduleTask: { name: "굽기", duration: 25 },
          worker: { name: "최제빵" },
          toolId: "OVEN-03",
          startAt: "2026-01-26T06:50:00",
        },
        {
          scheduleTask: { name: "필링 샌딩", duration: 20 },
          worker: { name: "김제빵" },
          toolId: "TABLE-05",
          startAt: "2026-01-26T07:30:00",
        },
      ],
    },
  ],
};

// ---------------- 시간 계산 ----------------

const baseTime = new Date(backendData.scenario.startAt).getTime();

function minutesFromBase(iso) {
  return Math.round((new Date(iso).getTime() - baseTime) / 60000);
}

// ---------------- 작업자 기준 재구성 ----------------

const workerMap = {};

backendData.scenarioProductList.forEach((product) => {
  product.scenarioSchedules.forEach((s) => {
    const name = s.worker.name;

    if (!workerMap[name]) {
      workerMap[name] = { name, tasks: [] };
    }

    workerMap[name].tasks.push({
      id: Math.random().toString(36).slice(2),
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

// =================================================

export default function WorkersGantt() {
  useAuthGuard();

  const router = useRouter();
  const isSimulations = router.pathname === "/simulations";
  const isWorkload = router.pathname === "/workerSchedule";

  return (
    <div className="h-full w-full overflow-x-auto bg-slate-100 p-5">
      <Card className="rounded-sm w-full">
        <div className="flex items-center justify-between px-7 py-2 border-b">
          <div className="flex gap-8 text-sm font-medium">
            <Link
              href="/simulations"
              className={
                isSimulations
                  ? "text-lg text-indigo-600"
                  : "text-lg text-stone-300"
              }
            >
              시뮬레이션 결과
            </Link>
            <Link
              href="/workerSchedule"
              className={
                isWorkload
                  ? "text-lg text-indigo-600"
                  : "text-lg text-stone-300"
              }
            >
              인원별 작업량
            </Link>
          </div>

          <p className="font-medium text-slate-500">2026년 2월 3일</p>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="w-full overflow-auto">
            <div className="min-w-max">
              <TimelineHeader />

              <div className="space-y-4">
                {workers.map((w) => (
                  <WorkerGroup key={w.name} worker={w} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================

function TimelineHeader() {
  return (
    <div className="flex ml-65 text-xs text-slate-500 overflow-auto">
      {Array.from({ length: 24 }).map((_, h) => (
        <div
          key={h}
          className="border-r text-center shrink-0"
          style={{ width: (60 / MINUTE_STEP) * CELL }}
        >
          {String(h).padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}

function WorkerGroup({ worker }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-semibold text-slate-700"
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

function TaskRow({ task }) {
  const left = (task.start / MINUTE_STEP) * CELL;
  const width = (task.duration / MINUTE_STEP) * CELL;

  return (
    <div className="flex min-w-0 overflow-x-auto overflow-y-hidden">
      <div className="w-65 shrink-0 pr-3 text-sm text-slate-600 space-y-1">
        <div className="font-medium">{task.label}</div>
        <div className="text-xs text-slate-400">
          {task.product} · {task.toolId}
        </div>
      </div>

      <div className="relative h-10" style={{ width: SLOTS * CELL }}>
        <HoverCard openDelay={10} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div
              className={`${TOOL_COLORS[task.toolId]} h-8 rounded-lg text-white text-xs px-2 shadow absolute top-1 cursor-pointer`}
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
  const h = Math.floor(min / 60) + 5;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
