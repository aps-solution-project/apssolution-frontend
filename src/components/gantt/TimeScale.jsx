export default function TimeScale({
  minuteWidth,
  totalMinutes = 24 * 60,
  minorStep = 5,
  scenarioStart,
}) {
  const width = Math.max(1, totalMinutes * minuteWidth);

  const ticks = [];

  // scenarioStart의 다음 정각 또는 30분을 찾기
  let firstLabelOffset = 0;
  if (scenarioStart) {
    const startDate = new Date(scenarioStart);
    const minutes = startDate.getMinutes();

    // 다음 30분 단위까지의 분 계산
    if (minutes === 0) {
      firstLabelOffset = 0;
    } else if (minutes <= 30) {
      firstLabelOffset = 30 - minutes;
    } else {
      firstLabelOffset = 60 - minutes;
    }
  }

  for (let m = 0; m <= totalMinutes; m += minorStep) {
    const isHour = m % 60 === 0;
    const isHalf = m % 30 === 0;

    let label;
    if (scenarioStart) {
      const startDate = new Date(scenarioStart);
      const currentDate = new Date(startDate.getTime() + m * 60000);
      const hh = String(currentDate.getHours()).padStart(2, "0");
      const mi = String(currentDate.getMinutes()).padStart(2, "0");
      label = `${hh}:${mi}`;
    } else {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mi = String(m % 60).padStart(2, "0");
      label = `${hh}:${mi}`;
    }

    // 30분 또는 정각일 때만 큰 눈금과 레이블 표시
    const showMainLabel = scenarioStart
      ? m >= firstLabelOffset && (m - firstLabelOffset) % 30 === 0
      : isHalf;

    ticks.push({ m, isHour: showMainLabel, isHalf: showMainLabel, label });
  }

  return (
    <div
      className="relative bg-white select-none"
      style={{ width, height: 44 }}
    >
      <div className="absolute left-0 right-0 top-6 h-px bg-slate-200" />

      {ticks.map(({ m, isHour, isHalf, label }) => {
        const left = m * minuteWidth;
        const h = isHour ? 14 : isHalf ? 10 : 6;
        const color = isHour ? "bg-slate-400" : "bg-slate-300";

        return (
          <div
            key={m}
            className="absolute top-0"
            style={{ left, width: 0, height: 44 }}
          >
            {isHour && (
              <div
                className="absolute top-1 text-[11px] font-medium text-slate-600"
                style={{ transform: "translateX(-50%)" }}
              >
                {label}
              </div>
            )}

            <div
              className={`absolute top-6 w-px ${color}`}
              style={{ height: h }}
            />
          </div>
        );
      })}

      <div className="absolute left-0 right-0 bottom-0 h-px bg-slate-200" />
    </div>
  );
}
