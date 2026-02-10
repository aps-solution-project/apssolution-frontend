const KEY = "calendar_events_v1";

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

// YYYY-MM-DD 범위 필터
export function filterEventsInRange(events, startKey, endKey) {
  return events.filter((e) => e.date >= startKey && e.date <= endKey);
}
