import { useEffect, useState } from "react";
import scenarioMock from "@/data/scenarioMock.json";

import { editScenarioSchedule } from "@/api/scenario-api";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/router";
import Link from "next/link";

const TOOL_COLORS = {
  // 1. 혼합 및 저장 (Pink / Sky)
  "T-MIX-SPR-001": "bg-pink-400",
  "T-MIX-SPR-002": "bg-pink-400",
  "T-MIX-SPR-003": "bg-pink-400",
  "T-MIX-SPR-004": "bg-pink-400",
  "T-TNK-BAT-001": "bg-sky-400",

  // 2. 가열 및 조리 (Purple / Orange)
  "T-OVN-COV-001": "bg-purple-500",
  "T-OVN-COV-002": "bg-purple-500",
  "T-OVN-COV-003": "bg-purple-500",
  "T-OVN-COV-004": "bg-purple-500",
  "T-FRY-OIL-001": "bg-orange-500",
  "T-BOI-STM-001": "bg-cyan-500",
  "T-BOI-STM-002": "bg-cyan-500",
  "T-BOI-STM-003": "bg-cyan-500",
  "T-BOI-STM-004": "bg-cyan-500",

  // 3. 발효 및 증식 (Lime / Amber)
  "T-FER-BUL-001": "bg-lime-500",
  "T-FER-BUL-002": "bg-lime-500",
  "T-PRO-BOX-001": "bg-amber-400",
  "T-PRO-BOX-002": "bg-amber-400",
  "T-PRO-BOX-003": "bg-amber-400",
  "T-PRO-BOX-004": "bg-amber-400",

  // 4. 성형 및 분할 (Rose / Red)
  "T-DIV-DOU-001": "bg-rose-400",
  "T-RND-DOU-001": "bg-rose-400",
  "T-MOL-BRD-001": "bg-rose-400",
  "T-CUT-BWL-001": "bg-violet-400",
  "T-CUT-BWL-002": "bg-violet-400",
  "T-CUT-BWL-003": "bg-violet-400",
  "T-CUT-BWL-004": "bg-violet-400",
  "T-SHT-ROL-001": "bg-fuchsia-400",

  // 5. 작업대 및 부대시설 (Yellow / Emerald)
  "T-TBL-STS-001": "bg-yellow-400",
  "T-TBL-STS-002": "bg-yellow-400",
  "T-TBL-STS-003": "bg-yellow-400",
  "T-TBL-STS-004": "bg-yellow-400",
  "T-TBL-STS-005": "bg-yellow-400",
  "T-DEP-BAT-001": "bg-emerald-500",

  // 6. 물류 및 냉각 (Indigo / Blue)
  "T-RCK-MOV-001": "bg-indigo-400",
  "T-CHI-AIR-001": "bg-blue-500",
  "T-CHI-AIR-002": "bg-blue-500",
  "T-CHI-AIR-003": "bg-blue-500",
  "T-CHI-AIR-004": "bg-blue-500",

  // 7. 포장 및 기타 (Teal / Slate)
  "T-PAC-AUT-001": "bg-teal-500",
  "T-PAN-TRAY-001": "bg-slate-500",
  "T-MAN-QC-001": "bg-slate-400",
};

//시간 줌
const ZOOM_LEVELS = [
  { step: 5, cell: 40 },
  { step: 15, cell: 55 },
  { step: 30, cell: 65 },
];

