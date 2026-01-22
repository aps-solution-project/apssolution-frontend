//로그인 api

//const addr = "http://192.168.0.14:8080"
export const loginUser = async (id, pw) => {
  return fetch("http://192.168.0.14:8080" + "/api/accounts/login", {
    method: "POST",
    headers: defaultHeader,
    body: JSON.stringify({ id, pw }),
  }).then((response) => {
    if (!response.ok) throw new Error("사원번호와 비밀번호를 확인해주세요.");
    return response.json();
  });
};
