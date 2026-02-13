import { deleteWorkerPost, getPostDetail } from "@/api/community-api";
import CommentSection from "@/components/community/comment-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditorBlank from "@/components/ui/editorBlank";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import { Baby, List, Paperclip, SquarePen, Trash2, X } from "lucide-react"; // Paperclip 아이콘 추가
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CommunityDetailPage() {
  useAuthGuard();
  const router = useRouter();
  const loginAccount = useAccount((state) => state.account);
  const { articleId } = router.query;
  const [post, setPost] = useState(null);
  const { token } = useToken();
  const { account } = useAccount();
  const [isWriter, setIsWriter] = useState(false);

  useEffect(() => {
    if (
      !articleId ||
      !token ||
      loginAccount?.role === "ADMIN" ||
      loginAccount?.role === "PLANNER"
    )
      return;
    getPostDetail(token, articleId).then((obj) => {
      setPost(obj);
      if (
        account?.accountId &&
        obj.writer?.id &&
        String(account.accountId) === String(obj.writer.id)
      ) {
        setIsWriter(true);
      }
    });
  }, [articleId, token, account?.accountId, loginAccount?.role]);

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

  if (!post) return null;

  function handleDelete() {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    deleteWorkerPost(token, articleId)
      .then(() => {
        window.alert("게시글이 삭제되었습니다.");
        router.push("/community/list");
      })
      .catch(() => alert("삭제에 실패했습니다."));
  }

  return (
    // 1. 전체 배경 흰색 통일 및 부모 여백 상쇄 (-m-8)
    <div className="max-w-4xl mx-auto pb-32">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        {/* 상단 버튼 영역: 목록(좌) / 수정·삭제(우) 균형 배치 */}
        <div className="flex justify-between items-center border-b pb-4 border-slate-100">
          <Button
            variant="ghost"
            onClick={() => router.push("/community/list")}
            className="text-slate-500 hover:text-slate-800 gap-2 px-0"
          >
            <List size={18} />
            <span className="font-bold">목록으로 돌아가기</span>
          </Button>

          {isWriter && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                onClick={() => router.push(`/community/${articleId}/edit`)}
              >
                <SquarePen size={16} /> 수정
              </Button>
              <Button
                variant="ghost"
                onClick={handleDelete}
                className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-bold gap-2"
              >
                <Trash2 size={16} /> 삭제
              </Button>
            </div>
          )}
        </div>

        {/* 본문 섹션: Card를 쓰지 않고 더 시원하게 배치 (통일감) */}
        <article className="p-15 py-4">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm overflow-hidden rounded-full">
                <AvatarImage
                  src={
                    post.writer?.profileImageUrl
                      ? `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080${post.writer.profileImageUrl}`
                      : undefined
                  }
                  className="object-cover"
                />
                <AvatarFallback className="bg-slate-200">
                  <Baby size={24} className="text-slate-400" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-800">
                  {post.writer?.name}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(post.createdAt).toLocaleString("ko-KR", {
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

          <section className="min-h-[150px] prose prose-slate max-w-none">
            <EditorBlank html={post.content} />
          </section>
        </article>

        {/* 첨부 파일 섹션: 리스트 디자인과 맞춤 */}
        <div className="pt-5 border-t border-slate-100">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Paperclip size={16} /> Attachments{" "}
            <span className="text-indigo-600 font-mono">
              [{post.attachments?.length || 0}]
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {post.attachments && post.attachments.length > 0 ? (
              post.attachments.map((file, index) => {
                const downloadUrl = `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/notices/files/download?path=${encodeURIComponent(
                  file.fileUrl.replace("/apssolution/notices/", ""),
                )}`;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all group"
                  >
                    <a
                      href={downloadUrl}
                      className="text-sm font-bold text-slate-600 truncate flex-1 hover:text-indigo-600"
                    >
                      {file.fileName}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-xs text-indigo-500 font-bold hover:bg-indigo-50"
                    >
                      <a href={downloadUrl} download>
                        다운로드
                      </a>
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-10 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-medium">
                첨부된 파일이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 댓글 섹션: 구분선 추가 */}
        <div className="pt-3 mt-12">
          <CommentSection articleId={articleId} setPost={setPost} />
        </div>
      </div>
    </div>
  );
}
