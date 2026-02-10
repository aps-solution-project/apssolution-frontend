export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function keyOf(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatMonthTitle(d) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function formatDayTitle(d) {
  return d.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export function addDays(d, delta) {
  const x = new Date(d);
  x.setDate(x.getDate() + delta);
  return x;
}

export function addMonths(d, delta) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + delta);
  return x;
}

// Sunday start
export function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay(); // 0..6
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

export function getWeekDays(d) {
  const s = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(s, i));
}

// month matrix
export function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const start = new Date(first);
  while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

  const end = new Date(last);
  while (end.getDay() !== 6) end.setDate(end.getDate() + 1);

  const days = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export function timeToMinutes(t) {
  // "HH:MM"
  if (!t) return 0;
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
