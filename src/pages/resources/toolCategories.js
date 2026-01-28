import { useState, useEffect, useMemo } from "react";
import { useToken } from "@/stores/account-store";
import {
  getToolCategories,
  createToolCategory,
  deleteToolCategory,
} from "@/api/tool-api";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Plus, Trash2, Save, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";

const GRID_COLS = "grid-cols-[25%_50%_15%_10%]";
const PAGE_SIZE = 10;

export default function ToolCategoryPage() {
  const token = useToken((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const router = useRouter();

  const isProducts = router.pathname === "/resources/products";
  const isTools = router.pathname === "/resources/toolCategories";

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

    if (!newCat.id.trim() || !newCat.name.trim()) {
      alert("ID와 이름을 모두 입력해주세요.");
      return;
    }

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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex gap-7 text-sm font-medium">
          <Link
            href="/resources/products"
            className={isProducts ? "text-indigo-600" : "text-stone-400"}
          >
            품목
          </Link>
          <Link
            href="/resources/toolCategories"
            className={isTools ? "text-indigo-600" : "text-stone-400"}
          >
            카테고리
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="카테고리 검색"
              className="pl-9 w-56 h-9 rounded-xl border-stone-300
                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {categories.some((c) => !c.isSaved) && (
            <Button size="sm" onClick={handleSave}>
              <Save className="mr-1 h-4 w-4" />
              저장
            </Button>
          )}
        </div>
      </div>

      <div
        className={`grid ${GRID_COLS} px-5 py-2.5 bg-slate-200 text-xs font-semibold`}
      >
        <div>ID</div>
        <div>카테고리명</div>
        <div className="text-center">삭제</div>
        <div></div>
      </div>

      <div className="border border-t-0 rounded-b-lg divide-y">
        {pageData.map((cat, index) => {
          const realIndex = (page - 1) * PAGE_SIZE + index;

          return (
            <div
              key={realIndex}
              className={`px-5 py-2.5 transition ${
                cat.isSaved ? "hover:bg-slate-50" : "bg-emerald-50/40"
              }`}
            >
              <div className={`grid ${GRID_COLS} w-full items-center gap-2`}>
                {cat.isSaved ? (
                  <>
                    <div className="text-sm text-stone-500">{cat.id}</div>
                    <div className="text-sm font-medium truncate">
                      {cat.name}
                    </div>
                  </>
                ) : (
                  <>
                    <Input
                      value={cat.id}
                      onChange={(e) =>
                        handleInputChange(realIndex, "id", e.target.value)
                      }
                      placeholder="카테고리 ID"
                      className="h-9 rounded-lg text-sm border-stone-300
                                 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />

                    <Input
                      value={cat.name}
                      onChange={(e) =>
                        handleInputChange(realIndex, "name", e.target.value)
                      }
                      placeholder="카테고리 이름"
                      className="h-9 rounded-lg text-sm border-stone-300
                                 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </>
                )}

                <button
                  onClick={() => handleDelete(realIndex, cat.id)}
                  className="flex justify-center text-stone-300 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {!cat.isSaved && (
                  <span className="text-xs text-emerald-600 font-medium">
                    신규
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />

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

            <PaginationNext
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </PaginationContent>
        </Pagination>
      )}

      {!categories.some((c) => !c.isSaved) && (
        <div
          onClick={handleAddRow}
          className="cursor-pointer py-4 rounded-xl border border-dashed text-sm text-stone-400 text-center
                   hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-400 transition"
        >
          <Plus className="inline-block mr-1 h-5 w-5" />새 카테고리 추가
        </div>
      )}
    </div>
  );
}
