const URL = "http://192.168.0.20:8080";

/**
 * 1. 내가 속한 채팅방 목록 가져오기
 */
export async function getMyChats(token) {
  const resp = await fetch(`${URL}/api/chats`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("채팅 목록 로드 실패");
  return resp.json();
}

/**
 * 2. 채팅방 상세 정보 및 메시지 내역 가져오기
 */
export async function getChatDetail(token, chatId) {
  const resp = await fetch(`${URL}/api/chats/${chatId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const error = new Error("채팅방 정보를 가져올 수 없습니다.");
    error.status = resp.status;
    throw error;
  }
  return resp.json();
}

/**
 * 3. 메시지 전송 (텍스트 & 파일 통합)
 * { type: "TEXT"|"FILE", content: "내용", files: File[] }
 */
export async function sendMessage(token, chatId, body) {
  const formData = new FormData();
  // 1. 기본 필드 추가
  formData.append("type", body.type);
  if (body.content) formData.append("content", body.content);

  // 2. 파일 리스트 추가
  if (body.files) {
    body.files.forEach((file) => formData.append("files", file));
  }

  const res = await fetch(`${URL}/api/chats/${chatId}/message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // Content-Type은 명시하지 않음
    },
    body: formData,
  });

  if (!res.ok) throw new Error("메시지 전송 실패");
  return await res.json();
}

/**
 * 4. 1:1 채팅방 생성 또는 기존 방 조회
 */
export async function startDirectChat(token, targetId) {
  const resp = await fetch(`${URL}/api/chats/direct/${targetId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("채팅방 생성 실패");
  return resp.json();
}

/**
 * 5. 그룹 채팅방 생성
 * { roomName: "방이름", members: ["id1", "id2"] }
 */
export async function createGroupChat(token, data) {
  const resp = await fetch(`${URL}/api/chats`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error("그룹 채팅방 생성 실패");
  return resp.json();
}

export async function leaveChat(token, chatId) {
  const resp = await fetch(`${URL}/api/chats/${chatId}/leave`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) throw new Error("채팅방 나가기 실패");
  return resp;
}

export async function getUnreadCount(token) {
  const resp = await fetch(`${URL}/api/chats/unread-count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) throw new Error("안 읽은 메시지 개수 조회 실패");
  return resp.json();
}
