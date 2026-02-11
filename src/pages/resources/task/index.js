import { getTasks } from "@/api/task-api";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useToken } from "@/stores/account-store";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import SearchBar from "@/components/layout/SearchBar";
import TaskColumnFilter from "@/components/layout/TaskColumnFilter";

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

/**  컬럼 비율 재설계 (설명 넓힘) */
const GRID_COLS = "grid-cols-[15%_16%_13%_11%_23%_7%_8%_7%]";
const cellBase =
  "px-4 py-2.5 flex items-center border-r last:border-r-0 min-h-[50px]";

export default function TaskPage() {
  useAuthGuard();
  const token = useToken((state) => state.token);
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [productFilter, setProductFilter] = useState([]);
  const [toolFilter, setToolFilter] = useState([]);

  const isProducts = router.pathname === "/resources/product";
  const isCategories = router.pathname === "/resources/tool/category";
  const isTools = router.pathname === "/resources/tool";
  const isProcesses = router.pathname === "/resources/task";

  useEffect(() => {
    if (!token) return;
    getTasks(token).then((data) => setTasks(data.tasks || []));
  }, [token]);

  const productOptions = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.productId))).filter(Boolean),
    [tasks],
  );

  const toolOptions = useMemo(
    () =>
      Array.from(new Set(tasks.map((t) => t.toolCategoryId))).filter(Boolean),
    [tasks],
  );

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const keyword = (
        t.id +
        t.productId +
        t.toolCategoryId +
        t.name +
        (t.description || "")
      ).toLowerCase();

      return (
        keyword.includes(search.toLowerCase()) &&
        (productFilter.length === 0 || productFilter.includes(t.productId)) &&
        (toolFilter.length === 0 || toolFilter.includes(t.toolCategoryId))
      );
    });
  }, [tasks, search, productFilter, toolFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

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
            시뮬레이션의 핵심인 공정(Task) 단위를 관리합니다.
          </p>
        </div>

        <Button
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-6 shadow-sm transition-all hover:-translate-y-0.5 active:scale-95 gap-2"
          onClick={() => router.push("/tasks")}
        >
          <Pencil size={16} className="text-indigo-600" />
          <span className="font-bold">공정 편집</span>
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
            placeholder="공정명 또는 ID 검색..."
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* 🌟 3. 표 영역 (디자인 개선) */}
      <div className="border rounded-2xl overflow-hidden shadow-sm bg-white border-slate-200">
        <div
          className={`grid ${GRID_COLS} bg-slate-50 text-[11px] font-black text-slate-500 border-b border-slate-100 uppercase tracking-wider`}
        >
          <div className={`${cellBase} py-3`}>공정 ID</div>
          <div className={`${cellBase} py-3`}>
            <TaskColumnFilter
              label="제품"
              options={productOptions}
              selected={productFilter}
              onChange={(v) => {
                setProductFilter(v);
                setPage(1);
              }}
            />
          </div>
          <div className={`${cellBase} py-3`}>
            <TaskColumnFilter
              label="도구"
              options={toolOptions}
              selected={toolFilter}
              onChange={(v) => {
                setToolFilter(v);
                setPage(1);
              }}
            />
          </div>
          <div className={`${cellBase} py-3`}>작업명</div>
          <div className={`${cellBase} py-3`}>설명</div>
          <div className={`${cellBase} justify-center py-3`}>순서</div>
          <div className={`${cellBase} justify-center py-3`}>시간</div>
          <div className={`${cellBase} justify-center py-3`}>인원</div>
        </div>

        {pageData.map((t) => (
          <div
            key={t.id}
            className={`grid ${GRID_COLS} text-sm border-b last:border-b-0 hover:bg-slate-50/80 transition-colors border-slate-100`}
          >
            <div className={`${cellBase} font-mono text-xs text-slate-400`}>
              {t.id}
            </div>
            <div className={`${cellBase} truncate font-medium text-slate-600`}>
              {t.productId}
            </div>
            <div className={`${cellBase} truncate font-bold text-indigo-600`}>
              {t.toolCategoryId || "-"}
            </div>
            <div className={`${cellBase} truncate text-slate-800`}>
              {t.name}
            </div>
            <div className={`${cellBase} truncate text-slate-500 text-xs`}>
              {t.description || "-"}
            </div>
            <div
              className={`${cellBase} justify-center font-black text-slate-500`}
            >
              {t.seq}
            </div>
            <div
              className={`${cellBase} justify-center font-bold text-emerald-600`}
            >
              {t.duration}분
            </div>
            <div className={`${cellBase} justify-center`}>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-600">
                👤 {t.requiredWorkers ?? 1}
              </span>
            </div>
          </div>
        ))}

        {pageData.length === 0 && (
          <div className="py-12 text-center text-stone-400 text-sm">
            조건에 맞는 공정이 없습니다.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
