import { getAllTools } from "@/api/tool-api";
import SearchBar from "@/components/layout/SearchBar";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useToken } from "@/stores/account-store";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Brain, Pencil } from "lucide-react";

const PAGE_SIZE = 8;

/** Tasks 페이지랑 톤 맞춤 */
const GRID_COLS = "grid-cols-[20%_30%_50%]";
const cellBase =
  "px-4 py-2.5 flex items-center border-r last:border-r-0 min-h-[50px]";

export default function ToolPage() {
  useAuthGuard();
  const [tools, setTools] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const token = useToken((state) => state.token);
  const router = useRouter();

  const isProducts = router.pathname === "/resources/product";
  const isCategories = router.pathname === "/resources/tool/category";
  const isTools = router.pathname === "/resources/tool";
  const isProcesses = router.pathname === "/resources/task";

  useEffect(() => {
    if (!token) return;
    getAllTools(token).then((data) => setTools(data.tools || []));
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tools.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.category?.id?.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q),
    );
  }, [tools, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [page, totalPages]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="space-y-4">
      {/* 🌟 1. 최상단 헤더 영역 (통일) */}
      <div className="flex justify-between items-end border-b pb-3 border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Brain size={20} />
            <span className="text-xs font-black uppercase tracking-widest">
              Resources Library
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            자료실
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            공정에 투입되는 개별 도구(Tool) 인벤토리를 관리합니다.
          </p>
        </div>

        <Button
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-6 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 gap-2"
          onClick={() => router.push("/resources/tool/edit")}
        >
          <Pencil size={16} className="text-indigo-600" />
          <span className="font-bold">도구 수정</span>
        </Button>
      </div>

      {/* 🌟 2. 탭 네비게이션 및 검색 바 (통일) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-fit">
          {[
            { name: "공정", href: "/resources/task", active: isProcesses },
            { name: "품목", href: "/resources/product", active: isProducts },
            { name: "도구", href: "/resources/tool", active: isTools },
            {
              name: "카테고리",
              href: "/resources/tool/category",
              active: isCategories,
            },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 md:flex-none"
            >
              <div
                className={cn(
                  "px-6 py-2 text-sm font-bold rounded-lg text-center transition-all cursor-pointer",
                  tab.active
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50",
                )}
              >
                {tab.name}
              </div>
            </Link>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="도구 ID 또는 카테고리 검색..."
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* 🌟 3. 표 영역 (통일) */}
      <div className="border rounded-2xl overflow-hidden shadow-sm bg-white border-slate-200">
        {/* 헤더 */}
        <div
          className={`grid ${GRID_COLS} bg-slate-50 text-[11px] font-black text-slate-500 border-b border-slate-100 uppercase tracking-wider`}
        >
          <div className={`${cellBase} py-3`}>도구 ID</div>
          <div className={`${cellBase} py-3`}>카테고리 ID</div>
          <div className={`${cellBase} py-3`}>설명</div>
        </div>

        {/* 바디 */}
        {pageData.map((tool) => (
          <div
            key={tool.id}
            className={`grid ${GRID_COLS} text-sm border-b last:border-b-0 hover:bg-slate-50/80 transition-colors border-slate-100`}
          >
            <div className={`${cellBase} font-bold text-slate-400`}>
              {tool.id}
            </div>
            <div className={`${cellBase}`}>
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[11px] font-bold">
                {tool.category?.id || "-"}
              </span>
            </div>
            <div className={`${cellBase} text-slate-500 text-xs truncate`}>
              {tool.description || "-"}
            </div>
          </div>
        ))}

        {pageData.length === 0 && (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 🌟 4. 페이징 처리 */}
      {totalPages > 1 && (
        <div className="flex justify-center pb-10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i} className="cursor-pointer">
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
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
  );
}
