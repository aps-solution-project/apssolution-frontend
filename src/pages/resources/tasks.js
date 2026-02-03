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
import { Pencil } from "lucide-react";

const PAGE_SIZE = 15;

/** 👉 컬럼 비율 재설계 (설명 넓힘) */
const GRID_COLS = "grid-cols-[10%_17%_14%_6%_13%_30%_10%]";

const cellBase = "px-4 py-2.5 flex items-center border-r last:border-r-0";

export default function TaskPage() {
  useAuthGuard();
  const token = useToken((state) => state.token);
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [productFilter, setProductFilter] = useState([]);
  const [toolFilter, setToolFilter] = useState([]);

  const isProducts = router.pathname === "/resources/products";
  const isCategories = router.pathname === "/resources/toolCategories";
  const isTools = router.pathname === "/resources/tools";
  const isProcesses = router.pathname === "/resources/tasks";

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
      {/* 상단 네비 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-8 text-sm font-medium">
          <Link
            href="/resources/products"
            className={isProducts ? "text-indigo-600" : "text-stone-400"}
          >
            품목
          </Link>
          <Link
            href="/resources/toolCategories"
            className={isCategories ? "text-indigo-600" : "text-stone-400"}
          >
            카테고리
          </Link>
          <Link
            href="/resources/tools"
            className={isTools ? "text-indigo-600" : "text-stone-400"}
          >
            도구
          </Link>
          <Link
            href="/resources/tasks"
            className={isProcesses ? "text-indigo-600" : "text-stone-400"}
          >
            공정
          </Link>
        </div>

        <div className="flex gap-2 items-center">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="검색"
          />
          <Button
            size="sm"
            onClick={() => router.push("/tasks")}
            className="flex gap-1"
          >
            <Pencil size={14} /> 수정
          </Button>
        </div>
      </div>

      {/* 표 */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        {/* 헤더 (세로폭 살짝 줄임) */}
        <div
          className={`grid ${GRID_COLS} bg-slate-100 text-xs font-semibold border-b`}
        >
          <div className={`${cellBase} py-2`}>ID</div>

          <div className={`${cellBase} py-2`}>
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

          <div className={`${cellBase} py-2`}>
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

          <div className={`${cellBase} justify-center py-2`}>순서</div>
          <div className={`${cellBase} py-2`}>작업명</div>
          <div className={`${cellBase} py-2`}>설명</div>
          <div className={`${cellBase} justify-center py-2`}>요구인원</div>
        </div>

        {/* 바디 */}
        {pageData.map((t) => (
          <div
            key={t.id}
            className={`grid ${GRID_COLS} text-sm border-b last:border-b-0 hover:bg-slate-50`}
          >
            <div className={cellBase}>{t.id}</div>
            <div className={`${cellBase} truncate`}>{t.productId}</div>
            <div className={`${cellBase} truncate`}>
              {t.toolCategoryId || "-"}
            </div>
            <div className={`${cellBase} justify-center`}>{t.seq}</div>
            <div className={`${cellBase} truncate`}>{t.name}</div>
            <div className={`${cellBase} truncate text-stone-500`}>
              {t.description || "-"}
            </div>
            <div className={`${cellBase} justify-center`}>
              {t.requiredWorkers ?? 1}
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
