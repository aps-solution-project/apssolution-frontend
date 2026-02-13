import { createWorkerPost } from "@/api/community-api";
import CommunityForm from "@/components/community/community-form"; // 새 컴포넌트 임포트
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function PostsCreatePage() {
  useAuthGuard();
  const router = useRouter();
  const loginAccount = useAccount((state) => state.account);
  const { token } = useToken();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  if (loginAccount?.role === "ADMIN" || loginAccount?.role === "PLANNER") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <X className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">접근 권한 제한</h2>
        <p className="text-slate-500 font-medium text-center">
          사원게시판 페이지는 사원(WORKER) 전용 구역입니다.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-xl"
        >
          메인으로 돌아가기
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    // 디버깅: 전송 직전 값 확인

    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    files.forEach((file) => formData.append("attachments", file));

    try {
      await createWorkerPost(token, formData);
      alert("게시글이 생성되었습니다.");
      router.push("/community/list"); // 경로 명확히 지정
    } catch (e) {
      alert("생성 실패: " + e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <CommunityForm
        title={title}
        setTitle={setTitle}
        content={content}
        setContent={setContent}
        files={files}
        setFiles={setFiles}
        onSubmit={handleSave}
        submitText="저장"
        onCancel={() => router.push("/community/list")}
      />
    </div>
  );
}
