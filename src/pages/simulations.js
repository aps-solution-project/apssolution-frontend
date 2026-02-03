import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/use-authGuard";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const MINUTE_STEP = 5;
const CELL = 12;

// 도구별 색상 매핑은 여기서 정의. 간략화가 필요할것 같음
const TOOL_COLORS = {
  "MIXER-01": "bg-pink-400",
  "PROOFER-01": "bg-blue-400",
  "OVEN-01": "bg-purple-400",
  "COOLER-01": "bg-indigo-400",
  "PACKER-01": "bg-emerald-400",
  "TABLE-01": "bg-yellow-400",
};

// 더미데이터(나중에 삭제)--------------------------
const backendData = {
  scenario: {
    id: "SCN-BAKERY-001",
    title: "1월 베이커리 생산 계획",
    description: "주간 빵 생산 스케줄",
    startAt: "2026-01-26T05:00:00",
    makespan: 480,
    maxWorkerCount: 5,
  },
  scenarioProductList: [
    {
      id: "CK-01",
      name: "생크림 케이크",
      description: "부드러운 시트와 생크림 아이싱 케이크",
      scenarioSchedules: [
        {
          id: 201,
          scheduleTask: {
            id: "TASK-CAKE-01",
            seq: 1,
            name: "반죽 혼합",
            duration: 20,
          },
          worker: { id: "baker-1", name: "김제빵" },
          toolId: "MIXER-01",
          startAt: "2026-01-26T05:40:00",
          endAt: "2026-01-26T06:00:00",
        },
        {
          id: 202,
          scheduleTask: {
            id: "TASK-CAKE-02",
            seq: 2,
            name: "오븐 굽기",
            duration: 40,
          },
          worker: { id: "baker-4", name: "최제빵" },
          toolId: "OVEN-01",
          startAt: "2026-01-26T06:00:00",
          endAt: "2026-01-26T06:40:00",
        },
        {
          id: 203,
          scheduleTask: {
            id: "TASK-CAKE-03",
            seq: 3,
            name: "시트 냉각",
            duration: 30,
          },
          worker: { id: "baker-5", name: "정제빵" },
          toolId: "COOLER-01",
          startAt: "2026-01-26T06:40:00",
          endAt: "2026-01-26T07:10:00",
        },
        {
          id: 204,
          scheduleTask: {
            id: "TASK-CAKE-04",
            seq: 4,
            name: "크림 아이싱",
            duration: 45,
          },
          worker: { id: "baker-3", name: "박제빵" },
          toolId: "TABLE-01",
          startAt: "2026-01-26T07:10:00",
          endAt: "2026-01-26T07:55:00",
        },
        {
          id: 205,
          scheduleTask: {
            id: "TASK-CAKE-05",
            seq: 5,
            name: "장식 및 포장",
            duration: 25,
          },
          worker: { id: "baker-2", name: "이제빵" },
          toolId: "PACKER-01",
          startAt: "2026-01-26T07:55:00",
          endAt: "2026-01-26T08:20:00",
        },
      ],
    },
    {
      id: "BRD-01",
      name: "바게트",
      description: "프랑스 전통 빵",
      scenarioSchedules: [
        {
          id: 103,
          scheduleTask: {
            id: "TASK-BAKE-03",
            seq: 3,
            name: "성형",
            duration: 25,
          },
          worker: { id: "baker-3", name: "박제빵" },
          toolId: "TABLE-01",
          startAt: "2026-01-26T06:20:00",
          endAt: "2026-01-26T06:45:00",
        },
        {
          id: 104,
          scheduleTask: {
            id: "TASK-BAKE-04",
            seq: 4,
            name: "2차 발효",
            duration: 45,
          },
          worker: { id: "baker-2", name: "이제빵" },
          toolId: "PROOFER-01",
          startAt: "2026-01-26T06:45:00",
          endAt: "2026-01-26T07:30:00",
        },
        {
          id: 105,
          scheduleTask: {
            id: "TASK-BAKE-05",
            seq: 5,
            name: "오븐 굽기",
            duration: 35,
          },
          worker: { id: "baker-4", name: "최제빵" },
          toolId: "OVEN-01",
          startAt: "2026-01-26T07:30:00",
          endAt: "2026-01-26T08:05:00",
        },
        {
          id: 106,
          scheduleTask: {
            id: "TASK-BAKE-06",
            seq: 6,
            name: "냉각",
            duration: 30,
          },
          worker: { id: "baker-5", name: "정제빵" },
          toolId: "COOLER-01",
          startAt: "2026-01-26T08:05:00",
          endAt: "2026-01-26T08:35:00",
        },
        {
          id: 107,
          scheduleTask: {
            id: "TASK-BAKE-07",
            seq: 7,
            name: "포장",
            duration: 20,
          },
          worker: { id: "baker-1", name: "김제빵" },
          toolId: "PACKER-01",
          startAt: "2026-01-26T08:35:00",
          endAt: "2026-01-26T08:55:00",
        },
      ],
    },
  ],
};
//-----------------------------------
const baseTime = new Date(backendData.scenario.startAt).getTime();

