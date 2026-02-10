import { keyOf, getMonthMatrix } from "@/lib/date";

export function getMonthRangeKeys(cursorDate) {
  const y = cursorDate.getFullYear();
  const m = cursorDate.getMonth();
  const weeks = getMonthMatrix(y, m);
  const flat = weeks.flat();
  const startKey = keyOf(flat[0]);
  const endKey = keyOf(flat[flat.length - 1]);
  return { startKey, endKey };
}

export function getWeekRangeKeys(cursorDate) {
  const d = new Date(cursorDate);
  const day = d.getDay(); // 0 Sun
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startKey: keyOf(start), endKey: keyOf(end) };
}

export function getDayRangeKeys(cursorDate) {
  const k = keyOf(cursorDate);
  return { startKey: k, endKey: k };
}
