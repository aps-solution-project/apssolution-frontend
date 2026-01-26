const URL = "http://192.168.0.17:8080";

// 작업 공정 전체 조회
export const getAllTasks = async (token) => {
  return fetch(`${URL}/api/tasks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("작업 목록 조회에 실패했습니다.");
    }
    return response.json();
  });
};

// 작업 공정 상세 조회
export const getTaskDetail = async (taskId, token) => {
  return fetch(`${URL}/api/tasks/${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (response.status === 404) {
      throw new Error("존재하지 않는 작업 공정입니다.");
    }
    if (!response.ok) {
      throw new Error("작업 상세 정보 조회에 실패했습니다.");
    }
    return response.json();
  });
};

// 작업 공정 벌크 업서트
export const upsertTasks = async (tasksData, token) => {
  return fetch(`${URL}/api/tasks`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tasksData),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("데이터 형식이 올바르지 않습니다.");
    }
    if (response.status === 404) {
      throw new Error("품목 또는 카테고리 정보가 존재하지 않습니다.");
    }
    if (!response.ok) {
      throw new Error("작업 동기화에 실패했습니다.");
    }
    return response.json();
  });
};

// 작업 엑셀 파일 파싱
export const parseTaskXls = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file); // @ModelAttribute ParseXlsRequest 내부의 file 필드명과 일치해야 함

  return fetch(`${URL}/api/tasks/xls/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("엑셀 형식이 올바르지 않거나 파일을 읽을 수 없습니다.");
    }
    if (response.status === 404) {
      throw new Error("엑셀 내부에 존재하지 않는 품목/카테고리 정보가 있습니다.");
    }
    if (!response.ok) {
      throw new Error("엑셀 파싱 중 오류가 발생했습니다.");
    }
    return response.json();
  });
};