import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AddEventDialog from "./AddEventDialog";
import DayView from "./DayView";
import MonthGrid from "./MonthGrid";
import RightPanel from "./RightPanel";
import WeekGrid from "./WeekGrid";

import {
  addDays,
  addMonths,
  formatDayTitle,
  formatMonthTitle,
  formatWeekRange,
  keyOf,
} from "@/lib/date";
import {
  getDayRangeKeys,
  getMonthRangeKeys,
  getWeekRangeKeys,
} from "@/lib/date-range";
import { filterEventsInRange } from "@/lib/events-store";

import {
  deleteCalendar,
  getMonthlyCalendars,
  saveCalendar,
} from "@/api/calendar-api";
import { useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";

/* ── Real-time clock hook ── */
function useRealTimeClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* ── 토큰 헬퍼 ── */
function getToken() {
  return localStorage.getItem("token") || "";
}

export default function CalendarPage() {
  const [view, setView] = useState("month");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(keyOf(new Date()));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const clearHasScenarioUnread = useStomp(
    (state) => state.clearHasScenarioUnread,
  );

  const now = useRealTimeClock();
  const { token } = useToken();

  useEffect(() => {
    if (!cursorDate || !token) return;
    const month = cursorDate.getMonth() + 1;
    getMonthlyCalendars(token, month).then((obj) => {
      setEvents(obj.monthlySchedules || []);
      clearHasScenarioUnread();
    });
  }, [token, cursorDate]);

  // 초기 로드 + 월 변경 시 재조회
  // useEffect(() => {
  //   fetchEvents(cursorDate);
  // }, [cursorDate.getFullYear(), cursorDate.getMonth(), fetchEvents]);

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

  // ── 일정 추가/수정 (API) ──
  const onAdd = async (ev) => {
    try {
      saveCalendar(ev, token).then((obj) => {
        const month = cursorDate.getMonth() + 1;
        getMonthlyCalendars(token, month).then((obj) => {
          setEvents(obj.monthlySchedules || []);
        });
      });
    } catch (err) {
      console.error("일정 저장 실패:", err);
      alert("일정 저장에 실패했습니다.");
    }
  };

  // ── 일정 삭제 (API) ──
  const onDelete = async (eventId) => {
    if (!eventId) return;

    try {
      const flag = await deleteCalendar(eventId, token);
      if (flag) {
        window.alert("정상 처리되었습니다.");
        setSelectedEvent(null);
        const month = cursorDate.getMonth() + 1;
        const obj = await getMonthlyCalendars(token, month);
        setEvents(obj.monthlySchedules || []);
      } else {
        window.alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("일정 삭제 실패:", err);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  // ── 일정 수정 (API) ──
  const onUpdate = async (updatedEvent) => {
    try {
      const saved = await saveCalendar(updatedEvent, token);
      setEvents((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
      setSelectedEvent(saved);
    } catch (err) {
      console.error("일정 수정 실패:", err);
      alert("일정 수정에 실패했습니다.");
    }
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
      setEvents((list) =>
        list.map((e) => (e.id === nextEvent.id ? nextEvent : e)),
      );
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

  const clockStr = now.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    //hour12: false,
  });

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentHour = now.getHours();
  const isNightNow = currentHour >= 21 || currentHour < 7;

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto h-full w-full flex flex-col gap-4">
        {/* ═══ 🌟 통일감 있게 바꾼 TOP BAR ═══ */}
        <div className="flex items-center justify-between border-b pb-5 border-slate-100">
          <div className="space-y-1 min-w-0">
            {/* 상단 서브 타이틀 영역 */}
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <CalendarIcon size={18} /> {/* Lucide-react의 Calendar 아이콘 */}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Workforce Operations
              </span>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              일정 관리
              {loading && (
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              )}
            </h1>

            {/* 배지 및 정보 영역 */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[11px] font-bold border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2 animate-pulse" />
                {totalRunning} Running Projects
              </div>

              <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-100">
                <Sun className="h-3 w-3 mr-1.5 text-amber-500" />
                Day {dayShiftCount}
              </div>

              <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold border border-blue-100">
                <Moon className="h-3 w-3 mr-1.5 text-blue-500" />
                Night {nightShiftCount}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
                <div className="text-md font-bold text-slate-800 tabular-nums tracking-tight">
                  {clockStr}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {dateStr}
                </div>
              </div>
            </div>

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
                  일정 추가
                </Button>
              }
            />
          </div>
        </div>

        {/* ═══ TOOLBAR ═══ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-base font-bold text-slate-700">
              Schedule Task
            </div>

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

          <div className="col-span-4 min-h-0">
            <div className="h-full min-h-0 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="h-full overflow-auto p-4">
                <RightPanel
                  event={selectedEvent}
                  onClose={() => setSelectedEvent(null)}
                  onToggleTodo={onToggleTodo}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