export default function ProductionGantt() {
  useAuthGuard();
  const router = useRouter();

  const [zoom, setZoom] = useState(0);
  const [cursorX, setCursorX] = useState(null);
  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const MINUTE_STEP = ZOOM_LEVELS[zoom].step;
  const CELL = ZOOM_LEVELS[zoom].cell;

  useEffect(() => {
    setScenarioData(scenarioMock);
    setLoading(false);
  }, []);
  console.log(scenarioMock.scenario.title);

  if (loading || !scenarioData) {
    return <div className="p-10"> 불러오는 중 ...</div>;
  }

  const baseTime = new Date(scenarioData.scenario.startAt).getTime();

  function minutesFromBase(iso) {
    return Math.round((new Date(iso).getTime() - baseTime) / 60000);
  }

  const products = scenarioData.scenarioProductList.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    tasks: product.scenarioSchedules.map((s) => ({
      id: s.id,
      label: s.scheduleTask.name,
      start: minutesFromBase(s.startAt),
      duration: s.scheduleTask.duration,
      workerId: s.worker?.id || null,
      toolId: s.tool?.id || s.toolId,
    })),
  }));

  const TOTAL_MINUTES = scenarioData.scenario.makespan;
  const SLOTS = TOTAL_MINUTES / MINUTE_STEP;

  const isSimulations = router.pathname === "/simulations";
  const isWorkload = router.pathname === "/workerSchedule";

  return (
    <div className="h-full w-full overflow-x-auto bg-slate-100 p-5">
      <Carousel
        opts={{ align: "start", loop: true }}
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
              <div className="flex gap-2 ml-[60%]">
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-700"
                  onClick={() => setZoom(0)}
                >
                  5분
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-700"
                  onClick={() => setZoom(1)}
                >
                  15분
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-700"
                  onClick={() => setZoom(2)}
                >
                  30분
                </Button>
              </div>

              <p className="font-medium text-slate-500">2026년 2월 3일</p>
            </div>

            {/* 중앙 Carousel 버튼 */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 z-10 flex gap-6">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="w-full overflow-auto">
                <div
                  className="min-w-max relative"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setCursorX(e.clientX - rect.left);
                  }}
                  onMouseLeave={() => setCursorX(null)}
                >
                  <TimelineHeader
                    totalMinutes={scenarioData.scenario.makespan}
                    minuteStep={MINUTE_STEP}
                    cell={CELL}
                  />

                  {cursorX !== null && (
                    <>
                      <div
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-40 pointer-events-none"
                        style={{ left: cursorX }}
                      />
                      <div
                        className="absolute -top-7 px-2 py-0.5 text-xs bg-black text-white rounded z-40"
                        style={{ left: cursorX + 6 }}
                      >
                        {formatTime(Math.round(cursorX / CELL) * MINUTE_STEP)}
                      </div>
                    </>
                  )}

                  <CarouselContent>
                    <CarouselItem className="basis-full pr-6">
                      <div className="space-y-6">
                        {products.map((p) => (
                          <ProductGroup
                            key={p.id}
                            product={p}
                            slots={SLOTS}
                            minuteStep={MINUTE_STEP}
                            cell={CELL}
                          />
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

//타임라인(시간눈금)
function TimelineHeader({ totalMinutes, minuteStep, cell }) {
  const steps = totalMinutes / minuteStep;

  return (
    <div className="flex ml-65 items-end h-12 text-xs text-slate-600 overflow-auto border-b">
      {Array.from({ length: steps }).map((_, i) => {
        const minutes = i * minuteStep;
        const hour = Math.floor(minutes / 60);

        const isHour = minutes % 60 === 0;
        const isHalf = minutes % 30 === 0;

        let tickHeight = 6;
        if (isHalf) tickHeight = 10;
        if (isHour) tickHeight = 16;

        return (
          <div
            key={i}
            className="relative shrink-0 flex justify-center"
            style={{ width: cell }}
          >
            <div
              className="bg-slate-400 rounded"
              style={{ width: 1, height: tickHeight }}
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

function ProductGroup({ product, slots, minuteStep, cell }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2 ">
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 px-6 py-2 rounded-4xl bg-sky-500 text-white font-semibold text-base hover:bg-sky-600 transition"
          >
            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            {product.name}
          </button>
        </HoverCardTrigger>

        <HoverCardContent className="w-72 text-sm text-stone-600">
          {product.description}
        </HoverCardContent>
      </HoverCard>

      {open &&
        product.tasks.map((task) => (
          <TaskRow
            task={task}
            slots={slots}
            minuteStep={minuteStep}
            cell={cell}
          />
        ))}
    </div>
  );
}

function TaskRow({ task, slots, minuteStep, cell }) {
  const left = (task.start / minuteStep) * cell;
  const width = (task.duration / minuteStep) * cell;

  const [workerId, setWorkerId] = useState(task.workerId);
  const [toolId, setToolId] = useState(task.toolId);
  const [accounts, setAccounts] = useState([]);

  // workerId, toolId 저장
  const handleSave = async () => {
    try {
      await editScenarioSchedule(useToken, task.id, {
        workerId: workerId,
        toolId: toolId,
      });
    } catch (err) {
      console.error("저장실패", err);
    }
  };

  return (
    <div className="flex min-w-0 overflow-x-auto overflow-y-hidden">
      <div className="w-65 shrink-0 pr-3 text-sm text-slate-600 space-y-1">
        <div className="font-medium">{task.label}</div>
        <Popover>
          <PopoverTrigger asChild>
            <div className="text-xs text-slate-400 cursor-pointer hover:text-sky-600 transition font-medium">
              {task.workerId} · {toolId}
            </div>
          </PopoverTrigger>

          <PopoverContent className="   w-64 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 ">
            <div className="text-sm font-semibold text-slate-700">
              🛠 작업 정보 수정
            </div>

            {/* 작업자 선택 */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">작업자</p>
              <Select value={workerId} onValueChange={setWorkerId}>
                <SelectTrigger className="h-9 rounded-lg border-slate-200 focus:ring-2 focus:ring-sky-400">
                  <SelectValue placeholder="작업자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.accountId} value={a.accountId}>
                      {a.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 장비 선택 */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">장비</p>
              <Select value={toolId} onValueChange={setToolId}>
                <SelectTrigger className="h-9 rounded-lg border-slate-200 focus:ring-2 focus:ring-indigo-400">
                  <SelectValue placeholder="장비 선택" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-lg max-h-48 overflow-auto">
                  {Object.keys(TOOL_COLORS).map((tool) => (
                    <SelectItem key={tool} value={tool}>
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              className=" w-full rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500  hover:from-blue-600 hover:to-indigo-600 text-white shadow-md"
              onClick={handleSave}
            >
              저장
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative h-10" style={{ width: slots * cell }}>
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
            <div className="mt-1 text-xs">{task.workerId}</div>
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
