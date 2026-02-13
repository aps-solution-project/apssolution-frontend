import { deleteNotice, getNotice } from "@/api/notice-api";
import { Button } from "@/components/ui/button";
import EditorBlank from "@/components/ui/editorBlank";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { List, SquarePen, Trash2 } from "lucide-react"; // Trash2 아이콘 추가
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AnnouncementDetailPage() {
  useAuthGuard();
  const router = useRouter();
  const { noticeId } = router.query;
  const [notice, setNotice] = useState(null);
  const { token } = useToken();
  const { account } = useAccount();
  const [isWriter, setIsWriter] = useState(false);

  useEffect(() => {
    if (!noticeId || !token) return;
    getNotice(token, noticeId).then((obj) => {
      setNotice(obj);
      if (account?.accountId === obj.writer.id) {
        setIsWriter(true);
      }
    });
  }, [noticeId, token, account]);

  if (!notice) return null;

  function handleDelete(e) {
    e.preventDefault();
    if (!confirm("정말로 공지사항을 삭제하시겠습니까?")) return;
    deleteNotice(token, noticeId).then(() => {
      window.alert("공지사항이 성공적으로 삭제되었습니다.");
      router.push("/notice/list");
    });
  }

  return (
    // 1. bg-white와 min-h-full로 바닥까지 흰색 배경 통일
    <div className="bg-white w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 상단 버튼 영역: 목록보기와 삭제버튼을 양 끝으로 확실히 분리 */}
        <div className="flex justify-between items-center border-b pb-4 border-slate-100">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-800 gap-2 px-0"
            onClick={() => router.push("/notice/list")}
          >
            <List size={18} />
            <span className="font-bold">목록으로 돌아가기</span>
          </Button>

          {isWriter && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                onClick={() => router.push(`/notice/${noticeId}/edit`)}
              >
                <SquarePen size={16} /> 수정
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border-none shadow-none gap-2 font-bold"
              >
                <Trash2 size={16} /> 삭제
              </Button>
            </div>
          )}
        </div>

        {/* 본문 영역: 불필요한 테두리를 빼고 여백 강조 */}
        <article className="py-4">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-6">
              {notice.title}
            </h1>

            <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl">
              <Avatar className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <AvatarImage
                  src={
                    `${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}` +
                    notice.writer.profileImageUrl
                  }
                  className="object-cover h-full w-full"
                />
                <AvatarFallback className="bg-slate-200 text-slate-500 flex items-center justify-center">
                  {notice.writer.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-800">
                  {notice.writer.name}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(notice.createdAt).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </header>

          <section className="prose prose-slate max-w-none min-h-[300px]">
            <EditorBlank html={notice.content} />
          </section>
        </article>

        {/* 첨부 파일 섹션: 카드 스타일 유지하되 더 깔끔하게 */}
        <div className="pt-10 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            Attachments{" "}
            <span className="text-blue-600 font-mono">
              [{notice.attachments?.length || 0}]
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notice.attachments && notice.attachments.length > 0 ? (
              notice.attachments.map((file, index) => {
                const downloadUrl = `${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/api/notices/files/download?path=${encodeURIComponent(
                  file.fileUrl.replace("/apssolution/notices/", ""),
                )}`;

                return (
                  <a
                    key={index}
                    href={downloadUrl}
                    className="flex items-center p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <List size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-600 truncate flex-1">
                      {file.fileName}
                    </span>
                  </a>
                );
              })
            ) : (
              <div className="col-span-full py-10 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-medium">
                첨부된 파일이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
