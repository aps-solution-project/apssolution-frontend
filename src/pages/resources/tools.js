import { useState, useEffect, useMemo } from "react";
import { useToken } from "@/stores/account-store";
import { getToolCategories } from "@/api/tool-api";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const GRID_COLS = "grid-cols-[25%_55%_20%]";
const PAGE_SIZE = 10;

export default function ToolCategoryPage() {
  const token = useToken((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);

  const router = useRouter();

  const isProducts = router.pathname === "/resources/products";
  const isTools = router.pathname === "/resources/tools";

  useEffect(() => {
    if (token) loadCategories();
  }, [token]);

  const loadCategories = async () => {
    const data = await getToolCategories(token);
    const list = data.categoryList || data || [];
    setCategories(list);
    setPage(1);
  };

  const totalPages = Math.ceil(categories.length / PAGE_SIZE);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, page]);

  return (
    <div className="space-y-4">
      {/* ===== NAV ===== */}
      <div className="flex justify-between items-center">
        <div className="flex gap-8 text-sm font-medium">
          <Link
            href="/resources/products"
            className={isProducts ? "text-indigo-600" : "text-stone-400"}
          >
            품목
          </Link>
          <Link
            href="/resources/tools"
            className={isTools ? "text-indigo-600" : "text-stone-400"}
          >
            카테고리
          </Link>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <div
        className={`grid ${GRID_COLS} px-6 py-3 bg-slate-200 text-xs font-semibold`}
      >
        <div>ID</div>
        <div>카테고리명</div>
        <div>상태</div>
      </div>

      {/* ===== LIST ===== */}
      <div className="border border-t-0 rounded-b-lg divide-y">
        {pageData.map((cat, index) => (
          <div key={index} className="px-6 py-3 hover:bg-slate-50 transition">
            <div className={`grid ${GRID_COLS} w-full text-sm items-center`}>
              <div className="text-stone-500">{cat.id}</div>
              <div className="font-medium truncate">{cat.name}</div>
              <div className="text-stone-400 text-xs">등록됨</div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
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

      {/* ===== ADD ===== */}
      <div
        onClick={() => router.push("/resources/tools/new")}
        className="cursor-pointer text-center py-6 text-stone-400 hover:bg-slate-50 border border-dashed rounded-lg"
      >
        <Plus className="inline-block mr-2 h-5 w-5" />새 카테고리 추가
      </div>
    </div>
  );
}
