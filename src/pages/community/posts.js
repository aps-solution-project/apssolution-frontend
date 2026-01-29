import { getWorkerPosts } from "@/api/community-api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToken } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const { token } = useToken();

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const data = await getWorkerPosts(token);
        // 백엔드에서 주는 배열 키값이 'notices'라면 유지, 'posts'라면 변경하세요.
        setPosts(data.notices || data.posts || []);
      } catch (err) {
        if (err.status === 403) {
          alert("사원만 접근 가능한 게시판입니다. (관리자 접근 불가)");
        } else {
          console.error("데이터 로드 실패:", err.message);
        }
      }
    };

    fetchData();
  }, [token, router]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-end gap-3">
          <h1 className="text-2xl font-bold">사원 게시판</h1>
          <span className="text-sm font-medium text-muted-foreground pb-1">
            전체 <span className="text-blue-600 font-bold">{posts.length}</span>
            건
          </span>
        </div>
        <Button
          className="bg-indigo-900 hover:bg-indigo-500 text-white cursor-pointer"
          onClick={() => router.push("/community/post-create")}
        >
          게시글 작성
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-[140px]">작성자</TableHead>
            <TableHead className="w-[160px]">작성일</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {posts.map((post) => (
            <TableRow
              key={post.id}
              className="cursor-pointer hover:bg-muted"
              onClick={() => router.push(`/community/${post.id}`)}
            >
              <TableCell className="text-muted-foreground">{post.id}</TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {/* 게시글 제목 */}
                  <span>{post.title}</span>

                  {/* ✅ 댓글 개수 표시 (0개보다 많을 때만 파란색 숫자로 표시) */}
                  {post.commentCount > 0 && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 shrink-0">
                      {post.commentCount}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {post.writer?.name || post.writer?.id || "익명"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                <span>{post.createdAt?.split("T")[0] || "-"}</span>
              </TableCell>
            </TableRow>
          ))}

          {posts.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                등록된 게시글이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
