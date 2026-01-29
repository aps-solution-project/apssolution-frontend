import { deleteWorkerPost, getPostDetail } from "@/api/community-api"; // ✅ 사원 게시판 전용 API로 교체
import CommentSection2 from "@/components/community/CommentSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useToken } from "@/stores/account-store";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { SquarePen, List, Trash2, Baby, Bot } from "lucide-react"; // 아이콘 추가
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CommunityDetailPage() {
  const router = useRouter();
  const { noticeId } = router.query;
  const [post, setPost] = useState(null); // notice -> post로 명칭 변경
  const { token } = useToken();
  const { account } = useAccount();
  const [isWriter, setIsWriter] = useState(false);

  useEffect(() => {
    if (!noticeId || !token) return;
    getNotice(token, noticeId).then((obj) => {
      setNotice(obj);
      if (account.accountId === obj.writer.id) {
        setIsWriter(true);
      }
    });
  }, [noticeId, token]);

    // ✅ 사원 게시판용 상세 조회 API 호출
    getPostDetail(token, noticeId)
      .then((obj) => {
        setPost(obj);
        if (account?.id === obj.writer?.id) {
          setIsWriter(true);
        }
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
      });
  }, [noticeId, token, account?.id]);

  if (!post) return null;

  function handleDelete() {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    // ✅ 사원 게시판용 삭제 API 호출
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
            variant="destructive" // UI 통일성을 위해 destructive 사용
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
                // ✅ 경로 수정: /notice -> /community
                onClick={() => router.push(`/community/${noticeId}/edit`)}
              >
                <SquarePen className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
            <Avatar className="h-10 w-10 overflow-hidden rounded-full border bg-muted flex items-center justify-center">
              <AvatarImage
                src={
                  post.writer?.profileImageUrl
                    ? `http://192.168.0.20:8080${post.writer.profileImageUrl}`
                    : undefined // 이미지가 없으면 undefined를 줘서 Fallback이 나오게 함
                }
              />
              <AvatarFallback className="bg-gray-100 w-full h-full flex items-center justify-center">
                {/* 텍스트 대신 루시드 아이콘을 넣습니다 */}
                <Baby className="h-6 w-6 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{post.writer?.name}</p>
              <p>
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
            className="prose prose-slate max-w-none dark:prose-invert min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
      </Card>

      {/* 첨부 파일 섹션 */}
      <Card className="shadow-sm">
        <CardHeader className="py-2 border-b bg-muted/10">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            📎 첨부 파일 ({post.attachments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 space-y-1">
          {post.attachments && post.attachments.length > 0 ? (
            post.attachments.map((file, index) => {
              // 다운로드 경로 유지하되 가독성 개선
              const downloadUrl = `http://192.168.0.20:8080/api/notices/files/download?path=${encodeURIComponent(
                file.fileUrl.replace("/apssolution/notices/", ""),
              )}`;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-blue-500 font-bold text-lg">📁</span>
                    <a
                      href={downloadUrl}
                      className="text-sm font-medium hover:underline text-blue-600 truncate"
                    >
                      {file.fileName}
                    </a>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={downloadUrl}>다운로드</a>
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground italic">
              첨부된 파일이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 댓글 섹션 컴포넌트 */}
      <CommentSection2 noticeId={noticeId} />
    </div>
  );
}
