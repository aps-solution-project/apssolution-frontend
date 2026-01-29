import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Editor from "@/components/ui/editor";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { FileInput } from "lucide-react";

export default function CommunityForm({
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
  const fileInputRef = useRef(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          {/* 제목 고정 */}
          <CardTitle>사원 게시글 작성</CardTitle>
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
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-900 hover:bg-indigo-500 text-white cursor-pointer"
            >
              첨부파일
              <FileInput className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 파일 목록 표시 (기존과 동일) */}
        {files && files.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-blue-600 italic">
                  📎 {file.name || file.fileName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="게시글 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 에디터 값이 정확히 setContent로 들어가도록 설정 */}
        <Editor value={content} onChange={(value) => setContent(value)} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          {/* type="button"으로 설정하여 의도치 않은 서브밋 방지 */}
          <Button type="button" onClick={onSubmit}>
            {submitText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
