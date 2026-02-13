
// 도구 카테고리 생성
export async function createToolCategory(data, token) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/api/tools/category`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      categoryId: data.categoryId,
      name: data.name,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409)
      throw new Error("이미 존재하는 카테고리입니다.");
    throw new Error(error.message || "카테고리 생성에 실패했습니다.");
  }

  return response.json();
}
// 도구 벌크 업서트
export async function upsertTools(data, token) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/api/tools`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  // 에러 발생 시 (400, 404 등)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "동기화 실패");
  }

  // 백엔드가 UpsertToolResponse를 주므로 그대로 반환
  return response.json();
}
// 도구 엑셀 파싱
export async function parseToolXls(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/api/tools/xls/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "엑셀 파일 파싱에 실패했습니다.");
  }

  return response.json();
}

// 도구 카테고리 전체 조회
export async function getToolCategories(token) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/api/tools/category`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "카테고리 목록 조회에 실패했습니다.");
  }

  return response.json();
}

// 도구 전체 조회
export async function getAllTools(token) {
  if (!token || /[^\x00-\x7F]/.test(token)) {
    console.error("유효하지 않은 토큰입니다.");
    throw new Error("인증 정보에 문제가 있습니다. 다시 로그인해주세요.");
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/api/tools`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "도구 목록을 불러오는 데 실패했습니다.");
  }

  return response.json();
}

// 도구 상세 조회
export async function getToolDetail(toolId, token) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/api/tools/${toolId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404) throw new Error("존재하지 않는 도구입니다.");
    throw new Error(error.message || "도구 상세 조회에 실패했습니다.");
  }

  return response.json();
}

// 도구 카테고리 삭제
export async function deleteToolCategory(categoryId, token) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/api/tools/category/${categoryId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 204) {
    return { success: true };
  }

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 404)
      throw new Error("존재하지 않는 카테고리입니다.");
    if (response.status === 409)
      throw new Error("카테고리에 도구가 있어 삭제할 수 없습니다.");
    throw new Error(error.message || "카테고리 삭제 실패");
  }

  return response.json();
}
