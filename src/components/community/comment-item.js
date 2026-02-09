import { use, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { Textarea } from "@/components/ui/textarea";
import {
  BotMessageSquare,
  Trash2,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import BoardEditor from "../ui/editor";
import EditorBlank from "../ui/editorBlank";

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

  // 1. 자식 댓글 추출 및 상태 설정
  const childComments = allComments.filter(
    (c) => c.parentCommentId === comment.id,
  );
  const hasChildren = childComments.length > 0;

  // 초기 상태: 자식이 있고, 부모가 강제 확장(forceExpand)이 아닐 때만 접어둠
  const [isCollapsed, setIsCollapsed] = useState(hasChildren);

  // 하위 모든 댓글 개수 계산 (재귀)
  const getAllRepliesCount = (commentId) => {
    const directChildren = allComments.filter(
      (c) => c.parentCommentId === commentId,
    );
    return directChildren.reduce(
      (acc, child) => acc + 1 + getAllRepliesCount(child.id),
      0,
    );
  };
  const totalRepliesCount = getAllRepliesCount(comment.id);

  // 권한 및 상태 체크
  const isOwner =
    account?.accountId &&
    comment.writerId &&
    String(account.accountId) === String(comment.writerId);
  const isReply = depth > 0;
  const canReply = depth < 3;

  const onPostReply = async () => {
    await handlePost(replyContent, comment.id);
    setReplyContent("");
    setIsReplyInputOpen(false);
    setIsCollapsed(false); // 답글 등록 후 자동으로 펼치기
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 w-full group">
        <Avatar className="h-9 w-9 border shadow-sm shrink-0">
          <AvatarFallback className="bg-blue-50">
            <BotMessageSquare className="w-5 h-5 text-blue-400" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* 댓글 박스 */}
          <div
            className={`p-3 rounded-2xl transition-colors ${isReply ? "bg-blue-50/30" : "bg-slate-50/50"}`}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                {/* 이름과 시간을 나란히 배치 */}
                <span className="text-sm font-bold text-slate-900">
                  {comment.writerName}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                {isOwner && (
                  <span className="text-[10px] text-blue-500 font-medium bg-blue-50 px-1 rounded">
                    본인
                  </span>
                )}
              </div>

              {/* 우측 상단 액션 버튼 (마우스 오버 시 노출) */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

            {/* 댓글 본문 */}
            <p className="text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
              <EditorBlank html={comment.content} />
            </p>
          </div>

          {/* 하단 펼치기/접기 버튼 영역 */}
          {hasChildren && (
            <div className="mt-1 ml-1">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isCollapsed ? (
                  <span className="gap-1 py-2 px-4 flex items-center rounded-full bg-blue-100">
                    <ChevronDown className="w-3 h-3" /> 답글 {totalRepliesCount}
                    개 펼치기
                  </span>
                ) : (
                  <span className="gap-1 py-2 px-4 flex items-center rounded-full bg-blue-100">
                    <ChevronUp className="w-3 h-3" /> 답글 접기
                  </span>
                )}
              </button>
            </div>
          )}
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

      {/* 대대댓글 재귀 호출 영역 */}
      {!isCollapsed && childComments.length > 0 && (
        <div className="relative ml-[18px] mt-2 border-l-2 border-slate-200 pl-4 space-y-6">
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
