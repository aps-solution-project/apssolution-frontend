import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timeToMinutes, clamp } from "@/lib/date";

function minutesLabel(m) {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const tone = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  sky: "bg-sky-50 border-sky-200 text-sky-800",
  pink: "bg-pink-50 border-pink-200 text-pink-800",
  rose: "bg-rose-50 border-rose-200 text-rose-800",
  amber: "bg-amber-50 border-amber-200 text-amber-900",
  violet: "bg-violet-50 border-violet-200 text-violet-800",
  teal: "bg-teal-50 border-teal-200 text-teal-800",
  slate: "bg-slate-50 border-slate-200 text-slate-800",
  day: "bg-amber-50 border-amber-300 text-amber-900",
  night: "bg-blue-50 border-blue-300 text-blue-900",
};

export default function DayView({ dateKey, events = [], onSelectEvent }) {
  const startMin = 6 * 60;
  const endMin = 24 * 60;
  const total = endMin - startMin;
  const H = 600;

  /* 주간/야간 영역 표시 */
  const dayShiftStart = 7 * 60;
  const dayShiftEnd = 21 * 60;
  const nightShiftStart = 21 * 60;

  const dayTop = ((dayShiftStart - startMin) / total) * H;
  const dayHeight = ((dayShiftEnd - dayShiftStart) / total) * H;
  const nightTop = ((nightShiftStart - startMin) / total) * H;
  const nightHeight = ((endMin - nightShiftStart) / total) * H;

  return (
    <Card className="rounded-2xl shadow-sm border-slate-200/80 h-full">
      <CardHeader className="pb-3 px-5 pt-5">
        <CardTitle className="text-base font-bold text-slate-800">
          Day — {dateKey}
        </CardTitle>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            Day Shift (07:00~)
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
            Night Shift (21:00~)
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-5 pb-5">
        <div className="grid grid-cols-[64px_1fr] gap-3">
          <div className="space-y-6 pt-2">
            {Array.from({ length: 10 }, (_, i) => startMin + i * 120).map(
              (m) => (
                <div
                  key={m}
                  className="text-[11px] text-slate-400 font-semibold"
                >
                  {minutesLabel(m)}
                </div>
              ),
            )}
          </div>

          <div
            className="relative rounded-xl border border-slate-200 bg-white overflow-hidden"
            style={{ height: H }}
          >
            {/* Day shift background */}
            <div
              className="absolute left-0 right-0 bg-amber-50/40"
              style={{ top: dayTop, height: dayHeight }}
            />
            {/* Night shift background */}
            <div
              className="absolute left-0 right-0 bg-blue-50/40"
              style={{ top: nightTop, height: nightHeight }}
            />
            {/* Shift labels */}
            <div
              className="absolute left-2 text-[9px] font-bold text-amber-400 uppercase tracking-wider"
              style={{ top: dayTop + 4 }}
            >
              ☀ Day Shift
            </div>
            <div
              className="absolute left-2 text-[9px] font-bold text-blue-400 uppercase tracking-wider"
              style={{ top: nightTop + 4 }}
            >
              ☾ Night Shift
            </div>

            {/* hour lines */}
            {Array.from({ length: 19 }, (_, i) => startMin + i * 60).map(
              (m) => {
                const y = ((m - startMin) / total) * H;
                return (
                  <div
                    key={m}
                    className="absolute left-0 right-0 border-t border-slate-100"
                    style={{ top: y }}
                  />
                );
              },
            )}

            {/* events */}
            {events.map((ev) => {
              const s = clamp(timeToMinutes(ev.startTime) - startMin, 0, total);
              const e = clamp(timeToMinutes(ev.endTime) - startMin, 0, total);
              const top = (s / total) * H;
              const height = Math.max(28, ((e - s) / total) * H);

              const cls = tone[ev.color] || tone.blue;

              return (
                <button
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className={[
                    "absolute left-10 right-3 rounded-lg border-l-[3px] border px-3 py-2 text-left",
                    "text-[12px] transition-shadow hover:shadow-lg",
                    cls,
                  ].join(" ")}
                  style={{ top, height }}
                  title={ev.title}
                >
                  <div className="font-bold truncate">{ev.title}</div>
                  <div className="opacity-70 text-[11px]">
                    {ev.startTime} - {ev.endTime}
                  </div>
                  {ev.location ? (
                    <div className="opacity-70 text-[11px] truncate">
                      📍 {ev.location}
                    </div>
                  ) : null}
                </button>
              );
            })}

            {!events.length ? (
              <div className="absolute inset-0 grid place-items-center text-sm text-slate-400">
                No events for {dateKey}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
