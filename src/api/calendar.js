const URL = "http://192.168.0.20:8080";

// 월별 개인 일정 조회
export const getMonthlyCalendars = async (token, month) => {
  const q = month ? `?month=${month}` : "";
  const resp = await fetch(`${URL}/api/calendars${q}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("월별 일정 조회 실패");
  return resp.json();
};

// 개인 일정 생성/수정 (id가 이미 존재하면 수정됨)
export const saveCalendar = async (data, token) => {
  const resp = await fetch(`${URL}/api/calendars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error("일정 저장 실패");
  return resp.json();
};

// 개인 일정 삭제
export const deleteCalendar = async (scheduleId, token) => {
  const resp = await fetch(`${URL}/api/calendars/${scheduleId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("일정 삭제 실패");
  return true;
};
