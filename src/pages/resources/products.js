import { getProducts, getProductTasks } from "@/api/product-api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useToken } from "@/stores/account-store";
import { Brain, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import SearchBar from "@/components/layout/SearchBar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 7;
// 🌟 고정 그리드 정의 (마지막 60px는 화살표 공간)
const GRID_COLS = "grid-cols-[160px_180px_1fr_120px_120px_48px]";
const cellBase =
  "px-4 py-3 flex items-center border-r last:border-r-0 min-h-[50px]";

export default function ResourcesPage() {
  useAuthGuard();

  const [tasksMap, setTasksMap] = useState({});
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = useToken((state) => state.token);
  const router = useRouter();

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getProducts(token);
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isProducts = router.pathname === "/resources/products";
  const isCategories = router.pathname === "/resources/toolCategories";
  const isTools = router.pathname === "/resources/tools";
  const isProcesses = router.pathname === "/resources/tasks";

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const loadTasks = async (productId) => {
    if (tasksMap[productId]) return;
    const data = await getProductTasks(productId, token);
    setTasksMap((prev) => ({ ...prev, [productId]: data.tasks || [] }));
  };

  const processed = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, search]);

  const totalPages = Math.ceil(processed.length / PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [page, totalPages]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, page]);

  return (
    <div className="space-y-4">
      {/* 1. 상단 헤더 영역 */}
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
            시뮬레이션의 기본 모델이 되는 품목(Product) 정보를 관리합니다.
          </p>
        </div>
        <Button
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-6 shadow-sm transition-all gap-2"
          onClick={() => router.push(`/products`)}
        >
          <Pencil size={16} className="text-indigo-600" />
          <span className="font-bold">데이터 수정</span>
        </Button>
      </div>

      {/* 2. 탭 & 검색 바 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {[
            {
              name: "카테고리",
              href: "/resources/toolCategories",
              active: isCategories,
            },
            { name: "도구", href: "/resources/tools", active: isTools },
            { name: "품목", href: "/resources/products", active: isProducts },
            { name: "공정", href: "/resources/tasks", active: isProcesses },
          ].map((tab) => (
            <Link key={tab.href} href={tab.href}>
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
            placeholder="품목명 검색..."
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* 🌟 3. 테이블 영역 (정렬 완전 고정) */}
      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm border-slate-200">
        <div
          className={cn(
            "grid bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase",
            GRID_COLS,
          )}
        >
          <div className={cn(cellBase, "pl-6")}>품목 ID</div>
          <div className={cellBase}>제품명</div>
          <div className={cellBase}>설명</div>
          <div className={cn(cellBase, "justify-center")}>유통상태</div>
          <div className={cn(cellBase, "justify-center")}>등록일</div>
          <div className="flex items-center justify-center"></div>
        </div>

        <Accordion type="multiple">
          {!loading &&
            pageData.map((product) => (
              <AccordionItem
                key={product.id}
                value={String(product.id)}
                className="border-b border-slate-100 last:border-b-0"
              >
                <AccordionTrigger
                  className={cn(
                    "p-0 hover:no-underline transition-all hover:bg-slate-50/50",
                    "[&[data-state=open]>div]:bg-indigo-50/30",
                    "relative flex-1 [&>svg]:absolute [&>svg]:right-4", // 🌟 아이콘을 절대 위치(absolute)로 고정
                  )}
                  onClick={() => {
                    setSelectedId(product.id);
                    loadTasks(product.id);
                  }}
                >
                  <div
                    className={cn(
                      "grid w-full text-xs text-left items-stretch",
                      GRID_COLS,
                    )}
                  >
                    <div
                      className={cn(
                        cellBase,
                        "pl-6 font-mono text-[11px] text-slate-400 truncate",
                      )}
                    >
                      {product.id}
                    </div>
                    <div
                      className={cn(
                        cellBase,
                        "font-bold text-slate-800 truncate",
                      )}
                    >
                      {product.name}
                    </div>
                    <div className={cn(cellBase, "text-slate-500 truncate")}>
                      {product.description || "-"}
                    </div>
                    <div className={cn(cellBase, "justify-center")}>
                      <span
                        className={cn(
                          "text-[9px] font-bold px-2.5 py-1 rounded-full border shadow-sm",
                          product.active
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-slate-50 text-slate-400 border-slate-200",
                        )}
                      >
                        {product.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div
                      className={cn(
                        cellBase,
                        "justify-center text-slate-400 font-medium whitespace-nowrap",
                      )}
                    >
                      {product.createdAt?.slice(0, 10)}
                    </div>
                    {/* 마지막 그리드 칸: 여기 위에 absolute로 고정된 화살표가 놓임 */}
                    <div className="flex items-center justify-center min-h-[52px]"></div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="bg-slate-50/30 border-t border-slate-100/50 p-0">
                  {" "}
                  {/* 패딩을 내부로 이동 */}
                  <div className="p-6">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
                      Related Tasks
                    </div>

                    {/* 🌟 내부 스크롤 영역: max-h로 높이 제한 및 스크롤바 커스텀 */}
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                      {tasksMap[product.id]?.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex justify-between items-center hover:border-indigo-200 transition-all"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {task.seq}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">
                                {task.name}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-md">
                                {task.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 font-bold">
                            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase">
                              {task.toolCategoryId}
                            </span>
                            <div className="text-[11px] text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100 whitespace-nowrap">
                              ⏱ {task.duration}분 / 👤 {task.requiredWorkers}명
                            </div>
                          </div>
                        </div>
                      ))}
                      {tasksMap[product.id]?.length === 0 && (
                        <div className="text-center py-10 text-slate-400 text-xs">
                          연결된 공정 정보가 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>

      {/* 4. 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2 pb-10">
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
