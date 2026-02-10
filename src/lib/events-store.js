import { keyOf, addDays, pad2 } from "@/lib/date";

const KEY = "calendar_events_v2";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const today = new Date();
const todayKey = keyOf(today);

export { uid, today, todayKey, addDays };

export function apiToEvent(item) {
  const startDate = new Date(item.startAt);
  const endDate = new Date(item.endAt);
  const hour = startDate.getHours();
  const isNight = hour >= 21 || hour < 7;

  return {
    id: item.id || uid(),
    title: item.title || "",
    date: keyOf(startDate),
    start: `${pad2(startDate.getHours())}:${pad2(startDate.getMinutes())}`,
    end: `${pad2(endDate.getHours())}:${pad2(endDate.getMinutes())}`,
    location: item.location || "",
    shift: isNight ? "night" : "day",
    color: isNight ? "night" : "amber",
    reminder: item.reminder || "",
    participants: item.worker?.name ? [item.worker.name] : [],
    todos: Array.isArray(item.todos)
      ? item.todos.map((t) => ({
          id: t.id || uid(),
          text: t.text || "",
          done: !!t.done,
        }))
      : [],
  };
}

export function loadEvents() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(events));
}

export function upsertEvent(events, event) {
  const idx = events.findIndex((e) => e.id === event.id);
  if (idx >= 0) {
    const next = [...events];
    next[idx] = event;
    return next;
  }
  return [event, ...events];
}

export function removeEvent(events, id) {
  return events.filter((e) => e.id !== id);
}

export function filterEventsInRange(events, startKey, endKey) {
  return events.filter((e) => e.date >= startKey && e.date <= endKey);
}
