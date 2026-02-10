import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthMatrix, keyOf } from "@/lib/date";
import EventChip from "./EventChip";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  return (
    <Card
      className={["rounded-2xl h-full min-h-0 shadow-sm", className].join(" ")}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Month</CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted-foreground pb-2">
          {DOW.map((d) => (
            <div key={d} className="px-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeks.flat().map((d) => {
            const k = keyOf(d);
            const inMonth = d.getMonth() === month;
            const isSelected = k === selectedDateKey;
            const items = eventsByDate[k] || [];

            return (
              <button
                key={k}
                onClick={() => onSelectDate(k)}
                className={[
                  "min-h-[92px] rounded-2xl border p-3 text-left",
                  "transition-colors",
                  isSelected
                    ? "border-violet-300 ring-2 ring-violet-100"
                    : "border-border",
                  "bg-background",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={[
                      "text-xs font-semibold",
                      inMonth ? "text-foreground" : "text-muted-foreground/40",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </span>

                  {items.length ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {items.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 space-y-1">
                  {items.slice(0, 2).map((ev) => (
                    <div key={ev.id} onClick={(e) => e.stopPropagation()}>
                      <EventChip event={ev} onClick={() => onSelectEvent(ev)} />
                    </div>
                  ))}
                  {items.length > 2 ? (
                    <div className="text-[11px] text-muted-foreground">
                      + {items.length - 2} more
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
