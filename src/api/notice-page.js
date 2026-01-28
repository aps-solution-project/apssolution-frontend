const URL = "http://192.168.0.10:8080";

async function createNotice(token, data) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  // formData.append("scenarioId", data.scenarioId);
  // formData.append("attachment", data.attachment);
  const resp = await fetch(`${URL}/api/notices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
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
  // headers 객체를 먼저 생성
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // data가 FormData 객체인지 확인
  const isFormData = data instanceof FormData;

  // FormData가 아닐 때만 JSON 헤더를 추가 (하이브리드 방식)
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const resp = await fetch(`${URL}/api/notices/${noticeId}`, {
    method: "PATCH",
    headers: headers,
    // FormData라면 stringify 하지 않고 그대로 보냄
    body: isFormData ? data : JSON.stringify(data),
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