function minutesFromBase(iso) {
  return Math.round((new Date(iso).getTime() - baseTime) / 60000);
}

//여기도 나중에 수정 또는 삭제
const products = backendData.scenarioProductList.map((product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  tasks: product.scenarioSchedules.map((s) => ({
    id: s.scheduleTask.id,
    label: s.scheduleTask.name,
    start: minutesFromBase(s.startAt),
    duration: s.scheduleTask.duration,
    worker: s.worker.name,
    toolId: s.toolId,
  })),
}));

const TOTAL_MINUTES = backendData.scenario.makespan;
const SLOTS = TOTAL_MINUTES / MINUTE_STEP;

export default function ProductionGantt() {
  useAuthGuard();

  return (
    <div className="h-full w-full overflow-x-auto bg-slate-100 p-5">
      <Card className="rounded-sm w-full">
        <div className="flex items-center justify-between px-7 py-2 border-b">
          <p className="text-lg font-semibold">시뮬레이션 결과</p>

          <p className="font-medium text-slate-500">2026년 2월 3일</p>
        </div>

        <CardContent className="p-6 space-y-4">
          <div className="w-full overflow-auto">
            <div className="min-w-max">
              <TimelineHeader />
              <div className="space-y-4">
                {products.map((p) => (
                  <ProductGroup key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineHeader() {
  const HOURS_IN_DAY = 24;

  return (
    <div className="flex ml-65 text-xs text-slate-500 overflow-auto">
      {Array.from({ length: HOURS_IN_DAY }).map((_, h) => (
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

function ProductGroup({ product }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-semibold text-slate-700"
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {product.name}
      </button>
      <span className="text-xs text-slate-400">{product.description}</span>
      {open &&
        product.tasks.map((task, i) => <TaskRow key={task.id} task={task} />)}
    </div>
  );
}

function TaskRow({ task }) {
  const left = (task.start / MINUTE_STEP) * CELL;
  const width = (task.duration / MINUTE_STEP) * CELL;

  return (
    <div className="flex min-w-0 overflow-x-auto overflow-y-hidden">
      <div className="w-65 shrink-0 pr-3 text-sm text-slate-600 space-y-1 ">
        <div className="font-medium">{task.label}</div>
        <div className="text-xs text-slate-400">
          {task.worker} · {task.toolId}
        </div>
      </div>

      <div className="relative h-10" style={{ width: SLOTS * CELL }}>
        <HoverCard openDelay={10} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div
              className={`${TOOL_COLORS[task.toolId]} 
                h-8 rounded-lg text-white text-xs px-2 shadow absolute top-1 cursor-pointer`}
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
            <div className="mt-1 text-xs">{task.worker}</div>
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
