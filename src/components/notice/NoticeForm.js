import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Editor from "@/components/ui/editor";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { FileInput } from "lucide-react";
import { useAuthGuard } from "@/hooks/use-authGuard";

export default function NoticeForm({
  title,
  setTitle,
  content,
  setContent,
  onSubmit,
  submitText,
  files,
  setFiles,
  onCancel,
}) {
  useAuthGuard();
  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    // 버튼을 클릭하면 숨겨진 input을 클릭함
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <CardTitle>공지 작성</CardTitle>
          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files);
                setFiles(selectedFiles);
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFileButtonClick}
              className="bg-indigo-900 hover:bg-indigo-500 text-white cursor-pointer"
            >
              첨부파일
              <FileInput className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        {files && files.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              선택된 파일 ({files.length}개):
            </p>
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-blue-600 italic"
                >
                  <span className="mr-2">📎</span>
                  {/* 이름 표시: 새 파일(name) 혹은 기존 파일(fileName) */}
                  {file.name || file.fileName}

                  {/* 용량 표시: 값이 있을 때만 계산하고, 없으면 표시하지 않음 */}
                  {file.size ? (
                    <span className="ml-2 text-xs text-gray-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  ) : file.fileSize ? ( // 백엔드에서 fileSize를 준다면 활용
                    <span className="ml-2 text-xs text-gray-400">
                      ({(file.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="공지 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div
          className="min-h-[400px] border rounded-md focus-within:ring-1 focus-within:ring-slate-400 cursor-text"
          onClick={() => {
            // 에디터의 빈 공간을 눌러도 포커싱이 되도록 강제 클릭 이벤트 (선택 사항)
            const editorInput =
              document.querySelector(".ql-editor") ||
              document.querySelector('[contenteditable="true"]');
            if (editorInput) editorInput.focus();
          }}
        >
          <Editor value={content} onChange={setContent} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-500 shadow-sm"
            onClick={onSubmit}
          >
            {submitText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
