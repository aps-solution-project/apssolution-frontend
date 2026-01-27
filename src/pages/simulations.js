import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

/* =========================
   ⏱ Time System (24h / 5min)
========================= */

const MINUTE_STEP = 5;
const TOTAL_MINUTES = 24 * 60;
const CELL = 12; // px per 5 minutes
const SLOTS = TOTAL_MINUTES / MINUTE_STEP;

/* =========================
   🎨 Equipment Colors
========================= */

const EQUIP_COLORS = {
  MIX: "bg-pink-400",
  PROOF: "bg-blue-400",
  BAKE: "bg-purple-400",
  COOL: "bg-indigo-400",
  PACK: "bg-emerald-400",
  DECOR: "bg-amber-400",
};

/* =========================
   📦 Product Schedule Data
========================= */

const products = [
  {
    id: "JB_BREAD_BASIC",
    name: "기본 식빵",
    tasks: [
      { id: "MIX", label: "반죽", start: 0, duration: 40 },
      { id: "PROOF", label: "1차 발효", start: 40, duration: 120 },
      { id: "BAKE", label: "굽기", start: 160, duration: 50 },
      { id: "COOL", label: "냉각", start: 210, duration: 40 },
      { id: "PACK", label: "포장", start: 250, duration: 30 },
    ],
  },
  {
    id: "JB_CAKE_CREAM",
    name: "크림 케이크",
    tasks: [
      { id: "MIX", label: "반죽", start: 20, duration: 40 },
      { id: "BAKE", label: "굽기", start: 80, duration: 70 },
      { id: "DECOR", label: "데코", start: 160, duration: 60 },
      { id: "PACK", label: "포장", start: 230, duration: 30 },
    ],
  },
];

/* =========================
   🧱 Main Component
========================= */

export default function ProductionGantt() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <Card className="rounded-2xl shadow-xl">
        <CardContent className="p-6 space-y-4 overflow-x-auto">
          <h1 className="text-xl font-semibold">Daily Production Schedule</h1>

          <TimelineHeader />

          <div className="space-y-4 min-w-max">
            {products.map((p) => (
              <ProductGroup key={p.id} product={p} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================
   🕒 Header
========================= */

function TimelineHeader() {
  return (
    <div className="flex ml-[240px] text-xs text-slate-500">
      {Array.from({ length: 24 }).map((_, h) => (
        <div
          key={h}
          className="border-r text-center"
          style={{ width: CELL * 12 }}
        >
          {String(h).padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}

/* =========================
   📂 Product Group (collapsible)
========================= */

function ProductGroup({ product }) {
  const [open, setOpen] = useState(true);

  const sortedTasks = [...product.tasks].sort((a, b) => a.start - b.start);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-semibold text-slate-700"
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        {product.name}
      </button>

      {open && (
        <div className="space-y-2">
          {sortedTasks.map((task, i) => (
            <TaskRow key={task.id} task={task} next={sortedTasks[i + 1]} />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   📈 Task Row
========================= */

function TaskRow({ task, next }) {
  const left = (task.start / MINUTE_STEP) * CELL;
  const width = (task.duration / MINUTE_STEP) * CELL;

  return (
    <div className="flex items-center relative">
      <div className="w-[240px] pr-3 text-sm text-slate-600">{task.label}</div>

      <div className="relative h-10" style={{ width: SLOTS * CELL }}>
        <div
          className={`${EQUIP_COLORS[task.id]} h-8 rounded-lg text-white text-xs font-medium flex items-center px-2 shadow absolute`}
          style={{ left, width }}
        >
          {formatTime(task.start)} – {formatTime(task.start + task.duration)}
        </div>

        {next && <Arrow from={task} to={next} />}
      </div>
    </div>
  );
}

/* =========================
   ➡ Dependency Arrow
========================= */

function Arrow({ from, to }) {
  const x1 = ((from.start + from.duration) / MINUTE_STEP) * CELL;
  const x2 = (to.start / MINUTE_STEP) * CELL;

  return (
    <svg
      className="absolute top-4"
      style={{ left: x1, width: x2 - x1, height: 20 }}
    >
      <line
        x1="0"
        y1="10"
        x2={x2 - x1 - 6}
        y2="10"
        stroke="#94a3b8"
        strokeWidth="2"
      />
      <polygon
        points={`${x2 - x1 - 6},5 ${x2 - x1},10 ${x2 - x1 - 6},15`}
        fill="#94a3b8"
      />
    </svg>
  );
}

/* =========================
   🧮 Utils
========================= */

function formatTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
