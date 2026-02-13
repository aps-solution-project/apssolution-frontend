const URL = "http://192.168.0.20:8080";

//로그인
export const loginUser = async (accountId, pw) => {
  return fetch(`${URL}/api/accounts/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accountId, pw }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("사원번호와 비밀번호를 확인해주세요.");
    }
    return response.json();
  });
};

//사원 추가
export const createAccount = async (data, token) => {
  return fetch(`${URL}/api/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("사원 추가에 실패했습니다.");
    }
    return response.json();
  });
};

//직원 정보 수정 (ADMIN)
export const updateEmployeeAccount = async (accountId, data, token) => {
  const response = await fetch(`${URL}/api/accounts/${accountId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("직원 정보 수정 실패");
  }

  return response.text();
};

// 본인 정보 수정
export const updateMyAccount = async (accountId, formData, token) => {
  const response = await fetch(`${URL}/api/accounts/${accountId}/edit`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg || "내 정보 수정에 실패했습니다.");
  }

  return response.json();
};

// 비밀번호 변경
export const changeMyPassword = async (accountId, data, token) => {
  console.log(accountId);
  console.log(data);
  const response = await fetch(`${URL}/api/accounts/${accountId}/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("비밀번호 변경에 실패했습니다.!!!");
  }
  return response.json();
};

//사원 퇴사 처리
export const deleteAccount = async (accountId, token) => {
  return fetch(`${URL}/api/accounts/${accountId}/resign`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("퇴사 처리에 실패했습니다.");
    }
    return response.json();
  });
};

//사원 전체 조회
export const getAllAccounts = async (token) => {
  return fetch(`${URL}/api/accounts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("사원 목록 조회에 실패했습니다.");
    }
    return response.json();
  });
};

// 재직중인 사원 조회
export async function getActiveAccounts(token) {
  const resp = await fetch(`${URL}/api/accounts/active`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("사원 목록을 불러오지 못했습니다.");
  return resp.json();
}

// 사원 상세 조회
export function getAccountDetail(token, accountId) {
  return fetch(`${URL}/api/accounts/${accountId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("사원 상세 조회에 실패했습니다.");
    }
    return response.json();
  });
}
