import { createWorkerPost } from "@/api/community-api";
import CommunityForm from "@/components/community/CommunityForm"; // 새 컴포넌트 임포트
import { useToken } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/use-authGuard";

export default function PostsCreatePage() {
  useAuthGuard();
  const router = useRouter();
  const { token } = useToken();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const handleSave = async () => {
    // 디버깅: 전송 직전 값 확인
    console.log("전송 데이터:", { title, content });

    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    files.forEach((file) => formData.append("files", file));

    try {
      await createWorkerPost(token, formData);
      alert("게시글이 생성되었습니다.");
      router.push("/community/posts"); // 경로 명확히 지정
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
        onCancel={() => router.push("/community/posts")}
      />
    </div>
  );
}
