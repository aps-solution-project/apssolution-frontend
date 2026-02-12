import { useAccount, useToken } from "@/stores/account-store";
import {
  CheckSquare,
  FileText,
  Loader2,
  Megaphone,
  Package,
  Search,
  User,
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
  const { account } = useAccount();
  const userRole = account?.role;
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

  if (userRole === "WORKER") {
    return null;
  }

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
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[999] max-h-[450px] overflow-y-auto custom-scrollbar p-2">
          <SearchSection
            title="Scenarios"
            icon={<FileText size={14} />}
            items={results.scenarios}
            path="/scenarios" // 상세페이지 있음 (/scenarios/[id])
            onLink={handleItemClick}
          />
          <SearchSection
            title="Products"
            icon={<Package size={14} />}
            items={results.products}
            path="/resources/product" // 상세페이지 없음 (조회 경로로만)
            onLink={handleItemClick}
          />
          <SearchSection
            title="Tasks"
            icon={<CheckSquare size={14} />}
            items={results.tasks}
            path="/resources/task" // 상세페이지 없음
            onLink={handleItemClick}
          />
          <SearchSection
            title="Notices"
            icon={<Megaphone size={14} />}
            items={results.notices}
            path="/notice" // 상세페이지 있음 (/notice/[id])
            onLink={handleItemClick}
          />
          <SearchSection
            title="Tools"
            icon={<Wrench size={14} />}
            items={results.tools}
            path="/resources/tool" // 상세페이지 없음
            onLink={handleItemClick}
          />
          <SearchSection
            title="Categories"
            icon={<Search size={14} />}
            items={results.categories} // 백엔드에서 카테고리 결과도 준다면 추가
            path="/resources/tool/category" // 상세페이지 없음
            onLink={handleItemClick}
          />
          <SearchSection
            title="Employees"
            icon={<User size={14} />}
            items={results.accounts} // 백엔드 결과물에 포함된 직원 리스트
            path="/employees" // 이동할 경로
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
          const isEmployee = title === "Employees";
          const itemId = item.id || item.accountId || item.employeeId;

          // 경로 설정
          const detailViewPaths = ["/scenarios", "/notice", "/employees"];
          const isDetail = detailViewPaths.includes(path);
          const targetPath = isDetail ? `${path}/${itemId}` : path;

          // 프로필 이미지 경로 처리
          const rawImg = item.profileImageUrl || item.profileImage;
          const fullImgPath = rawImg
            ? rawImg.startsWith("http")
              ? rawImg
              : `http://192.168.0.20:8080${rawImg}`
            : null;

          return (
            <button
              key={itemId}
              onClick={() => onLink(targetPath)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-all group flex items-center gap-3"
            >
              {/* 직원일 때만 아바타 표시 */}
              {isEmployee && (
                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm">
                  {fullImgPath ? (
                    <img
                      src={fullImgPath}
                      className="w-full h-full object-cover"
                      alt="profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User size={16} />
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 truncate transition-colors">
                    {item.accountName || item.name || item.title}
                  </span>
                  {item.role && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                      {item.role}
                    </span>
                  )}
                </div>

                {/* 이메일 또는 설명문 */}
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {isEmployee
                    ? item.accountEmail || item.email
                    : item.description || item.id}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
