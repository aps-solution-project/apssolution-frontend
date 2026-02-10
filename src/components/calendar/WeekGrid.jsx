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

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Week</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const k = keyOf(d);
            const isSelected = k === selectedDateKey;
            const items = eventsByDate[k] || [];
            const dow = d.toLocaleString("en-US", { weekday: "short" });

            return (
              <div key={k} className="min-w-0">
                <button
                  onClick={() => onSelectDate(k)}
                  className={[
                    "w-full rounded-xl border p-2 text-left",
                    isSelected
                      ? "border-violet-300 ring-2 ring-violet-100"
                      : "border-border",
                    "bg-background",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold">
                      {dow} <span className="text-muted-foreground">{d.getDate()}</span>
                    </div>
                    {items.length ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
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
                      <div className="text-[11px] text-muted-foreground">
                        No events
                      </div>
                    )}
                    {items.length > 6 ? (
                      <div className="text-[11px] text-muted-foreground">
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
