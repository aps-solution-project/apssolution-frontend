import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import MonthGrid from "./MonthGrid";
import RightPanel from "./RightPanel";
import AddEventDialog from "./AddEventDialog";

import { addMonths, formatMonthTitle, keyOf } from "@/lib/date";
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

export default function CalendarPage() {
  const [view, setView] = useState("month");
  const [cursorDate, setCursorDate] = useState(new Date()); // ✅ 오늘 기준
  const [selectedDateKey, setSelectedDateKey] = useState(keyOf(new Date()));
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [events, setEvents] = useState([]);

  // ✅ 초기 로드
  useEffect(() => {
    const list = loadEvents();
    setEvents(list);
  }, []);

  // ✅ 저장
  useEffect(() => {
    saveEvents(events);
  }, [events]);

  // ✅ 현재 view 범위 계산
  const range = useMemo(() => {
    if (view === "week") return getWeekRangeKeys(cursorDate);
    if (view === "day") return getDayRangeKeys(cursorDate);
    return getMonthRangeKeys(cursorDate);
  }, [view, cursorDate]);

  // ✅ 현재 범위 이벤트만
  const visibleEvents = useMemo(
    () => filterEventsInRange(events, range.startKey, range.endKey),
    [events, range.startKey, range.endKey],
  );

  // ✅ 날짜별 맵
  const eventsByDate = useMemo(() => {
    const map = {};
    for (const e of visibleEvents) (map[e.date] ||= []).push(e);
    return map;
  }, [visibleEvents]);

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

      // 전체 events에도 반영 (localStorage 유지)
      setEvents((list) => upsertEvent(list, nextEvent));

      return nextEvent;
    });
  };

  return (
    <div className="h-full overflow-hidden pb-6">
      <div className="mx-auto h-full w-full max-w-[1440px] px-7 py-5 flex flex-col gap-4">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">Hello, Angkasa</div>
            <div className="text-2xl font-semibold tracking-tight truncate">
              You are doing great. Keep practicing!
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-[360px] hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-10 rounded-xl"
                placeholder="Search event, activities..."
              />
            </div>

            <AddEventDialog
              defaultDateKey={selectedDateKey}
              onAdd={onAdd}
              trigger={
                <Button className="h-10 rounded-xl px-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              }
            />
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center justify-between">
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="rounded-xl p-1">
              <TabsTrigger value="month" className="rounded-lg px-4">
                Month
              </TabsTrigger>
              <TabsTrigger value="week" className="rounded-lg px-4">
                Week
              </TabsTrigger>
              <TabsTrigger value="day" className="rounded-lg px-4">
                Day
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => setCursorDate((d) => addMonths(d, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm font-semibold w-[180px] text-center">
              {formatMonthTitle(cursorDate)}
            </div>

            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => setCursorDate((d) => addMonths(d, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
          {/* CALENDAR */}
          <div className="col-span-8 min-h-0">
            <div className="h-full min-h-0">
              {/* view에 따라 Month/Week/Day 컴포넌트 분기하는 구조라면 여기에 넣고,
                지금은 MonthGrid 예시 */}
              <MonthGrid
                cursorDate={cursorDate}
                eventsByDate={eventsByDate}
                selectedDateKey={selectedDateKey}
                onSelectDate={onSelectDate}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                className="h-full"
              />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-4 min-h-0">
            <div className="h-full min-h-0 overflow-hidden rounded-2xl bg-background border shadow-sm">
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
