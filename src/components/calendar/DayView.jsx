import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timeToMinutes, clamp } from "@/lib/date";

function minutesLabel(m) {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const tone = {
  pink: "bg-pink-100 border-pink-200 text-pink-800",
  rose: "bg-rose-100 border-rose-200 text-rose-800",
  amber: "bg-amber-100 border-amber-200 text-amber-900",
  violet: "bg-violet-100 border-violet-200 text-violet-800",
  slate: "bg-slate-100 border-slate-200 text-slate-800",
};

export default function DayView({ dateKey, events = [], onSelectEvent }) {
  const startMin = 8 * 60;
  const endMin = 20 * 60;
  const total = endMin - startMin;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Day</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-[64px_1fr] gap-3">
          <div className="space-y-6 pt-2">
            {Array.from({ length: 7 }, (_, i) => startMin + i * 120).map((m) => (
              <div key={m} className="text-[11px] text-muted-foreground">
                {minutesLabel(m)}
              </div>
            ))}
          </div>

          <div className="relative h-[520px] rounded-xl border border-border bg-background overflow-hidden">
            {/* hour lines */}
            {Array.from({ length: 13 }, (_, i) => startMin + i * 60).map((m) => {
              const y = ((m - startMin) / total) * 520;
              return (
                <div
                  key={m}
                  className="absolute left-0 right-0 border-t border-border/60"
                  style={{ top: y }}
                />
              );
            })}

            {/* events */}
            {events.map((ev) => {
              const s = clamp(timeToMinutes(ev.start) - startMin, 0, total);
              const e = clamp(timeToMinutes(ev.end) - startMin, 0, total);
              const top = (s / total) * 520;
              const height = Math.max(26, ((e - s) / total) * 520);

              const cls = tone[ev.color] || tone.slate;

              return (
                <button
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className={[
                    "absolute left-3 right-3 rounded-lg border px-3 py-2 text-left",
                    "text-[12px]",
                    cls,
                  ].join(" ")}
                  style={{ top, height }}
                  title={ev.title}
                >
                  <div className="font-semibold truncate">{ev.title}</div>
                  <div className="opacity-80 text-[11px]">
                    {ev.start} - {ev.end}
                  </div>
                  {ev.location ? (
                    <div className="opacity-80 text-[11px] truncate">{ev.location}</div>
                  ) : null}
                </button>
              );
            })}

            {!events.length ? (
              <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                No events for {dateKey}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
