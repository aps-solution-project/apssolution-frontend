import { getProducts, getProductTasks } from "@/api/product-api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useToken } from "@/stores/account-store";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import SearchBar from "@/components/layout/SearchBar";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 10;
const GRID_COLS_HEADER = "grid-cols-[20%_15%_40%_10%_10%]";
const GRID_COLS = "grid-cols-[20%_15%_40%_10%_10%]";

export default function ResourcesPage() {
  useAuthGuard(); // <-- 페이지 접근시 토큰 인증

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
    if (!token) {
      console.warn("fetchProducts blocked: no token");
      return;
    }

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
    setTasksMap((prev) => ({
      ...prev,
      [productId]: data.tasks || [],
    }));
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const processed = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()),
    );

    return filtered.sort((a, b) => {
      const v1 = a[sortKey];
      const v2 = b[sortKey];
      if (v1 > v2) return sortDir === "asc" ? 1 : -1;
      if (v1 < v2) return sortDir === "asc" ? -1 : 1;
      return 0;
    });
  }, [products, search, sortKey, sortDir]);

  const totalPages = Math.ceil(processed.length / PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, page]);

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
            onClick={() => router.push(`/products`)}
            className="flex gap-1"
          >
            <Pencil size={14} />
            수정
          </Button>
        </div>
      </div>

      <div
        className={`grid ${GRID_COLS_HEADER}  px-6 py-3 bg-slate-200 text-xs font-semibold`}
      >
        <Header label="ID" onClick={() => toggleSort("id")} />
        <Header label="제품명" onClick={() => toggleSort("name")} />
        <Header label="설명" onClick={() => toggleSort("description")} />
        <Header label="유통상태" onClick={() => toggleSort("active")} />
        <Header label="등록일" onClick={() => toggleSort("createdAt")} />
      </div>

      <Accordion type="multiple" className="border border-t-0 rounded-b-lg">
        {loading && (
          <div className="py-10 text-center text-stone-400">불러오는 중...</div>
        )}

        {!loading &&
          pageData.map((product) => (
            <AccordionItem
              key={product.id}
              value={String(product.id)}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger
                onClick={() => {
                  setSelectedId(product.id);
                  loadTasks(product.id);
                }}
                className={`px-6 py-3 transition ${
                  selectedId === product.id
                    ? "bg-indigo-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`grid ${GRID_COLS} w-full text-sm items-center`}
                >
                  <div className="text-stone-500">{product.id}</div>
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-stone-500 truncate pr-3">
                    {product.description}
                  </div>
                  <div>
                    {product.active ? (
                      <span className="text-emerald-600 text-xs font-medium">
                        ● Active
                      </span>
                    ) : (
                      <span className="text-rose-500 text-xs font-medium">
                        ● Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-stone-400 text-xs">
                    {product.createdAt?.slice(0, 10)}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="bg-slate-50/40">
                {tasksMap[product.id]?.map((task) => (
                  <div
                    key={task.id}
                    className="mx-6 my-2 bg-white rounded-lg px-4 py-3 shadow-sm flex justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {task.seq}. {task.name}
                      </div>
                      <div className="text-xs text-stone-600">
                        {task.description}
                      </div>
                    </div>

                    <div className="text-xs text-stone-500 text-right space-y-1">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                        Tool {task.toolCategoryId}
                      </span>
                      <div className="px-2 py-1 text-stone-700">
                        {task.duration} 분
                      </div>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>

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

function Header({ label, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-1 cursor-pointer hover:text-indigo-600 select-none"
    >
      {label}
    </div>
  );
}
