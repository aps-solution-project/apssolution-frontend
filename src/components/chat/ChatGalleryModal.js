import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Images, ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatGalleryModal({
  isOpen,
  onClose,
  messages,
  onDownload,
}) {
  // 메시지 중 이미지만 추출
  const chatImages = messages
    .filter((m) => m.type === "FILE")
    .flatMap((m) => m.attachments || [])
    .filter((a) => /\.(jpg|jpeg|png|gif|webp)$/i.test(a.fileName));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Images className="size-5 text-indigo-600" />
            사진 모아보기
            <span className="text-sm font-normal text-slate-400 ml-1">
              {chatImages.length}장
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {chatImages.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {chatImages.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border bg-slate-50 shadow-sm transition-all hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2"
                >
                  <img
                    src={`http://192.168.0.20:8080${img.fileUrl}`}
                    alt={img.fileName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {/* 호버 시 다운로드 버튼 표시 */}
                  <div
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    onClick={() => onDownload(img)}
                  >
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-md border border-white/30">
                      <Download className="size-5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <ImageIcon className="size-12 opacity-20" />
              </div>
              <p className="font-medium">공유된 사진이 없습니다.</p>
              <p className="text-xs">
                채팅방에서 주고받은 사진이 여기에 표시됩니다.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
