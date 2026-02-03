import { getPostDetail, editWorkerPost } from "@/api/community-api"; //  사원용 API로 교체
import CommunityForm from "@/components/community/CommunityForm"; //  사원용 폼으로 교체
import { useToken } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/use-authGuard";

export default function CommunityEditPage() {
  useAuthGuard(); // 사원 권한 확인
  const router = useRouter();
  const { noticeId } = router.query;
  const token = useToken((state) => state.token);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  // 1. 기존 사원 게시글 데이터 불러오기
  useEffect(() => {
    if (!router.isReady || !noticeId || noticeId === "undefined" || !token)
      return;

    getPostDetail(token, noticeId)
      .then((post) => {
        if (post) {
          setTitle(post.title || "");
          setContent(post.content || "");
          // 기존 첨부파일 목록 저장
          setFiles(post.attachments || []);
        }
      })
      .catch((e) => {
        console.error("데이터 로드 에러:", e);
        alert("게시글을 불러오지 못했습니다.");
      });
  }, [router.isReady, noticeId, token]);

  // 2. 수정 데이터 전송하기
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      // 신규 파일(File 객체)만 선별해서 추가
      // (기존 파일은 백엔드 로직에 따라 다르지만 보통 새로 추가된 것만 보냅니다)
      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file instanceof File) {
            // 백엔드 파라미터명이 'files'인지 'attachments'인지 확인 필요
            formData.append("files", file);
          }
        });
      }

      //  사원 전용 수정 API 호출
      const res = await editWorkerPost(token, noticeId, formData);

      if (res) {
        alert("게시글이 수정되었습니다.");
        router.push(`/community/${noticeId}`); // 상세 페이지로 이동
      }
    } catch (err) {
      console.error("수정 API 에러:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-10">
      <h1 className="text-2xl font-bold">사원 게시글 수정</h1>

      <CommunityForm
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        files={files}
        setFiles={setFiles}
        onSubmit={handleSave}
        submitText="수정 완료"
        onCancel={() => router.back()}
      />
    </div>
  );
}
