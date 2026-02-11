const URL = "http://192.168.0.20:8080";

// 월별 개인 일정 조회
// export const getMonthlyCalendars = async (token, month) => {
//   const resp = await fetch(`${URL}/api/calendars?month=${month}`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!resp.ok) throw new Error(`캘린더 조회 실패 (${resp.status})`);
//   return resp.json();
// };

// export const getMonthlyCalendars = async (token, month) => {
//   const resp = await fetch(`${URL}/api/calendars?month=${month}`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   if (!resp.ok) throw new Error(`캘린더 조회 실패 (${resp.status})`);
//   return resp.json();
// };

export const getMonthlyCalendars = async (token, month) => {
  // 1. 혹시라도 month에 "2026-02" 같은 문자열이 들어올 경우를 대비한 안전장치
  let finalMonth = month;
  if (typeof month === 'string' && month.includes('-')) {
    finalMonth = parseInt(month.split('-')[1], 10);
  }

  // 2. URL 생성 시 finalMonth(숫자)가 정확히 들어가는지 확인
  // ⚠️ 주의: 여기서 `${URL}/api/calendars?month=2026-02` 처럼 고정되어 있는지 꼭 확인하세요!
  const response = await fetch(`${URL}/api/calendars?month=${finalMonth}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`캘린더 조회 실패 (${response.status})`);
  }

  return response.json();
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
