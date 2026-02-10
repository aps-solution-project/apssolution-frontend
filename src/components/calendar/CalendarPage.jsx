import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sun,
  Moon,
} from "lucide-react";

import MonthGrid from "./MonthGrid";
import WeekGrid from "./WeekGrid";
import DayView from "./DayView";
import RightPanel from "./RightPanel";
import AddEventDialog from "./AddEventDialog";

import {
  addDays,
  addMonths,
  formatMonthTitle,
  formatWeekRange,
  formatDayTitle,
  keyOf,
  startOfWeek,
} from "@/lib/date";
import {
  getMonthRangeKeys,
  getWeekRangeKeys,
  getDayRangeKeys,
} from "@/lib/date-range";
import {
  loadEvents,
  saveEvents,
  upsertEvent,
  filterEventsInRange,
} from "@/lib/events-store";

/* ── Real-time clock hook ── */
function useRealTimeClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function CalendarPage() {
  const [view, setView] = useState("month");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(keyOf(new Date()));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [events, setEvents] = useState([]);

  const now = useRealTimeClock();

  // 초기 로드
  useEffect(() => {
    const list = loadEvents();
    setEvents(list);
  }, []);

  // 저장
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  // 현재 view 범위 계산
  const range = useMemo(() => {
    if (view === "week") return getWeekRangeKeys(cursorDate);
    if (view === "day") return getDayRangeKeys(cursorDate);
    return getMonthRangeKeys(cursorDate);
  }, [view, cursorDate]);

  // 현재 범위 이벤트만
  const visibleEvents = useMemo(
    () => filterEventsInRange(events, range.startKey, range.endKey),
    [events, range.startKey, range.endKey],
  );

  // 날짜별 맵
  const eventsByDate = useMemo(() => {
    const map = {};
    for (const e of visibleEvents) (map[e.date] ||= []).push(e);
    return map;
  }, [visibleEvents]);

  // 검색 필터링
  const filteredEventsByDate = useMemo(() => {
    if (!searchQuery.trim()) return eventsByDate;
    const q = searchQuery.toLowerCase();
    const filtered = {};
    for (const [k, evts] of Object.entries(eventsByDate)) {
      const matched = evts.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.location || "").toLowerCase().includes(q),
      );
      if (matched.length) filtered[k] = matched;
    }
    return filtered;
  }, [eventsByDate, searchQuery]);

  // 통계
  const totalRunning = events.length;
  const dayShiftCount = events.filter((e) => e.shift === "day").length;
  const nightShiftCount = events.filter((e) => e.shift === "night").length;

  const onSelectDate = (k) => {
    setSelectedDateKey(k);
    const first = (eventsByDate[k] || [])[0] || null;
    setSelectedEvent(first);
  };

  const onAdd = (ev) => {
    setEvents((prev) => upsertEvent(prev, ev));
    setSelectedDateKey(ev.date);
    setSelectedEvent(ev);
  };

  const onToggleTodo = (todoId) => {
    setSelectedEvent((prev) => {
      if (!prev) return prev;
      const nextEvent = {
        ...prev,
        todos: (prev.todos || []).map((t) =>
          t.id === todoId ? { ...t, done: !t.done } : t,
        ),
      };
      setEvents((list) => upsertEvent(list, nextEvent));
      return nextEvent;
    });
  };

  // 뷰별 네비게이션
  const navigate = (delta) => {
    if (view === "month") setCursorDate((d) => addMonths(d, delta));
    else if (view === "week") setCursorDate((d) => addDays(d, delta * 7));
    else setCursorDate((d) => addDays(d, delta));
  };

  const navTitle = useMemo(() => {
    if (view === "day") return formatDayTitle(cursorDate);
    if (view === "week") return formatWeekRange(cursorDate);
    return formatMonthTitle(cursorDate);
  }, [view, cursorDate]);

  const goToday = () => {
    setCursorDate(new Date());
    setSelectedDateKey(keyOf(new Date()));
  };

  // Real-time clock display
  const clockStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 현재 주간/야간 판별
  const currentHour = now.getHours();
  const isNightNow = currentHour >= 21 || currentHour < 7;

  return (
    <div className="h-full overflow-hidden pb-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="mx-auto h-full w-full max-w-[1520px] px-7 py-5 flex flex-col gap-4">
        {/* ═══ TOP BAR ═══ */}
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 italic">
              My Schedule
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge
                variant="secondary"
                className="rounded-full bg-blue-100 text-blue-700 border-blue-200 font-bold text-[11px] px-3"
              >
                {totalRunning} Running Projects
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full bg-amber-100 text-amber-700 border-amber-200 font-bold text-[11px] px-3"
              >
                <Sun className="h-3 w-3 mr-1" />
                {dayShiftCount} Day
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-full bg-blue-100 text-blue-700 border-blue-200 font-bold text-[11px] px-3"
              >
                <Moon className="h-3 w-3 mr-1" />
                {nightShiftCount} Night
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 실시간 시계 */}
            <div
              className={[
                "flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm",
                isNightNow
                  ? "bg-blue-50 border-blue-200"
                  : "bg-amber-50 border-amber-200",
              ].join(" ")}
            >
              {isNightNow ? (
                <Moon className="h-4 w-4 text-blue-500" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800 tabular-nums tracking-tight">
                  {clockStr}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {dateStr}
                </div>
              </div>
            </div>

            {/* 검색 */}
            <div className="relative w-[260px] hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 h-10 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100 bg-white shadow-sm"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <AddEventDialog
              defaultDateKey={selectedDateKey}
              onAdd={onAdd}
              trigger={
                <Button className="h-10 rounded-xl px-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200/60 font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              }
            />

            {/* 유저 아바타 */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm border-[3px] border-white shadow-md shadow-blue-200/40">
              A
            </div>
          </div>
        </div>

        {/* ═══ TOOLBAR ═══ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-base font-bold text-slate-700">
              Schedule Task
            </div>

            {/* 네비게이션 */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-sm font-bold text-blue-600 min-w-[200px] text-center">
                {navTitle}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => navigate(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-8 ml-2 px-3 rounded-lg border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs"
                onClick={goToday}
              >
                Today
              </Button>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="rounded-xl p-1 bg-white border border-slate-200 shadow-sm h-9">
                <TabsTrigger
                  value="month"
                  className="rounded-lg px-4 font-bold text-xs h-7 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Month
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="rounded-lg px-4 font-bold text-xs h-7 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="day"
                  className="rounded-lg px-4 font-bold text-xs h-7 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Day
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* shift legend */}
            <div className="flex items-center gap-2 ml-3">
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-200 border border-amber-300" />
                Day
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 border border-blue-300" />
                Night
              </span>
            </div>
          </div>
        </div>

        {/* ═══ MAIN AREA ═══ */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-5">
          {/* CALENDAR */}
          <div className="col-span-8 min-h-0">
            <div className="h-full min-h-0">
              {view === "month" && (
                <MonthGrid
                  cursorDate={cursorDate}
                  eventsByDate={filteredEventsByDate}
                  selectedDateKey={selectedDateKey}
                  onSelectDate={onSelectDate}
                  onSelectEvent={(ev) => setSelectedEvent(ev)}
                  className="h-full"
                />
              )}
              {view === "week" && (
                <WeekGrid
                  cursorDate={cursorDate}
                  eventsByDate={filteredEventsByDate}
                  selectedDateKey={selectedDateKey}
                  onSelectDate={onSelectDate}
                  onSelectEvent={(ev) => setSelectedEvent(ev)}
                />
              )}
              {view === "day" && (
                <DayView
                  dateKey={keyOf(cursorDate)}
                  events={filteredEventsByDate[keyOf(cursorDate)] || []}
                  onSelectEvent={(ev) => setSelectedEvent(ev)}
                />
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-4 min-h-0">
            <div className="h-full min-h-0 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="h-full overflow-auto p-4">
                <RightPanel
                  event={selectedEvent}
                  onClose={() => setSelectedEvent(null)}
                  onToggleTodo={onToggleTodo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
