import { useToken } from "@/stores/account-store";
import {
  CheckSquare,
  FileText,
  Loader2,
  Megaphone,
  Package,
  Search,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useToken();
  const router = useRouter();
  const searchRef = useRef(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 검색 API 호출 (디바운스 적용)
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await fetch(
          `http://192.168.0.20:8080/api/search?keyword=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await resp.json();
        setResults(data);
        setIsOpen(true);
      } catch (e) {
        console.error("검색 실패", e);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, token]);

  const handleItemClick = (path) => {
    router.push(path);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div
      className="relative w-full max-w-lg transition-all duration-300"
      ref={searchRef}
    >
      <div className="relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="통합 검색 (시나리오, 제품, 공지사항...)"
          className="w-full bg-slate-100/50 border-none rounded-2xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-300"
            size={16}
          />
        )}
      </div>

      {/* 결과 드롭다운 */}
      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] max-h-[450px] overflow-y-auto custom-scrollbar p-2">
          <SearchSection
            title="Scenarios"
            icon={<FileText size={14} />}
            items={results.scenarios}
            path="/scenarios"
            onLink={handleItemClick}
          />
          <SearchSection
            title="Products"
            icon={<Package size={14} />}
            items={results.products}
            path="/products"
            onLink={handleItemClick}
          />
          <SearchSection
            title="Tasks"
            icon={<CheckSquare size={14} />}
            items={results.tasks}
            path="/tasks"
            onLink={handleItemClick}
          />
          <SearchSection
            title="Notices"
            icon={<Megaphone size={14} />}
            items={results.notices}
            path="/notice"
            onLink={handleItemClick}
          />
          <SearchSection
            title="Tools"
            icon={<Wrench size={14} />}
            items={results.tools}
            path="/resources/tools"
            onLink={handleItemClick}
          />
          {Object.values(results).every((arr) => !arr || arr.length === 0) && (
            <div className="p-8 text-center text-slate-400 text-sm">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchSection({ title, icon, items, path, onLink }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
        {icon} {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          // 🌟 Tools처럼 상세 페이지가 없는 경우 처리
          // path가 '/resources/tools'라면 id를 붙이지 않고 이동
          const targetPath =
            path === "/resources/tools"
              ? `${path}?highlight=${item.id}` // 쿼리 파라미터 추가
              : `${path}/${item.id}`;
          return (
            <button
              key={item.id}
              onClick={() => onLink(targetPath)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">
                {item.title || item.name || item.id}
                {item.category?.name && (
                  <span className="ml-2 text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded uppercase">
                    {item.category.name}
                  </span>
                )}
              </div>
              {item.description && (
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {item.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
