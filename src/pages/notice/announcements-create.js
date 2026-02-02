import { createNotice } from "@/api/notice-api";
import NoticeForm from "@/components/notice/NoticeForm";
import { useToken, useAccount } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useState, useEffect } from "react";

export default function AnnouncementsCreatePage() {
  useAuthGuard();
  const router = useRouter();
  const { account, role } = useAccount();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // 1. 하이드레이션(persist 데이터 로드)이 끝날 때까지 대기하거나
    // account 정보가 들어올 때까지 기다립니다.
    if (!account && !role) return;

    // 2. role 값을 직접 확인 (useAccount에서 role을 따로 관리하므로 편리합니다)
    const canCreate = role === "ADMIN" || role === "PLANNER";

    console.log("현재 접속 역할:", role); // 디버깅용

    if (!canCreate) {
      alert("공지사항 작성 권한이 없습니다.");
      router.replace("/notice/announcements");
    }
  }, [account, role, router]);

  // 3. 권한이 없는 사용자는 화면 렌더링 자체를 차단
  if (role !== "ADMIN" && role !== "PLANNER") {
    return null;
  }

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // 파일 배열 추가
    files.forEach((file) => {
      formData.append("attachment", file);
    });

    try {
      // createNotice가 FormData를 받도록 구성되어야 함
      await createNotice(token, formData);
      alert("공지사항이 생성되었습니다.");
      router.push("/notice/announcements");
    } catch (e) {
      alert("생성 실패");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">공지사항 작성</h1>

      <NoticeForm
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        files={files}
        setFiles={setFiles}
        onSubmit={handleSave}
        submitText="저장"
        onCancel={() => router.back()}
      />
    </div>
  );
}
