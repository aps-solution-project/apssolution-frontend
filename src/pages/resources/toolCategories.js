import {
  createToolCategory,
  deleteToolCategory,
  getToolCategories,
} from "@/api/tool-api";
import { useToken } from "@/stores/account-store";
import { useEffect, useMemo, useState } from "react";

import SearchBar from "@/components/layout/SearchBar";
import { useAuthGuard } from "@/hooks/use-authGuard";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, Trash2 } from "lucide-react";

const PAGE_SIZE = 10;

/** 다른 리소스 페이지들과 동일한 컬럼 결 */
const GRID_COLS = "grid-cols-[30%_55%_15%]";
const cellBase = "px-4 py-2.5 flex items-center border-r last:border-r-0";

export default function ToolCategoryPage() {
  useAuthGuard();
  const token = useToken((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const router = useRouter();

  const isProducts = router.pathname === "/resources/products";
  const isCategories = router.pathname === "/resources/toolCategories";
  const isTools = router.pathname === "/resources/tools";
  const isProcesses = router.pathname === "/resources/tasks";

  useEffect(() => {
    if (token) loadCategories();
  }, [token]);

  const loadCategories = async () => {
    const data = await getToolCategories(token);
    const list = (data.categoryList || data || []).map((c) => ({
      ...c,
      isSaved: true,
    }));
    setCategories(list);
    setPage(1);
  };

  const handleAddRow = () => {
    if (categories.some((c) => !c.isSaved)) return;
    setCategories([{ id: "", name: "", isSaved: false }, ...categories]);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    updated[index].isSaved = false;
    setCategories(updated);
  };

  const handleSave = async () => {
    const newCat = categories.find((c) => !c.isSaved);
    if (!newCat) return;
    if (!newCat.id.trim() || !newCat.name.trim()) return;

    await createToolCategory(
      { categoryId: newCat.id, name: newCat.name },
      token,
    );

    loadCategories();
  };

  const handleDelete = async (index, id) => {
    if (!id) {
      setCategories(categories.filter((_, i) => i !== index));
      return;
    }

    if (!confirm(`[${id}] 카테고리를 삭제할까요?`)) return;

    await deleteToolCategory(id, token);
    loadCategories();
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((c) =>
      `${c.id} ${c.name}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [categories, search]);

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

        <div className="flex items-center gap-2">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="카테고리 검색"
          />
          {categories.some((c) => !c.isSaved) && (
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-1 h-4 w-4" />
              저장
            </Button>
          )}
        </div>
      </div>

      {/* 표 */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        {/* 헤더 */}
        <div
          className={`grid ${GRID_COLS} bg-slate-100 text-xs font-semibold border-b`}
        >
          <div className={`${cellBase} py-2`}>카테고리 ID</div>
          <div className={`${cellBase} py-2`}>카테고리명</div>
          <div className={`${cellBase} py-2 justify-center`}>삭제</div>
        </div>

        {/* 바디 */}
        {pageData.map((cat, index) => {
          const realIndex = (page - 1) * PAGE_SIZE + index;

          return (
            <div
              key={realIndex}
              className={`grid ${GRID_COLS} text-sm border-b last:border-b-0 ${
                cat.isSaved ? "hover:bg-slate-50" : "bg-emerald-50/40"
              }`}
            >
              {cat.isSaved ? (
                <>
                  <div className={`${cellBase} text-stone-600`}>{cat.id}</div>
                  <div
                    className={`${cellBase} font-medium truncate flex gap-2`}
                  >
                    {cat.name}
                  </div>
                </>
              ) : (
                <>
                  <div className={cellBase}>
                    <Input
                      value={cat.id}
                      onChange={(e) =>
                        handleInputChange(realIndex, "id", e.target.value)
                      }
                      placeholder="카테고리 ID"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className={cellBase}>
                    <Input
                      value={cat.name}
                      onChange={(e) =>
                        handleInputChange(realIndex, "name", e.target.value)
                      }
                      placeholder="카테고리 이름"
                      className="h-8 text-sm"
                    />
                  </div>
                </>
              )}

              <div className={`${cellBase} justify-center`}>
                <button
                  onClick={() => handleDelete(realIndex, cat.id)}
                  className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {pageData.length === 0 && (
          <div className="py-12 text-center text-stone-400 text-sm">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
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

      {/* 추가 버튼 */}
      {!categories.some((c) => !c.isSaved) && (
        <div
          onClick={handleAddRow}
          className="cursor-pointer py-4 rounded-xl border border-dashed text-sm text-stone-400 text-center hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-400 transition"
        >
          <Plus className="inline-block mr-1 h-5 w-5" /> 새 카테고리 추가
        </div>
      )}
    </div>
  );
}
