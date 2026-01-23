//파일 업로드 api
export async function upLoadFiles(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://192.168.0.17:8080/api/tasks/xls/parse", {
    method: "POST",
    headers: {
      Token: token,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error");
  }

  return response.json();
}
