import { getNotice, editNotice } from "@/api/notice-page";
import NoticeForm from "@/components/notice/NoticeForm";
import { useToken } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CommunityEditPage() {
  const router = useRouter();
  const { noticeId } = router.query;
  const token = useToken((state) => state.token);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    if (!router.isReady || !noticeId || noticeId === "undefined" || !token)
      return;

    getNotice(token, noticeId)
      .then((notice) => {
        if (notice) {
          setTitle(notice.title || "");
          setContent(notice.content || "");
          setFiles(notice.attachments || []);
        }
      })
      .catch((e) => {
        console.error("데이터 로드 에러:", e);
        alert("공지사항을 불러오지 못했습니다.");
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
      if (files && files.length > 0) {
        files.forEach((file) => {
          if (file instanceof File) {
            formData.append("attachments", file);
          }
        });
      }

      const res = await editNotice(token, noticeId, formData);

      if (res) {
        alert("공지사항이 수정되었습니다.");
        router.push(`/notice/${noticeId}`);
      }
    } catch (err) {
      console.error("수정 API 에러:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  }; // 👈 handleSave 끝

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">공지사항 수정</h1>

      <NoticeForm
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        files={files}
        setFiles={setFiles}
        onSubmit={handleSave}
        submitText="수정"
        onCancel={() => router.back()}
      />
    </div>
  );
} // 👈 NoticeEditPage 끝
