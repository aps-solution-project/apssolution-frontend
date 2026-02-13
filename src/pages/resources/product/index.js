import { getProducts, getProductTasks } from "@/api/product-api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import { Brain, Pencil, X } from "lucide-react";
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
  const loginAccount = useAccount((state) => state.account);

  const fetchProducts = async () => {
    if (!token || loginAccount?.role === "WORKER") return;
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
    // loginAccount 정보가 들어올 때까지 기다렸다가 호출
    if (loginAccount) {
      fetchProducts();
    }
  }, [token, loginAccount?.role]);

  if (!loginAccount) return null;

  const userRole = loginAccount.role;

  if (loginAccount?.role === "WORKER") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <X className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">접근 권한 제한</h2>
        <p className="text-slate-500 font-medium text-center">
          품목 페이지는 관리자(ADMIN) 및 플래너 전용 구역입니다.
          <br />
          권한이 필요하시다면 관리자에게 문의하세요.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-xl"
        >
          메인으로 돌아가기
        </Button>
      </div>
    );
  }

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
            { name: "품목", href: "/resources/product", active: isProducts },
            { name: "공정", href: "/resources/task", active: isProcesses },
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
                  <div className="flex flex-col lg:flex-row items-stretch h-[550px]">
                    {/* 📋 [1/3] 왼쪽 리스트 영역 */}
                    <div className="w-full lg:w-1/3 p-6 border-r border-slate-100 flex flex-col">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">
                        Related Tasks Details
                      </div>

                      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                        {/* 데이터가 있고, 배열의 길이가 0보다 큰 경우에만 map 실행 */}
                        {tasksMap[product.id] &&
                        tasksMap[product.id].length > 0 ? (
                          tasksMap[product.id].map((task, idx) => (
                            <div
                              key={task.id}
                              className="bg-white rounded-xl p-4 border border-slate-100 flex flex-col gap-3 shadow-sm hover:border-indigo-200 transition-all group"
                            >
                              {/* 상단: 순번, 이름, 카테고리 */}
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                                  style={{
                                    backgroundColor: getBlueGradient(
                                      idx,
                                      tasksMap[product.id].length,
                                    ),
                                  }}
                                >
                                  {task.seq}
                                </div>
                                <span className="font-bold text-slate-800 text-xs truncate flex-1">
                                  {task.name}
                                </span>
                                <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">
                                  {task.toolCategoryId}
                                </span>
                              </div>

                              {/* 하단: 시간/인원 정보 */}
                              <div className="flex items-center justify-between border-t pt-2 border-slate-50">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50/50 py-0.5 rounded px-1">
                                    <span>⏱</span>
                                    <span>{task.duration}분</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50/50 py-0.5 rounded px-1">
                                    <span>👤</span>
                                    <span>{task.requiredWorkers}명</span>
                                  </div>
                                </div>
                                {task.description && (
                                  <div className="text-[9px] text-slate-400 truncate max-w-[100px]">
                                    {task.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          /* 🌟 데이터가 없을 때: 통일감 있는 "없음" UI */
                          <div className="flex flex-col items-center justify-center py-20 h-full text-center">
                            <div className="bg-slate-50 p-3 rounded-full mb-3 shadow-sm border border-slate-100">
                              <div className="text-slate-300 text-xl">📋</div>
                            </div>
                            <div className="text-slate-400 text-[13px] font-bold tracking-tight">
                              등록된 공정이 없습니다.
                            </div>
                            <p className="text-slate-300 text-[11px] mt-1">
                              해당 품목에 연결된 작업 단계가 존재하지 않습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 📊 [2/3] 오른쪽 차트 영역 (기존 유지) */}
                    <div className="w-full lg:w-2/3 p-6 flex flex-col">
                      <div className="sticky top-6 flex-1 h-[500px]">
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
        <div className="flex justify-center pb-10">
          <Pagination>
            <PaginationContent>
              {/* 이전 버튼 */}
              <PaginationItem>
                <PaginationPrevious
                  className={cn(
                    "cursor-pointer",
                    page === 1 && "pointer-events-none opacity-50",
                  )}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>

              {/* 페이지 번호 로직 */}
              {(() => {
                const maxButtons = 5; // 한 번에 보여줄 버튼 개수
                let start = Math.max(1, page - Math.floor(maxButtons / 2));
                let end = Math.min(totalPages, start + maxButtons - 1);

                // 끝 페이지에 걸렸을 때 시작 페이지 역보정
                if (end - start + 1 < maxButtons) {
                  start = Math.max(1, end - maxButtons + 1);
                }

                return Array.from(
                  { length: end - start + 1 },
                  (_, i) => start + i,
                ).map((pageNum) => (
                  <PaginationItem key={pageNum} className="cursor-pointer">
                    <PaginationLink
                      isActive={page === pageNum}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ));
              })()}

              {/* 다음 버튼 */}
              <PaginationItem>
                <PaginationNext
                  className={cn(
                    "cursor-pointer",
                    page === totalPages && "pointer-events-none opacity-50",
                  )}
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
