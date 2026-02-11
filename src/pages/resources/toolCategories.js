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
import { Brain, Plus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

/** 다른 리소스 페이지들과 동일한 컬럼 결 */
const GRID_COLS = "grid-cols-[30%_55%_15%]";
const cellBase =
  "px-4 py-2.5 flex items-center border-r last:border-r-0 min-h-[50px]";

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
      {/* 🌟 1. 헤더 (통일 완료) */}
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
            도구를 분류하는 카테고리를 관리합니다.
          </p>
        </div>

        <div className="flex gap-2">
          {categories.some((c) => !c.isSaved) && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-6 shadow-lg shadow-emerald-100 transition-all gap-2"
              onClick={handleSave}
            >
              <Save size={18} /> <span className="font-bold">저장하기</span>
            </Button>
          )}
        </div>
      </div>

      {/* 🌟 2. 탭 및 검색 바 (이 부분을 다른 페이지와 동일하게 수정) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-fit">
          {[
            { name: "공정", href: "/resources/tasks", active: isProcesses },
            { name: "품목", href: "/resources/products", active: isProducts },
            { name: "도구", href: "/resources/tools", active: isTools },
            {
              name: "카테고리",
              href: "/resources/toolCategories",
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
            placeholder="ID 또는 카테고리명 검색..."
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* 🌟 3. 표 영역 */}
      <div className="border rounded-2xl overflow-hidden shadow-sm bg-white border-slate-200">
        <div
          className={`grid ${GRID_COLS} bg-slate-50 text-[11px] font-black text-slate-500 border-b border-slate-100 uppercase tracking-wider`}
        >
          <div className={`${cellBase} py-3`}>카테고리 ID</div>
          <div className={`${cellBase} py-3`}>카테고리명</div>
          <div className={`${cellBase} py-3 justify-center`}>삭제</div>
        </div>

        {pageData.map((cat, index) => {
          const realIndex = (page - 1) * PAGE_SIZE + index;
          return (
            <div
              key={realIndex}
              className={cn(
                `grid ${GRID_COLS} text-sm border-b last:border-b-0 transition-colors border-slate-100`,
                cat.isSaved ? "hover:bg-slate-50/80" : "bg-indigo-50/30",
              )}
            >
              {cat.isSaved ? (
                <>
                  <div
                    className={`${cellBase} text-slate-400 font-mono text-xs`}
                  >
                    {cat.id}
                  </div>
                  <div className={`${cellBase} font-bold text-slate-800`}>
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
                      placeholder="ID 입력"
                      className="h-8 text-sm rounded-lg border-indigo-200 focus:ring-indigo-500"
                    />
                  </div>
                  <div className={cellBase}>
                    <Input
                      value={cat.name}
                      onChange={(e) =>
                        handleInputChange(realIndex, "name", e.target.value)
                      }
                      placeholder="이름 입력"
                      className="h-8 text-sm rounded-lg border-indigo-200 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className={`${cellBase} justify-center`}>
                <button
                  onClick={() => handleDelete(realIndex, cat.id)}
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {pageData.length === 0 && (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">
            검색 결과가 없습니다.
          </div>
        )}
      </div>

      {/* 🌟 4. 하단 영역 (추가 버튼 & 페이지네이션) */}
      <div className="space-y-6">
        {!categories.some((c) => !c.isSaved) && (
          <button
            onClick={handleAddRow}
            className="w-full py-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 bg-white"
          >
            <Plus size={20} /> 새 카테고리 추가
          </button>
        )}

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
    </div>
  );
}
