import { use, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { Textarea } from "@/components/ui/textarea";
import { BotMessageSquare, Trash2, CornerDownRight } from "lucide-react";

export default function CommentItem({
  comment,
  allComments,
  depth = 0,
  account,
  handlePost,
  handleDelete,
}) {
  useAuthGuard(); // 페이지 접근시 토큰 인증

  const [isReplyInputOpen, setIsReplyInputOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  // 댓글 접기 상태 추가 (기본값: 펼쳐짐)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 이 댓글을 부모로 가진 자식들(대댓글) 찾기
  const childComments = allComments.filter(
    (c) => c.parentCommentId === comment.id,
  );
  const isOwner = account?.id === comment.writerId;
  const isReply = depth > 0;
  const canReply = depth < 3;
  const hasChildren = childComments.length > 0;

  const onPostReply = async () => {
    await handlePost(replyContent, comment.id);
    setReplyContent("");
    setIsReplyInputOpen(false);
    setIsCollapsed(false); // 답글 작성 시 자동으로 펼치기
  };

  // 특정 댓글의 모든 하위 댓글(대대대댓글 포함) 개수를 구하는 재귀 함수
  const getAllRepliesCount = (commentId) => {
    // 1단계: 이 댓글을 부모로 가진 직계 자식들을 찾음
    const directChildren = allComments.filter(
      (c) => c.parentCommentId === commentId,
    );

    // 2단계: 자식들의 수 + 각 자식들이 가진 하위 댓글들의 수를 모두 더함 (재귀)
    return directChildren.reduce((acc, child) => {
      return acc + 1 + getAllRepliesCount(child.id);
    }, 0);
  };

  const totalRepliesCount = getAllRepliesCount(comment.id);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 w-full group">
        {/* 왼쪽 아이콘 영역: 클릭 시 접기/펼치기 토글 (자식이 있을 때만) */}
        <div className="flex flex-col items-center">
          <Avatar className="h-9 w-9 border shadow-sm shrink-0">
            <AvatarFallback className={isReply ? "bg-blue-50" : "bg-slate-50"}>
              <BotMessageSquare
                className={`w-5 h-5 ${isReply ? "text-blue-400" : "text-slate-400"}`}
              />
            </AvatarFallback>
          </Avatar>
          {/* 자식이 있을 때 세로 연결선 클릭 시 접기 기능 제공 */}
          {hasChildren && (
            <div
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-0.5 h-full bg-slate-100 hover:bg-blue-300 cursor-pointer transition-colors mt-2"
              title={isCollapsed ? "펼치기" : "접기"}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`p-3 rounded-2xl transition-colors ${isReply ? "bg-blue-50/30" : "bg-slate-50/50"}`}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {comment.writerId}
                </span>
                {isOwner && (
                  <span className="text-[10px] text-blue-500 font-medium bg-blue-50 px-1 rounded">
                    본인
                  </span>
                )}
                {/* 접기/펼치기 버튼: 자식이 있을 때만 아이디 옆에 표시 */}
                {hasChildren && (
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center text-[10px] font-bold text-indigo-600 hover:text-indigo-400 hover:underline ml-1"
                  >
                    {isCollapsed
                      ? `+ 총 ${totalRepliesCount}개의 답글 펼치기`
                      : "- 댓글 접기"}
                  </button>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* ✅ canReply가 true일 때만 답글 버튼 노출 */}
                {canReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplyInputOpen(!isReplyInputOpen)}
                    className="h-6 text-[11px]"
                  >
                    답글
                  </Button>
                )}
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    className="h-6 w-6 p-0 text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>
          <div className="mt-1 ml-1 text-[10px] text-slate-400">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 답글 입력창 */}
      {isReplyInputOpen && (
        <div className="ml-10 p-4 bg-blue-50/30 rounded-xl border border-blue-100 flex gap-3">
          <CornerDownRight className="w-4 h-4 text-blue-400 mt-1" />
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="답글을 남겨주세요..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="bg-white min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplyInputOpen(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={onPostReply}
                disabled={!replyContent.trim()}
              >
                등록
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 대대댓글 재귀 호출 영역 */}
      {!isCollapsed && childComments.length > 0 && (
        <div className="ml-8 border-l border-slate-100 pl-4 space-y-4">
          {childComments.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              allComments={allComments}
              depth={depth + 1}
              account={account}
              handlePost={handlePost}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
