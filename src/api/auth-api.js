//로그인 api
export const loginUser = async (id, pw) => {
  return fetch("http://192.168.0.56:8080" + "/login", {
    method: "POST",
    headers: defaultHeader,
    body: JSON.stringify({ id, pw }),
  }).then((response) => {
    if (!response.ok) throw new Error("사원번호와 비밀번호를 확인해주세요.");
    return response.json();
  });
};
