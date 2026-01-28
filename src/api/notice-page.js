const URL = "http://192.168.0.20:8080";

async function createNotice(token, data) {
  const resp = await fetch(`${URL}/api/notices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    throw new Error("공지사항 생성에 실패했습니다.");
  }
  return resp.json();
}

async function getNotices(token) {
  const resp = await fetch(`${URL}/api/notices`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("공지사항 조회에 실패했습니다.");
  }
  return resp.json();
}

async function editNotice(token, noticeId, data) {
  const resp = await fetch(`${URL}/api/notices/${noticeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    throw new Error("공지사항 수정에 실패했습니다.");
  }
  return resp.json();
}

async function deleteNotice(token, noticeId) {
  const resp = await fetch(`${URL}/api/notices/${noticeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("공지사항 삭제에 실패했습니다.");
  }
}

async function getNotice(token, noticeId) {
  const resp = await fetch(`${URL}/api/notices/${noticeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("공지사항 조회에 실패했습니다.");
  }
  return resp.json();
}

async function searchNotice(token, keyword, scenarioId) {
  const resp = await fetch(
    `${URL}/api/notices/search?keyword=${keyword}&scenarioId=${scenarioId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("공지사항 검색에 실패했습니다.");
  }
  return resp.json();
}

async function getMyNotice(token) {
  const resp = await fetch(`${URL}/api/notices/myNotice`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("내가 쓴 공지사항 조회에 실패했습니다.");
  }
  return resp.json();
}

export {
  createNotice,
  deleteNotice,
  editNotice,
  getMyNotice,
  getNotice,
  getNotices,
  searchNotice,
};
