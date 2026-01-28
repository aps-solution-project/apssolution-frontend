import { createNotice } from "@/api/notice-page";
import NoticeForm from "@/components/notice/NoticeForm";
import { useToken } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useState } from "react";

export default function PostsCreatePage() {
  const router = useRouter();
  const { token } = useToken();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // 파일 배열 추가
    files.forEach((file) => {
      formData.append("attachments", file);
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
