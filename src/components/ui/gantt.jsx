import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Rnd } from "react-rnd";
import { useState } from "react";

/* =========================
   🎨 Status Theme System
========================= */

const STATUS_THEME = {
  design: "from-pink-400 to-rose-500",
  frontend: "from-emerald-400 to-teal-500",
  backend: "from-indigo-400 to-blue-500",
  qa: "from-amber-400 to-orange-500",
  done: "from-slate-500 to-slate-700",
};

/* =========================
   ⏱ Time System (24h / 5min)
========================= */

const MINUTE_STEP = 5;
const TOTAL_MINUTES = 24 * 60;
const SLOTS = TOTAL_MINUTES / MINUTE_STEP; // 288
const CELL = 16; // px per 5 minutes

/* =========================
   📊 Project Data (minutes)
========================= */

const initialProjects = [
  {
    id: 1,
    name: "Slack",
    owner: "UX",
    status: "design",
    start: 60,
    duration: 120,
  },
  {
    id: 2,
    name: "Vimeo",
    owner: "QA",
    status: "done",
    start: 240,
    duration: 180,
  },
  {
    id: 3,
    name: "Behance",
    owner: "Front",
    status: "frontend",
    start: 30,
    duration: 90,
  },
  {
    id: 4,
    name: "Puzzle",
    owner: "Back",
    status: "backend",
    start: 360,
    duration: 150,
  },
];

/* =========================
   🧱 Layout
========================= */

export default function ProjectTimeline() {
  const [projects, setProjects] = useState(initialProjects);

  const update = (id, next) =>
    setProjects((p) => p.map((x) => (x.id === id ? { ...x, ...next } : x)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-10 grid grid-cols-[280px_1fr] gap-8">
      <Sidebar />

      <Card className="rounded-[32px] shadow-2xl border-0 overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Daily Timeline</h1>

          <div className="overflow-x-auto pb-4">
            <TimelineHeader />

            <div className="space-y-6 min-w-max">
              {projects.map((p) => (
                <GanttRow
                  key={p.id}
                  project={p}
                  onChange={(n) => update(p.id, n)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================
   🕒 Header (hours)
========================= */

function TimelineHeader() {
  return (
    <div className="flex ml-[160px]">
      {Array.from({ length: 24 }).map((_, h) => (
        <div
          key={h}
          className="text-xs text-slate-500 text-center border-r"
          style={{ width: CELL * 12 }}
        >
          {String(h).padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}

/* =========================
   📂 Sidebar
========================= */

function Sidebar() {
  return (
    <Card className="rounded-[28px] shadow-xl border-0">
      <CardContent className="p-6 space-y-5">
        <h2 className="font-semibold text-lg">Recent Tasks</h2>
        {[1, 2, 3].map((i) => (
          <TaskCard key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

function TaskCard() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow hover:shadow-md transition">
      <p className="font-medium">Important task</p>
      <p className="text-xs text-slate-400 mt-1">Today · 10:00 AM</p>
    </div>
  );
}

/* =========================
   📈 Gantt Row (5-min snap)
========================= */

function GanttRow({ project, onChange }) {
  return (
    <div className="flex items-center">
      {/* Task column (not employee) */}
      <div className="w-[160px] pr-4">
        <div className="rounded-xl bg-white shadow px-3 py-2">
          <p className="text-sm font-semibold text-slate-800">{project.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">공정 작업</p>
        </div>
      </div>

      <div className="relative h-14 border-l" style={{ width: SLOTS * CELL }}>
        <Rnd
          size={{ width: (project.duration / MINUTE_STEP) * CELL, height: 44 }}
          position={{ x: (project.start / MINUTE_STEP) * CELL, y: 0 }}
          bounds="parent"
          dragGrid={[CELL, 1]}
          resizeGrid={[CELL, 1]}
          enableResizing={{ left: true, right: true }}
          onDragStop={(e, d) => onChange({ start: (d.x / CELL) * MINUTE_STEP })}
          onResizeStop={(e, dir, ref, delta, pos) =>
            onChange({
              start: (pos.x / CELL) * MINUTE_STEP,
              duration: (ref.offsetWidth / CELL) * MINUTE_STEP,
            })
          }
          className={`bg-gradient-to-r ${STATUS_THEME[project.status]} rounded-full shadow-xl flex items-center px-4 text-white text-sm font-semibold cursor-move`}
        >
          {formatTime(project.start)} –{" "}
          {formatTime(project.start + project.duration)}
        </Rnd>
      </div>
    </div>
  );
}

function formatTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* =========================
   🔘 Button
========================= */

export function PrimaryButton({ children }) {
  return (
    <Button className="rounded-full px-6 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
      {children}
    </Button>
  );
}
