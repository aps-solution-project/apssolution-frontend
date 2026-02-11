import { useRouter } from "next/router";
import { getWorkerPosts } from "@/api/community-api";
import {
  MegaphoneIcon,
  Plus,
  Search,
  Paperclip,
  Megaphone,
  MessageSquare,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useEffect, useState } from "react";
import { useToken } from "@/stores/account-store";

const PAGE_SIZE = 10;

export default function PostsPage() {
  useAuthGuard();
  const router = useRouter();
  const { token } = useToken();

  const [posts, setPosts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 1. 데이터 로드 로직
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getWorkerPosts(token);
        const list =
          data.notices || data.posts || (Array.isArray(data) ? data : []);
        setPosts(list);
      } catch (err) {
        console.error("데이터 로드 실패:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const filteredPosts = posts.filter(
    (post) =>
      post.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      post.writer?.name?.toLowerCase().includes(keyword.toLowerCase()),
  );

  // 2. 전체 페이지 수 계산
  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);

  // 3. 페이지가 범위를 벗어날 경우 조정하는 효과
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // 4. 현재 페이지에 보여줄 데이터 슬라이싱
  const start = (page - 1) * PAGE_SIZE;
  const pageData = filteredPosts.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-end border-b pb-3 border-slate-100">
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
            총{" "}
            <span className="text-slate-600 font-bold">
              {filteredPosts.length}
            </span>
            개의 게시글
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

      {/* 검색 바 */}
      <div className="max-w-2xl">
        <div className="relative">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="search"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1); // 검색 시 1페이지로 이동
            }}
            placeholder="제목이나 작성자 검색"
            className="w-full h-12 pl-12 pr-5 rounded-full bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* 테이블 섹션 */}
      <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] text-center font-bold text-slate-400 py-4">
                번호
              </TableHead>
              <TableHead className="font-bold text-slate-600 pl-3">
                제목
              </TableHead>
              <TableHead className="w-[160px] font-bold text-slate-600 text-start">
                작성자
              </TableHead>
              <TableHead className="w-[160px] font-bold text-slate-600 text-center">
                등록일
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-40 text-center text-slate-400"
                >
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : pageData.length > 0 ? (
              pageData.map((post) => (
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
                      <div className="flex items-center gap-1.5">
                        {post.commentCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-100">
                            <MessageSquare size={10} fill="currentColor" />{" "}
                            {post.commentCount}
                          </span>
                        )}
                        {post.attachmentCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-black text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full ring-1 ring-sky-100">
                            <Paperclip size={10} strokeWidth={3} />{" "}
                            {post.attachmentCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">
                        {post.writer?.name || post.writer?.id || "익명"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">
                        {post.writer?.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-400 font-medium">
                    {post.createdAt?.slice(0, 10)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-40 text-center text-slate-300 italic"
                >
                  표시할 게시글이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 페이징 네비게이션 (참고 코드와 동일 방식) */}
        {totalPages > 1 && (
          <div className="py-6 border-t border-slate-50 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className="cursor-pointer"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    className="cursor-pointer"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
