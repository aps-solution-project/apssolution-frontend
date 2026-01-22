//로그인 api

export const loginUser = async (accountId, pw) => {
  return fetch("http://192.168.0.14:8080/api/accounts/login", {
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
