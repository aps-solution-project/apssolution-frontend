import { createComment, deleteComment, getComments } from "@/api/community-api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import { Bot, Send } from "lucide-react";
import { useEffect, useState } from "react";
import CommentItem from "./comment-item"; // 분리한 컴포넌트 임포트

export default function CommentSection({ articleId, setPost }) {
  useAuthGuard();
  const { token } = useToken();
  const { account } = useAccount();
  const [comments, setComments] = useState([]);
  const [mainContent, setMainContent] = useState("");

  const loadComments = async () => {
    try {
      const data = await getComments(token, articleId);
      setComments(data.map((item) => item.comment || item));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (articleId && token) loadComments();
  }, [articleId, token]);

  const handlePost = async (text, parentId = null) => {
    try {
      await createComment(token, articleId, text, parentId);
      setMainContent("");
      loadComments();
    } catch (e) {
      alert("등록 실패");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("삭제하시겠습니까?")) return;
    try {
      await deleteComment(token, articleId, id);
      loadComments();
    } catch (e) {
      alert("삭제 실패");
    }
  };

  // 최상위 댓글만 필터링해서 렌더링 시작
  const rootComments = comments.filter((c) => !c.parentCommentId);

  return (
    <div className="mt-10 pt-10 border-t space-y-8">
      <h3 className="text-xl font-bold italic underline decoration-blue-500 underline-offset-8">
        Comments ({comments.length})
      </h3>

      {/* 메인 댓글 입력창 */}
      <div className="flex gap-4 bg-muted/30 p-4 rounded-xl border border-dashed">
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
          <AvatarFallback className="bg-white">
            <Bot className="text-slate-400" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="사원들과 의견을 나누어보세요."
            value={mainContent}
            onChange={(e) => setMainContent(e.target.value)}
            className="bg-white"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => handlePost(mainContent)}
              disabled={!mainContent.trim()}
            >
              <Send className="w-4 h-4 mr-2" /> 댓글 등록
            </Button>
          </div>
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div className="space-y-8">
        {rootComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            allComments={comments} // 전체 배열을 넘겨줘야 자식을 찾음
            account={account}
            handlePost={handlePost}
            handleDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
