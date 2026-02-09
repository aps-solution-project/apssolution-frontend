import { useEffect, useState, useRef } from "react";
import { getNotices, searchNotice } from "@/api/notice-api";
import { useToken, useAccount } from "@/stores/account-store";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Megaphone,
  Search,
  MegaphoneIcon,
  Plus,
} from "lucide-react";

export default function AnnouncementsPage() {
  const router = useRouter();
  const { token } = useToken();
  const { role } = useAccount();

  const [keyword, setKeyword] = useState("");
  const [notices, setNotices] = useState([]);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!token) return;

    getNotices(token)
      .then((res) => setNotices(res.notices))
      .catch(() => setNotices([]));
  }, [token]);

  // 검색 debounce 적용된 API 호출
  useEffect(() => {
    if (!token) return;

    const fetch = async () => {
      if (keyword.trim()) {
        const res = await searchNotice(token, keyword);
        setNotices(res);
      } else {
        const res = await getNotices(token);
        setNotices(res.notices);
      }
    };

    fetch();
  }, [keyword, token]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 페이지 컨테이너 */}
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <div className="flex justify-between items-end border-b pb-6 border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <MegaphoneIcon size={20} />
              <span className="text-xs font-black uppercase tracking-widest">
                Notice
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              공지사항
            </h1>

            <p className="text-sm text-slate-400 font-medium">
              회사의 주요 소식을 안내합니다. (총{" "}
              <span className="text-slate-600 font-bold">{notices.length}</span>
              건)
            </p>
          </div>
          {token && role?.toUpperCase() !== "WORKER" && (
            <Button
              onClick={() => router.push("/notice/announcements-create")}
              className="h-11 px-10 rounded-full bg-indigo-500 text-white font-bold shadow-sm hover:bg-indigo-700 transition"
            >
              <span>
                <Plus size={16} />
              </span>

              <span>공지 작성</span>
            </Button>
          )}
        </div>

        {/* 검색 */}
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="공지사항을 검색하세요"
              className="
              w-full h-12 pl-12 pr-5
              rounded-full
              bg-white
              border border-slate-200
              shadow-sm
              focus:outline-none
              focus:ring-2 focus:ring-indgo-500
            "
              spellCheck={false}
            />
          </div>
        </div>

        {/* 공지 카드 목록 */}
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-20 text-slate-400">
              <Megaphone className="w-10 h-10 mb-4 opacity-40" />
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            notices.map(
              ({ id, title, writer, createdAt, attachmentCount }) => (
                <article
                  key={id}
                  onClick={() => router.push(`/notice/${id}`)}
                  className="
                  group cursor-pointer
                  rounded-3xl
                  bg-white
                  p-6
                  shadow-sm
                  hover:shadow-xl
                  hover:-translate-y-1
                  transition-all
                "
                >
                  {/* 상단 메타 */}
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                    <span className="font-mono">#{id}</span>
                    <time>{createdAt?.slice(0, 10)}</time>
                  </div>

                  {/* 제목 */}
                  <h2
                    className="
                  text-lg font-bold text-slate-800
                  mb-4 line-clamp-2
                  group-hover:text-indigo-600 transition-colors
                "
                  >
                    {title}
                  </h2>

                  {/* 하단 */}
                  <footer className="flex justify-between items-center text-sm text-slate-600">
                    <span className="font-medium">{writer?.name || "익명"}</span>

                    {attachmentCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold">
                        <Paperclip size={14} />
                        {attachmentCount}
                      </span>
                    )}
                  </footer>
                </article>
              ),
            )
          )}
        </main>
      </div>
    </div>
  );
}
