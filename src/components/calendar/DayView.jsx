import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timeToMinutes, clamp } from "@/lib/date";

function pad2(n) {
  return String(n).padStart(2, "0");
}

// 절대분(예: 06:00=360, 24:00=1440, 다음날 01:00=1500...) 24:00은 그대로 24:00 표기 24:00 이후는 +1 표시

function hourLabelAbs(mAbs) {
  if (mAbs === 24 * 60) return { text: "24:00", isNextDay: false };

  const dayIndex = Math.floor(mAbs / (24 * 60)); // 0=당일, 1=다음날...
  const within = ((mAbs % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(within / 60);
  const mm = within % 60;

  return { text: `${pad2(hh)}:${pad2(mm)}`, isNextDay: dayIndex >= 1 };
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

// 06:00 ~ 다음날 08:00 타임라인에 맞게 이벤트 시간을 정규화 06:00 이전(00~05)은 "다음날"로 밀어줌(+1440) end <= start 인 경우(야간) end += 1440

function normalizeEventToRange(ev, startMin, endMin) {
  let s = timeToMinutes(ev.startTime);
  let e = timeToMinutes(ev.endTime);

  if (s < startMin) s += 24 * 60;
  if (e < startMin) e += 24 * 60;
  if (e <= s) e += 24 * 60;

  const total = endMin - startMin;
  const sOff = clamp(s - startMin, 0, total);
  const eOff = clamp(e - startMin, 0, total);

  return { sOff, eOff };
}

// 겹치는 이벤트는 lane(줄)을 늘려서 얇은 바들이 서로 안 겹치게 쌓기

function assignLanes(items) {
  const sorted = [...items].sort((a, b) => a.sOff - b.sOff);
  const laneEnds = []; // 각 lane의 마지막 끝(분 오프셋)

  for (const it of sorted) {
    let lane = -1;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] <= it.sOff) {
        lane = i;
        break;
      }
    }
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(it.eOff);
    } else {
      laneEnds[lane] = it.eOff;
    }
    it.lane = lane;
  }

  return { items: sorted, laneCount: Math.max(1, laneEnds.length) };
}

