import { getNotices, searchNotice } from "@/api/notice-api";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccount, useToken } from "@/stores/account-store";
import { MegaphoneIcon, Paperclip, Plus, Search } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

export default function AnnouncementsPage() {
  const router = useRouter();
  const { token } = useToken();
  const { role } = useAccount();

  const [keyword, setKeyword] = useState("");
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 초기 데이터 및 검색 로직
  useEffect(() => {
    if (!token) return;

    const fetchNotices = async () => {
      try {
        setLoading(true);
        let res;
        if (keyword.trim()) {
          res = await searchNotice(token, keyword);
        } else {
          const responseData = await getNotices(token);
          res = responseData.notices;
        }
        setNotices(res || []);
      } catch (err) {
        console.error("공지사항 로드 중 에러:", err);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    // 디바운스 적용 (선택사항이나 권장)
    const timer = setTimeout(() => {
      fetchNotices();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, token]);

  // --- 페이징 처리 로직 (ResourcesPage 방식) ---
  const totalPages = Math.ceil(notices.length / PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const pageData = notices.slice(start, start + PAGE_SIZE);
  // ------------------------------------------

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="space-y-4">
        {/* 헤더 섹션 */}
        <div className="flex justify-between items-end border-b pb-3 border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <MegaphoneIcon size={20} />
              <span className="text-xs font-black uppercase tracking-widest">
                Notice
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              공지사항
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              회사의 주요 소식을 안내합니다. (총{" "}
              <span className="text-slate-600 font-bold">{notices.length}</span>
              건)
            </p>
          </div>
          {token && role?.toUpperCase() !== "WORKER" && (
            <Button
              onClick={() => router.push("/notice/create")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:scale-95 gap-2"
            >
              <Plus size={18} />
              <span className="font-bold">공지 작성</span>
            </Button>
          )}
        </div>

        {/* 검색 */}
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
                setPage(1);
              }}
              placeholder="공지사항을 검색하세요"
              className="w-full h-12 pl-12 pr-5 rounded-full bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              spellCheck={false}
            />
          </div>
        </div>

        {/* 리스트(테이블) 섹션 */}
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
              ) : pageData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-40 text-center text-slate-300 italic"
                  >
                    등록된 공지사항이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map(
                  ({ id, title, writer, createdAt, attachmentCount }) => (
                    <TableRow
                      key={id}
                      onClick={() => router.push(`/notice/${id}`)}
                      className="group cursor-pointer hover:bg-slate-50/80 transition-all border-slate-50"
                    >
                      <TableCell className="text-center font-mono text-slate-400 text-sm">
                        {id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {title}
                          </span>
                          {attachmentCount > 0 && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-50 text-sky-500 text-[11px] font-black ring-1 ring-sky-100">
                              <Paperclip size={10} strokeWidth={3} />
                              {attachmentCount}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm font-bold text-slate-600">
                          {writer?.name || "익명"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-400 font-medium">
                        {createdAt?.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>

          {/* 페이징 네비게이션 */}
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
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
