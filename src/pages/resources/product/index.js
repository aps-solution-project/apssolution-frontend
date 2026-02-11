import { getProducts, getProductTasks } from "@/api/product-api";
import {
  Bar,
  BarChart,
  Legend,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
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
import ProcessBarChart from "@/pages/test";

const PAGE_SIZE = 7;
// 🌟 고정 그리드 정의 (마지막 60px는 화살표 공간)
const GRID_COLS = "grid-cols-[180px_160px_1fr_120px_120px_48px]";
const cellBase =
  "px-4 py-3 flex items-center border-r last:border-r-0 min-h-[50px]";

export const getBlueGradient = (index, total) => {
  const start = 190;
  const end = 70;
  const totalCount = total > 1 ? total - 1 : 1;
  const value = Math.round(start - ((start - end) * index) / totalCount);
  return `rgb(${value}, ${value + 40}, 255)`;
};

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
  const [chartMode, setChartMode] = useState("duration");

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

  const isProducts = router.pathname === "/resources/product";
  const isCategories = router.pathname === "/resources/tool/category";
  const isTools = router.pathname === "/resources/tool";
  const isProcesses = router.pathname === "/resources/task";

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
          onClick={() => router.push(`/resources/product/edit`)}
        >
          <Pencil size={16} className="text-indigo-600" />
          <span className="font-bold">데이터 수정</span>
        </Button>
      </div>

      {/* 2. 탭 & 검색 바 */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
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
                  <div className="flex flex-col lg:flex-row items-stretch h-[500px]">
                    {/* 📋 [1/3] 왼쪽 리스트 */}
                    <div className="w-full lg:w-1/3 p-6 border-r border-slate-100">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
                        Related Tasks
                      </div>
                      <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                        {tasksMap[product.id]?.map((task, idx) => (
                          <div
                            key={task.id}
                            className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3"
                          >
                            <div
                              className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{
                                backgroundColor: getBlueGradient(
                                  idx,
                                  tasksMap[product.id].length,
                                ),
                              }}
                            >
                              {task.seq}
                            </div>
                            <span className="font-bold text-slate-800 text-xs">
                              {task.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 📊 [2/3] 오른쪽 차트 컴포넌트 */}
                    <div className="w-full lg:w-2/3 p-6 flex flex-col">
                      {/* 🌟 3. sticky를 활용하면 전체 스크롤을 내려도 차트가 화면에 고정되어 따라오게 할 수 있습니다. */}
                      <div className="sticky top-6 flex-1 min-h-[400px]">
                        <ProcessBarChart
                          productName={product.name}
                          tasks={tasksMap[product.id] || []}
                        />
                      </div>
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
