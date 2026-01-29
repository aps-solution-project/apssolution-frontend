import { useEffect, useMemo, useState } from "react";
import { getTasks } from "@/api/task-api";
import { useToken } from "@/stores/account-store";
import Link from "next/link";
import { useRouter } from "next/router";

import SearchBar from "@/components/layout/SearchBar";
import TaskColumnFilter from "@/components/layout/TaskColumnFilter";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const PAGE_SIZE = 15;
const GRID_COLS = "grid-cols-[12%_12%_17%_10%_10%_36%]";

export default function TaskPage() {
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

    getTasks(token).then((data) => {
      setTasks(data.tasks || []);
    });
  }, [token]);

  const productOptions = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.productId))).filter(Boolean);
  }, [tasks]);

  const toolOptions = useMemo(() => {
    return Array.from(new Set(tasks.map((t) => t.toolCategoryId))).filter(
      Boolean,
    );
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const keyword =
        t.id + t.productId + t.toolCategoryId + t.name + (t.description || "");

      const matchSearch = keyword.toLowerCase().includes(search.toLowerCase());

      const matchProduct =
        productFilter.length === 0 || productFilter.includes(t.productId);

      const matchTool =
        toolFilter.length === 0 || toolFilter.includes(t.toolCategoryId);

      return matchSearch && matchProduct && matchTool;
    });
  }, [tasks, search, productFilter, toolFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="space-y-4">
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
            <Pencil size={14} />
            수정
          </Button>
        </div>
      </div>

      <div
        className={`grid ${GRID_COLS} px-4 py-1.5 bg-slate-200 text-xs font-semibold leading-tight`}
      >
        <div className="flex items-center gap-1">ID</div>

        <div className="flex items-center gap-1">
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

        <div className="flex items-center gap-1">
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

        <div className="flex items-center gap-1">순서</div>
        <div className="flex items-center gap-1">작업명</div>
        <div className="flex items-center gap-1">설명</div>
      </div>

      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        {pageData.map((t) => (
          <div
            key={t.id}
            className={`grid ${GRID_COLS} px-6 py-3 items-center text-sm border-b hover:bg-slate-100`}
          >
            <div className="font-medium text-stone-600">{t.id}</div>
            <div className="text-stone-600">{t.productId}</div>
            <div className="text-stone-600">{t.toolCategoryId}</div>
            <div>{t.seq}</div>
            <div className="truncate">{t.name}</div>
            <div className="text-stone-400 truncate">
              {t.description || "-"}
            </div>
          </div>
        ))}

        {pageData.length === 0 && (
          <div className="py-12 text-center text-stone-400">
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
