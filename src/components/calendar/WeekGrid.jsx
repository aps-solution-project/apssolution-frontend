import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeekDays, keyOf } from "@/lib/date";
import EventChip from "./EventChip";

export default function WeekGrid({
  cursorDate,
  eventsByDate,
  selectedDateKey,
  onSelectDate,
  onSelectEvent,
}) {
  const days = getWeekDays(cursorDate);
  const todayKey = keyOf(new Date());

  return (
    <Card className="rounded-2xl shadow-sm border-slate-200/80 h-full">
      <CardHeader className="pb-3 px-5 pt-5">
        <CardTitle className="text-base font-bold text-slate-800">
          Week
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 px-5 pb-5">
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const k = keyOf(d);
            const isSelected = k === selectedDateKey;
            const isToday = k === todayKey;
            const items = eventsByDate[k] || [];
            const dow = d.toLocaleString("en-US", { weekday: "short" });

            return (
              <div key={k} className="min-w-0">
                <button
                  onClick={() => onSelectDate(k)}
                  className={[
                    "w-full rounded-xl border p-2 text-left transition-all duration-150",
                    isSelected
                      ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50/50"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800">
                      {dow}{" "}
                      <span
                        className={[
                          isToday
                            ? "bg-blue-500 text-white px-1.5 py-0.5 rounded-full"
                            : "text-slate-400",
                        ].join(" ")}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                    {items.length ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {items.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 space-y-1">
                    {items.length ? (
                      items.slice(0, 6).map((ev) => (
                        <EventChip
                          key={ev.id}
                          event={ev}
                          onClick={() => onSelectEvent(ev)}
                        />
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-300">
                        No events
                      </div>
                    )}
                    {items.length > 6 ? (
                      <div className="text-[11px] text-slate-400 font-medium">
                        + {items.length - 6} more
                      </div>
                    ) : null}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
