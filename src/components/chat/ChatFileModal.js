import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Download, FilePlus } from "lucide-react";

export default function ChatFileModal({
  isOpen,
  onClose,
  messages,
  onDownload,
}) {
  // 메시지 중 이미지가 아닌 일반 파일만 추출
  const chatFiles = messages
    .filter((m) => m.type === "FILE")
    .flatMap((m) => m.attachments || [])
    .filter((a) => !/\.(jpg|jpeg|png|gif|webp)$/i.test(a.fileName));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[70vh] flex flex-col bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-blue-600" />
            파일 모아보기 ({chatFiles.length})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatFiles.length > 0 ? (
            chatFiles.map((file, idx) => (
              <div
                key={file.id || idx}
                onClick={() => onDownload(file)}
                className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100">
                    <FilePlus className="size-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate w-[300px] text-slate-800">
                      {file.fileName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      파일 다운로드
                    </span>
                  </div>
                </div>
                <Download className="size-4 text-slate-400 group-hover:text-blue-600" />
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-400">
              공유된 파일이 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
