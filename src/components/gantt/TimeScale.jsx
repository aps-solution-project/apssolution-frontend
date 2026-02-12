export default function TimeScale({
  minuteWidth,
  totalMinutes = 24 * 60,
  minorStep = 5,
  scenarioStart,
  dayOffset = 0,
}) {
  const width = Math.max(1, totalMinutes * minuteWidth);
  const dayStartMinutes = dayOffset;

  // ── 실제 시각 기준으로 첫 번째 정렬 오프셋 계산 ──
  // 보조 눈금: 실제 시각이 minorStep(5분)의 배수인 지점부터 시작
  // 레이블 눈금: 실제 시각이 30분의 배수인 지점부터 시작
  let firstMinorOffset = 0;
  let firstLabelOffset = 0;

  if (scenarioStart) {
    const startDate = new Date(scenarioStart);
    const dayStartDate = new Date(
      startDate.getTime() + dayStartMinutes * 60000,
    );
    const startMins = dayStartDate.getMinutes();

    // 다음 minorStep 배수까지의 오프셋
    const minorRemainder = startMins % minorStep;
    firstMinorOffset = minorRemainder === 0 ? 0 : minorStep - minorRemainder;

    // 다음 30분 배수까지의 오프셋
    const labelRemainder = startMins % 30;
    firstLabelOffset = labelRemainder === 0 ? 0 : 30 - labelRemainder;
  }

  // ── 레이블 위치 Set (보조 눈금에서 제외용) ──
  const labelPositions = new Set();
  for (let m = firstLabelOffset; m <= totalMinutes; m += 30) {
    labelPositions.add(m);
  }

  // ── 보조 눈금 (실제 시각의 minorStep 배수 기준, 레이블 위치 제외) ──
  const minorTicks = [];
  for (let m = firstMinorOffset; m <= totalMinutes; m += minorStep) {
    if (!labelPositions.has(m)) {
      minorTicks.push(m);
    }
  }

  // ── 레이블 틱 (:00, :30) ──
  const labelTicks = [];
  if (scenarioStart) {
    const startDate = new Date(scenarioStart);
    for (let m = firstLabelOffset; m <= totalMinutes; m += 30) {
      const actualMin = dayStartMinutes + m;
      const d = new Date(startDate.getTime() + actualMin * 60000);
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const isHour = d.getMinutes() === 0;
      labelTicks.push({ m, label: `${hh}:${mi}`, isHour });
    }
  } else {
    for (let m = firstLabelOffset; m <= totalMinutes; m += 30) {
      const totalMins = dayStartMinutes + m;
      const hh = String(Math.floor(totalMins / 60)).padStart(2, "0");
      const mi = String(totalMins % 60).padStart(2, "0");
      const isHour = m % 60 === 0;
      labelTicks.push({ m, label: `${hh}:${mi}`, isHour });
    }
  }

  return (
    <div
      className="relative bg-white select-none"
      style={{ width, height: 44 }}
    >
      <div className="absolute left-0 right-0 top-6 h-px bg-slate-200" />

      {/* 보조 눈금 (짧은 선만) */}
      {minorTicks.map((m) => {
        const left = m * minuteWidth;
        return (
          <div
            key={`minor-${m}`}
            className="absolute top-0"
            style={{ left, width: 0, height: 44 }}
          >
            <div
              className="absolute top-6 w-px bg-slate-300"
              style={{ height: 6 }}
            />
          </div>
        );
      })}

      {/* 주요 레이블 틱 (:00, :30) */}
      {labelTicks.map(({ m, label, isHour }) => {
        const left = m * minuteWidth;
        const h = isHour ? 14 : 10;
        const color = isHour ? "bg-slate-400" : "bg-slate-300";

        return (
          <div
            key={`label-${m}`}
            className="absolute top-0"
            style={{ left, width: 0, height: 44 }}
          >
            <div
              className="absolute top-1 text-[11px] font-medium text-slate-600 whitespace-nowrap"
              style={{ transform: "translateX(-50%)" }}
            >
              {label}
            </div>
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
