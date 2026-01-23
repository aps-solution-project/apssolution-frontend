const URL = "http://192.168.0.17:8080";

/* ================= 로그인 ================= */
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

/* ================= 사원 추가 ================= */
/* ❗ Token 없음 (명세 기준) */
export const createAccount = async (data) => {
  return fetch(`${URL}/api/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("사원 추가에 실패했습니다.");
    }
    return response.json();
  });
};

/* ================= 직원 정보 수정 (ADMIN) ================= */
export const updateEmployeeAccount = async (accountId, data, token) => {
  return fetch(`${URL}/api/accounts/${accountId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data), // name, role, email, workedAt
  }).then((response) => {
    if (!response.ok) {
      throw new Error("직원 정보 수정에 실패했습니다.");
    }
    return response.json();
  });
};

/* ================= 본인 정보 수정 ================= */
export const updateMyAccount = async (accountId, data, token) => {
  return fetch(`${URL}/api/accounts/${accountId}/edit`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data), // email, profileImage
  }).then((response) => {
    if (!response.ok) {
      throw new Error("내 정보 수정에 실패했습니다.");
    }
    return response.json();
  });
};

/* ================= 비밀번호 변경 ================= */
export const changeMyPassword = async (accountId, data, token) => {
  return fetch(`${URL}/api/accounts/${accountId}/pw`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data), // oldPw, newPw, newPwConfirm
  }).then((response) => {
    if (!response.ok) {
      throw new Error("비밀번호 변경에 실패했습니다.");
    }
    return response.json();
  });
};

/* ================= 사원 퇴사 처리 ================= */
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

/* ================= 사원 전체 조회 ================= */
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

/* ================= 사원 상세 조회 ================= */
export const getAccountDetail = async (accountId, token) => {
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
};
