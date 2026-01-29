import { deleteWorkerPost, getPostDetail } from "@/api/community-api";
import CommentSection from "@/components/community/CommentSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useToken } from "@/stores/account-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SquarePen, List, Trash2, Baby } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CommunityDetailPage() {
  const router = useRouter();
  const { noticeId } = router.query;
  const [post, setPost] = useState(null);
  const { token } = useToken();
  const { account } = useAccount(); // 백엔드에서 보낸 GetAccountDetailResponse 객체
  const [isWriter, setIsWriter] = useState(false);

  useEffect(() => {
    if (!noticeId || !token) return;

    // ✅ 중첩된 useEffect를 하나로 통합 및 문법 교정
    getPostDetail(token, noticeId)
      .then((obj) => {
        setPost(obj);

        // ✅ 백엔드 GetAccountDetailResponse 필드명인 accountId로 비교
        // 게시글 작성자의 ID(obj.writer.accountId)와 로그인 세션 ID를 비교합니다.
        if (account?.accountId === obj.writer?.accountId) {
          setIsWriter(true);
        }
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
      });
  }, [noticeId, token, account?.accountId]);

  if (!post) return null;

  function handleDelete() {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    deleteWorkerPost(token, noticeId)
      .then(() => {
        window.alert("게시글이 삭제되었습니다.");
        router.push("/community/posts");
      })
      .catch((err) => {
        alert("삭제에 실패했습니다.");
      });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.push("/community/posts")}
          className="gap-2"
        >
          <List className="h-4 w-4" /> 목록으로
        </Button>

        {isWriter && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" /> 삭제
          </Button>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold leading-tight">
              {post.title}
            </CardTitle>
            {isWriter && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/community/${noticeId}/edit`)}
              >
                <SquarePen className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
            <Avatar className="h-10 w-10 border shadow-sm">
              <AvatarImage
                src={
                  post.writer?.profileImageUrl
                    ? `http://192.168.0.20:8080${post.writer.profileImageUrl}`
                    : undefined
                }
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-50">
                <Baby className="h-6 w-6 text-slate-300" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-slate-900">{post.writer?.name}</p>
              <p className="text-[12px]">
                {new Date(post.createdAt).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <div
            className="prose prose-slate max-w-none min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
      </Card>

      {/* 첨부 파일 섹션 - 가독성 개선 */}
      <Card className="shadow-sm border-dashed">
        <CardHeader className="py-3 border-b bg-muted/5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            📎 첨부 파일 ({post.attachments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {post.attachments && post.attachments.length > 0 ? (
            post.attachments.map((file, index) => {
              const downloadUrl = `http://192.168.0.20:8080/api/notices/files/download?path=${encodeURIComponent(
                file.fileUrl.replace("/apssolution/notices/", ""),
              )}`;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg">📁</span>
                    <a
                      href={downloadUrl}
                      className="text-sm font-medium hover:underline text-slate-700 truncate"
                    >
                      {file.fileName}
                    </a>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8 text-xs"
                  >
                    <a href={downloadUrl} download>
                      다운로드
                    </a>
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-sm text-slate-400 italic">
              첨부된 파일이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <CommentSection noticeId={noticeId} />
    </div>
  );
}
