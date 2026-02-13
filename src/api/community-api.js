// 1. 사원 게시판 목록 조회 (백엔드에서 role=worker 필터를 지원한다고 가정)
export async function getWorkerPosts(token) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices/community`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (resp.status === 403) {
    // 에러 객체에 상태 코드를 심어서 던짐
    const error = new Error("접근 권한이 없습니다.");
    error.status = 403;
    throw error;
  }

  if (!resp.ok) throw new Error("사원 게시판 조회 실패");
  return resp.json();
}

// 2. 게시글 상세 조회 (공용 사용)
export async function getPostDetail(token, noticeId) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices/${noticeId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!resp.ok) throw new Error("게시글 조회 실패");
  return resp.json();
}

// 3. 사원 게시글 생성 (파일 포함)
export async function createWorkerPost(token, formData) {
  // FormData를 보낼 때는 Content-Type을 직접 설정하지 않아야 브라우저가 boundary를 잡습니다.
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // title, content, files 등이 담긴 FormData
    },
  );
  if (!resp.ok) throw new Error("게시글 등록 실패");
  return resp.json();
}

// 4. 게시글 수정 (PATCH)
export async function editWorkerPost(token, noticeId, formData) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices/${noticeId}`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    },
  );
  if (!resp.ok) throw new Error("게시글 수정 실패");
  return resp.json();
}

// 5. 게시글 삭제
export async function deleteWorkerPost(token, noticeId) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices/${noticeId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!resp.ok) throw new Error("게시글 삭제 실패");
}

// 댓글 목록 조회
export async function getComments(token, noticeId) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices/${noticeId}/comments`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!resp.ok) throw new Error("댓글 로드 실패");
  return resp.json();
}

// 댓글 & 대댓글 작성 (parentCommentId가 있으면 대댓글)
export async function createComment(
  token,
  noticeId,
  content,
  parentCommentId = null,
) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices/${noticeId}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        commentId: parentCommentId, // 부모 ID가 있으면 대댓글, 없으면 일반 댓글
      }),
    },
  );
  if (!resp.ok) throw new Error("댓글 작성 실패");
  return resp.json();
}

// 댓글 삭제
export async function deleteComment(token, noticeId, commentId) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices/${noticeId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!resp.ok) throw new Error("댓글 삭제 실패");
  return true;
}
