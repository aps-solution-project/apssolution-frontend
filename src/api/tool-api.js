const URL = "http://192.168.0.17:8080";

// 도구 카테고리 생성
export const createToolCategory = async (data, token) => {
  return fetch(`${URL}/api/tools/category`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      categoryId: data.categoryId,
      name: data.name,
    }),
  }).then((response) => {
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("이미 존재하는 카테고리입니다.");
      }
      throw new Error("카테고리 생성에 실패했습니다.");
    }
    return response.json();
  });
};

// 도구 벌크 업서트
export const upsertTools = async (toolsData, token) => {
  return fetch(`${URL}/api/tools`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(toolsData),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("요청 데이터 형식이 올바르지 않습니다.");
    }
    if (response.status === 404) {
      throw new Error("존재하지 않는 카테고리가 포함되어 있습니다.");
    }
    if (!response.ok) {
      throw new Error("도구 동기화에 실패했습니다.");
    }
    return response.json();
  });
};

// 도구 엑셀 파싱
export const parseToolXls = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${URL}/api/tools/xls/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  }).then((response) => {
    if (!response.ok) {
      throw new Error("엑셀 파일 파싱에 실패했습니다.");
    }
    return response.json();
  });
};

// 도구 카테고리 삭제
export const deleteToolCategory = async (categoryId, token) => {
  const res = await fetch(`${URL}/api/tools/category/${categoryId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    throw new Error("존재하지 않는 카테고리입니다.");
  }

  if (res.status === 409) {
    throw new Error("카테고리에 도구가 있어 삭제할 수 없습니다.");
  }

  if (!res.ok) {
    throw new Error("카테고리 삭제 실패");
  }
};

// 도구 카테고리 전체 조회
export const getToolCategories = async (token) => {
  return fetch(`${URL}/api/tools/category`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("카테고리 목록 조회에 실패했습니다.");
    }
    return response.json();
  });
};

// 도구 전체 조회
export const getAllTools = async (token) => {
  return fetch(`${URL}/api/tools`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("도구 목록을 불러오는 데 실패했습니다.");
    }
    return response.json();
  });
};

// 도구 상세 조회
export const getToolDetail = async (toolId, token) => {
  return fetch(`${URL}/api/tools/${toolId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (response.status === 404) {
      throw new Error("존재하지 않는 도구입니다.");
    }
    if (!response.ok) {
      throw new Error("도구 상세 조회에 실패했습니다.");
    }
    return response.json();
  });
};
