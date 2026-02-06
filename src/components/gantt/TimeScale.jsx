export default function TimeScale({
  minuteWidth,
  totalMinutes = 24 * 60,
  minorStep = 5,
}) {
  const width = Math.max(1, totalMinutes * minuteWidth);

  const ticks = [];
  for (let m = 0; m <= totalMinutes; m += minorStep) {
    const isHour = m % 60 === 0;
    const isHalf = m % 30 === 0;

    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mi = String(m % 60).padStart(2, "0");
    const label = `${hh}:${mi}`;

    ticks.push({ m, isHour, isHalf, label });
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