export default function DayView({ dateKey, events = [], onSelectEvent }) {
  //  06:00 ~ 다음날 08:00
  const startMin = 6 * 60;
  const endMin = 32 * 60; // 24:00 + 8:00
  const total = endMin - startMin; // 1560분

  //  가로 스케일 (원하는 “압축/확대”는 여기만 조절하면 됨)
  const PX_PER_MIN = 1.35; // 1.0~2.0 사이에서 취향 조절
  const W = Math.round(total * PX_PER_MIN);

  //  얇은 바(상자)
  const BAR_H = 30;
  const BAR_GAP = 8;

  // 상단 축 영역 높이
  const AXIS_H = 28;
  const PAD_Y = 10;

  // Shift 구간(절대분)
  const dayShiftStart = 7 * 60; // 07:00
  const dayShiftEnd = 21 * 60; // 21:00

  const nightShiftStart = 21 * 60; // 21:00
  const nightShiftEnd = (24 + 7) * 60; // 다음날 07:00 (=31:00)

  // shift 영역을 타임라인 오프셋(px)로
  const dayLeft = ((dayShiftStart - startMin) / total) * W;
  const dayWidth = ((dayShiftEnd - dayShiftStart) / total) * W;

  const nightLeft = ((nightShiftStart - startMin) / total) * W;
  const nightWidth = ((nightShiftEnd - nightShiftStart) / total) * W;

  // 1시간 라벨(06:00 ~ 32:00)
  const hourMarks = Array.from(
    { length: Math.floor(total / 60) + 1 },
    (_, i) => startMin + i * 60,
  );

  // 이벤트 정규화 + lane 배치
  const normalized = events.map((ev) => {
    const { sOff, eOff } = normalizeEventToRange(ev, startMin, endMin);
    return { ev, sOff, eOff };
  });

  const { items: laidOut, laneCount } = assignLanes(normalized);
  const lanesH = laneCount * BAR_H + (laneCount - 1) * BAR_GAP;
  const H = AXIS_H + PAD_Y * 2 + lanesH;

  return (
    <Card className="rounded-2xl shadow-sm border-slate-200/80 h-full">
      <CardHeader className="pb-3 px-5 pt-5">
        <CardTitle className="text-base font-bold text-slate-800">
          Day — {dateKey}
        </CardTitle>

        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            Day Shift (07:00~21:00)
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700">
            <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
            Night Shift (21:00~07:00)
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-5 pb-5">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/*  가로 스크롤 */}
          <div className="overflow-x-auto">
            <div className="relative" style={{ width: W, height: H }}>
              {/* Shift background */}
              <div
                className="absolute top-0 bottom-0 bg-amber-50/45"
                style={{ left: dayLeft, width: dayWidth }}
              />
              <div
                className="absolute top-0 bottom-0 bg-blue-50/45"
                style={{ left: nightLeft, width: nightWidth }}
              />

              {/* 상단 축 배경(살짝 분리) */}
              <div className="absolute left-0 right-0 top-0 h-[28px] bg-white/70 backdrop-blur border-b border-slate-100" />

              {/* 시간 라벨 + 세로 라인 (1시간 간격) */}
              {hourMarks.map((mAbs) => {
                const x = ((mAbs - startMin) / total) * W;
                const { text, isNextDay } = hourLabelAbs(mAbs);
                const isStart = mAbs === startMin;
                const isEnd = mAbs === endMin;
                const isMidnight = mAbs === 24 * 60;

                return (
                  <div
                    key={mAbs}
                    className="absolute top-0"
                    style={{ left: x }}
                  >
                    {/* vertical line */}
                    <div
                      className={[
                        "absolute top-0",
                        isMidnight
                          ? "border-l border-slate-200"
                          : "border-l border-slate-100",
                      ].join(" ")}
                      style={{ height: H }}
                    />

                    {/* label */}
                    <div
                      className="absolute top-[6px] text-[11px] text-slate-400 font-semibold whitespace-nowrap"
                      style={{
                        transform: isStart
                          ? "translateX(0)"
                          : isEnd
                            ? "translateX(-100%)"
                            : "translateX(-50%)",
                      }}
                    >
                      <span className="inline-flex items-baseline gap-1">
                        <span>{text}</span>
                        {isNextDay ? (
                          <span className="text-[10px] text-slate-300 font-bold">
                            +1
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* 24:00 경계 강조 라인 (한 번 더 또렷하게) */}
              <div
                className="absolute top-0 bottom-0 border-l-2 border-slate-200"
                style={{ left: ((24 * 60 - startMin) / total) * W }}
              />

              {/* Shift 라벨 */}
              <div
                className="absolute top-[34px] left-2 text-[9px] font-bold text-amber-400 uppercase tracking-wider"
                style={{ pointerEvents: "none" }}
              >
                ☀ Day Shift
              </div>
              <div
                className="absolute top-[34px] left-2 text-[9px] font-bold text-blue-400 uppercase tracking-wider"
                style={{
                  left: Math.max(8, nightLeft + 8),
                  pointerEvents: "none",
                }}
              >
                ☾ Night Shift
              </div>

              {/* 이벤트 레인 영역 */}
              <div
                className="absolute left-0 right-0"
                style={{ top: AXIS_H + PAD_Y }}
              >
                {laidOut.map(({ ev, sOff, eOff, lane }) => {
                  const left = (sOff / total) * W;
                  const width = Math.max(36, ((eOff - sOff) / total) * W);
                  const top = lane * (BAR_H + BAR_GAP);

                  const cls = tone[ev.color] || tone.blue;

                  return (
                    <button
                      key={ev.id}
                      onClick={() => onSelectEvent?.(ev)}
                      className={[
                        "absolute rounded-md border px-2 text-left",
                        "transition-shadow hover:shadow-md",
                        cls,
                      ].join(" ")}
                      style={{ left, width, top, height: BAR_H }}
                      title={`${ev.title} (${ev.startTime} - ${ev.endTime})`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-bold truncate">
                          {ev.title}
                        </span>
                        <span className="text-[10px] opacity-70 shrink-0">
                          {ev.startTime}-{ev.endTime}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {!events.length ? (
                  <div className="absolute left-0 right-0 top-6 text-sm text-slate-400 text-center">
                    No events for {dateKey}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
