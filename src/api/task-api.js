const serverAddr = "http://192.168.0.17:8080";

async function upsertTasks(token, tasks) {
  const resp = await fetch(`${serverAddr}/api/tasks`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tasks: tasks, // 👈 이게 핵심
    }),
  });

  if (!resp.ok) {
    throw new Error("작업 등록에 실패했습니다.");
  }
  return resp.json();
}

async function getTasks(token) {
  const resp = await fetch(`${serverAddr}/api/tasks`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("작업 조회에 실패했습니다.");
  }
  return resp.json();
}

async function getTask(token, taskId) {
  const resp = await fetch(`${serverAddr}/api/tasks/${taskId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("작업 조회에 실패했습니다.");
  }
  return resp.json();
}

async function parseTaskXls(token, data) {
  const formData = new FormData();
  formData.append("file", data);
  const resp = await fetch(`${serverAddr}/api/tasks/xls/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!resp.ok) {
    throw new Error("엑셀 파싱에 실패했습니다.");
  }
  return resp.json();
}

export { getTasks, parseTaskXls, upsertTasks, getTask };
