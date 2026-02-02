import BoardEditor from "@/components/ui/editor";
import { Button } from "@/components/ui/button";
import { ListIcon, Save, FileInput } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { createNotice } from "@/api/notice-api"; // ✅ 공지 작성 API
import { useToken } from "@/stores/account-store";
import { useAuthGuard } from "@/hooks/use-authGuard";

export default function NoticeCreatePage() {
  useAuthGuard();

  const router = useRouter();
  const token = useToken((state) => state.token);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const goToList = () => {
    router.push("/notice/announcements");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content || content.replace(/<[^>]*>/g, "").trim() === "") {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (files.length > 0) {
        files.forEach((file) => {
          if (file instanceof File) {
            formData.append("files", file);
          }
        });
      }

      await createNotice(token, formData);

      alert("공지사항이 등록되었습니다.");
      router.push("/notice/announcements");
    } catch (err) {
      console.error("공지 등록 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <p className="text-2xl font-semibold mb-6">공지사항 작성</p>

      <div className="space-y-4 bg-white border rounded-lg p-6 shadow-sm">
        {/* 상단 영역 */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToList}
            className="flex items-center gap-2"
          >
            <ListIcon size={16} />
            목록으로
          </Button>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || []);
              setFiles(selectedFiles);
            }}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center py-5 gap-2 bg-indigo-900 hover:bg-indigo-600 text-white"
          >
            첨부파일
            <FileInput size={16} />
          </Button>
        </div>

        {/* 제목 */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="공지 제목을 입력하세요"
          className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* 에디터 */}
        <BoardEditor value={content} onChange={setContent} />

        {/* 파일 목록 */}
        {files.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <ul className="space-y-1 text-sm">
              {files.map((file, i) => (
                <li key={i} className="text-blue-600 italic">
                  📎 {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={goToList}>
            취소
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
