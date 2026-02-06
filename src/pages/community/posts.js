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
import { useAuthGuard } from "@/hooks/use-authGuard";
import { MessageSquare, PenLine } from "lucide-react"; // 아이콘 추가

export default function PostsPage() {
  useAuthGuard();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const { token } = useToken();

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const data = await getWorkerPosts(token);
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
    // 1. 배경색 분리 방지를 위해 min-h-full bg-white 적용
    <div className="min-h-screen bg-white -m-8 p-8 space-y-6">
      {/* 헤더 섹션: 더 깔끔하고 세련되게 변경 */}
      <div className="flex justify-between items-end border-b pb-6 border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <MessageSquare size={20} />
            <span className="text-xs font-black uppercase tracking-widest">
              Community
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            사원 게시판
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            동료들과 자유롭게 소통하는 공간입니다. (총{" "}
            <span className="text-slate-600 font-bold">{posts.length}</span>개)
          </p>
        </div>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:scale-95 gap-2"
          onClick={() => router.push("/community/post-create")}
        >
          <PenLine size={18} />
          <span className="font-bold">글쓰기</span>
        </Button>
      </div>

      {/* 테이블 섹션: 여백과 폰트 최적화 */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] text-center font-bold text-slate-400 py-4">
                번호
              </TableHead>
              <TableHead className="font-bold text-slate-600 pl-3">
                제목
              </TableHead>

              {/* 1. 헤더 '작성자'를 text-start로 변경하고 본문과 맞추기 위해 여백(pl-1) 살짝 추가 */}
              <TableHead className="w-[160px] font-bold text-slate-600 text-start pl-1">
                작성자
              </TableHead>

              <TableHead className="w-[160px] font-bold text-slate-600 text-center">
                등록일
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {posts.map((post) => (
              <TableRow
                key={post.id}
                className="group cursor-pointer hover:bg-slate-50/80 transition-all border-slate-50"
                onClick={() => router.push(`/community/${post.id}`)}
              >
                <TableCell className="text-center font-mono text-slate-400 text-sm">
                  {post.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </span>
                    {post.commentCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full ring-1 ring-indigo-100">
                        <MessageSquare size={10} fill="currentColor" />
                        {post.commentCount}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center justify-start gap-2">
                    <span className="text-sm font-bold text-slate-600">
                      {post.writer?.name || post.writer?.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm text-slate-400 font-medium">
                  {post.createdAt?.split("T")[0] || "-"}
                </TableCell>
              </TableRow>
            ))}

            {posts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-40 text-center text-slate-300 italic"
                >
                  아직 올라온 게시글이 없네요. 첫 글의 주인공이 되어보세요!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
