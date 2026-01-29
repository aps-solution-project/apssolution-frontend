import { useState, useEffect, useMemo } from "react";
import { getAllTools } from "@/api/tool-api";
import { useToken } from "@/stores/account-store";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthGuard } from "@/hooks/use-authGuard";
import SearchBar from "@/components/layout/SearchBar";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 15;
const GRID_COLS = "grid-cols-[20%_30%_50%]";

export default function ToolPage() {
  useAuthGuard();
  const [tools, setTools] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const token = useToken((state) => state.token);
  const router = useRouter();

  const isProducts = router.pathname === "/resources/products";
  const isCategories = router.pathname === "/resources/toolCategories";
  const isTools = router.pathname === "/resources/tools";
  const isProcesses = router.pathname === "/resources/tasks";

  useEffect(() => {
    if (!token) return;

    getAllTools(token).then((data) => {
      setTools(data.tools || []);
    });
  }, [token]);

  const filtered = useMemo(() => {
    return tools.filter(
      (t) =>
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.id?.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [tools, search]);

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
            onClick={() => router.push("/tools")}
            className="flex gap-1"
          >
            <Pencil size={14} />
            수정
          </Button>
        </div>
      </div>

      <div
        className={`grid ${GRID_COLS} px-6 py-3 bg-slate-200 text-xs font-semibold`}
      >
        <div>도구 ID</div>
        <div>카테고리 ID</div>
        <div>설명</div>
      </div>

      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        {pageData.map((tool) => (
          <div
            key={tool.id}
            className={`grid ${GRID_COLS} px-6 py-3 items-center text-sm border-b transition hover:bg-slate-50`}
          >
            <div className="text-stone-600 font-medium">{tool.id}</div>
            <div className="text-stone-500">{tool.category?.id || "-"}</div>
            <div className="text-stone-700 truncate">
              {tool.description || "-"}
            </div>
          </div>
        ))}

        {pageData.length === 0 && (
          <div className="py-12 text-center text-stone-400">
            검색 결과가 없습니다.
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
