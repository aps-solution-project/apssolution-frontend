import { useMemo } from "react";
import { getMonthMatrix, keyOf, timeToMinutes, formatTime12 } from "@/lib/date";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ── event card color map ── */
const cardColors = {
  blue:   { bg: "bg-blue-50",   border: "border-l-blue-400",   text: "text-blue-800",   sub: "text-blue-500" },
  sky:    { bg: "bg-sky-50",    border: "border-l-sky-400",    text: "text-sky-800",    sub: "text-sky-500" },
  pink:   { bg: "bg-pink-50",   border: "border-l-pink-400",   text: "text-pink-800",   sub: "text-pink-500" },
  rose:   { bg: "bg-rose-50",   border: "border-l-rose-400",   text: "text-rose-800",   sub: "text-rose-500" },
  amber:  { bg: "bg-amber-50",  border: "border-l-amber-400",  text: "text-amber-800",  sub: "text-amber-600" },
  violet: { bg: "bg-violet-50", border: "border-l-violet-400", text: "text-violet-800", sub: "text-violet-500" },
  teal:   { bg: "bg-teal-50",   border: "border-l-teal-400",   text: "text-teal-800",   sub: "text-teal-500" },
  slate:  { bg: "bg-slate-50",  border: "border-l-slate-400",  text: "text-slate-800",  sub: "text-slate-500" },
  /* shift */
  day:    { bg: "bg-amber-50",  border: "border-l-amber-400",  text: "text-amber-900",  sub: "text-amber-600" },
  night:  { bg: "bg-blue-50",   border: "border-l-blue-500",   text: "text-blue-900",   sub: "text-blue-500" },
};

function ShiftBadge({ shift }) {
  if (!shift) return null;
  if (shift === "day") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
        ☀ Day
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
      ☾ Night
    </span>
  );
}

function EventCard({ event, onClick }) {
  const c = cardColors[event.color] || cardColors.blue;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      className={[
        "w-full text-left rounded-lg border-l-[3px] px-2.5 py-2",
        "transition-all duration-150 hover:shadow-md hover:-translate-y-0.5",
        c.bg,
        c.border,
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={["text-[11px] font-bold truncate leading-tight", c.text].join(" ")}>
          {event.title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {event.start ? (
          <span className={["text-[10px]", c.sub].join(" ")}>
            ⏱ {event.start} - {event.end}
          </span>
        ) : null}
        {event.shift ? <ShiftBadge shift={event.shift} /> : null}
      </div>
      {event.location ? (
        <div className={["text-[9px] mt-0.5 truncate", c.sub].join(" ")}>
          📍 {event.location}
        </div>
      ) : null}
    </button>
  );
}

export default function MonthGrid({
  cursorDate,
  eventsByDate,
  selectedDateKey,
  onSelectDate,
  onSelectEvent,
  className = "",
}) {
  const year = cursorDate.getFullYear();
  const month = cursorDate.getMonth();
  const weeks = getMonthMatrix(year, month);
  const todayKey = keyOf(new Date());

  /* ── 각 주(row)별 대표 시간 라벨 계산 ── */
  const weekTimeLabels = useMemo(() => {
    return weeks.map((week) => {
      const allEventsInWeek = [];
      for (const d of week) {
        const k = keyOf(d);
        const evts = eventsByDate[k] || [];
        allEventsInWeek.push(...evts);
      }
      if (allEventsInWeek.length === 0) return "";
      // 가장 이른 시작 시간
      const sorted = allEventsInWeek
        .filter((e) => e.start)
        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
      if (sorted.length === 0) return "";
      return formatTime12(sorted[0].start);
    });
  }, [weeks, eventsByDate]);

  return (
    <div
      className={[
        "h-full min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* ── Header: DOW ── */}
      <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-slate-100 shrink-0">
        <div className="px-3 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Time
        </div>
        {DOW.map((d) => (
          <div
            key={d}
            className="px-2 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Week Rows ── */}
      <div className="flex-1 min-h-0 overflow-auto">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className={[
              "grid grid-cols-[72px_repeat(7,1fr)] min-h-[120px]",
              wi < weeks.length - 1 ? "border-b border-slate-100" : "",
            ].join(" ")}
          >
            {/* Time label */}
            <div className="px-3 py-3 flex items-start">
              <span className="text-[11px] font-semibold text-slate-400 mt-6">
                {weekTimeLabels[wi]}
              </span>
            </div>

            {/* Day cells */}
            {week.map((d) => {
              const k = keyOf(d);
              const inMonth = d.getMonth() === month;
              const isSelected = k === selectedDateKey;
              const isToday = k === todayKey;
              const items = eventsByDate[k] || [];

              return (
                <button
                  key={k}
                  onClick={() => onSelectDate(k)}
                  className={[
                    "p-2 text-left transition-all duration-100 border-r border-slate-50 last:border-r-0 min-w-0",
                    isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/60",
                  ].join(" ")}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={[
                        "text-[13px] font-bold leading-none",
                        isToday
                          ? "bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm shadow-blue-200"
                          : inMonth
                            ? "text-slate-700"
                            : "text-slate-300",
                      ].join(" ")}
                    >
                      {d.getDate()}
                    </span>
                    {items.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {items.length}
                      </span>
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-1.5">
                    {items.slice(0, 2).map((ev) => (
                      <EventCard
                        key={ev.id}
                        event={ev}
                        onClick={onSelectEvent}
                      />
                    ))}
                    {items.length > 2 && (
                      <div className="text-[10px] text-slate-400 font-medium pl-1">
                        +{items.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
