import { getAccountDetail, updateMyAccount } from "@/api/auth-api";
import { getComments } from "@/api/community-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import {
  Calendar,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageIcon,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://192.168.0.20:8080";
const POSTS_PER_PAGE = 5;

const ROLE_STYLE = {
  ADMIN: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-500",
    border: "border-amber-300",
    gradient: "from-amber-400 to-orange-400",
  },
  PLANNER: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-500",
    border: "border-blue-300",
    gradient: "from-blue-400 to-indigo-500",
  },
  WORKER: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
    border: "border-emerald-300",
    gradient: "from-emerald-400 to-teal-500",
  },
};

export default function MyArticlePage() {
  const account = useAccount((s) => s.account);
  const setAccount = useAccount((s) => s.setAccount);
  const { clearAccount } = useAccount();
  const { clearToken } = useToken();
  const token = useToken((s) => s.token);
  const router = useRouter();

  useAuthGuard();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [workedAt, setWorkedAt] = useState("");
  const [preview, setPreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [myPosts, setMyPosts] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const name = account?.name || "사용자";
  const roleStyle = ROLE_STYLE[role] || ROLE_STYLE.WORKER;
  const totalComments = Object.values(commentsMap).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  const totalPages = Math.ceil(myPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = myPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  const handleLogout = () => {
    clearToken();
    clearAccount();
    router.push("/login");
  };

  useEffect(() => {
    if (!account?.accountId || !token) return;
    getAccountDetail(token, account.accountId).then((obj) => {
      setEmail(obj.email || "");
      setRole(obj.role || "");
      setWorkedAt(obj.workedAt || "");
      if (obj.profileImageUrl) {
        const url = obj.profileImageUrl.startsWith("http")
          ? obj.profileImageUrl
          : `${API_BASE_URL}${obj.profileImageUrl}`;
        setPreview(url);
      }
    });
  }, [account?.accountId, token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/notices/myNotice`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(async (posts) => {
        setMyPosts(posts);
        const map = {};
        await Promise.all(
          posts.map(async (p) => {
            try {
              const comments = await getComments(token, p.noticeId);
              map[p.noticeId] = comments;
            } catch {
              map[p.noticeId] = [];
            }
          }),
        );
        setCommentsMap(map);
      })
      .finally(() => setLoadingPosts(false));
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageSave = async () => {
    if (!profileImage) return;
    const formData = new FormData();
    formData.append("profileImage", profileImage);
    await updateMyAccount(account.accountId, formData, token);
    const updated = await getAccountDetail(token, account.accountId);
    setAccount(updated);
    alert("프로필 사진이 변경되었습니다");
  };

  const toggleComments = (postId, e) => {
    e.stopPropagation();
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-stretch">
        {/* ── 왼쪽 프로필 카드 ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div
            className={`h-28 bg-gradient-to-br ${roleStyle.gradient} relative`}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative -mt-14 flex justify-center">
            <div className="relative group">
              <Avatar className="h-28 w-28 ring-4 ring-white shadow-lg">
                <AvatarImage
                  src={preview}
                  alt={name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-slate-200">
                  <ImageIcon size={32} className="text-slate-400" />
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="text-center pt-4 pb-2 px-6">
            <h2 className="text-xl font-bold text-slate-900">{name}</h2>
            <div className="flex justify-center mt-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${roleStyle.dot}`} />
                {role}
              </span>
            </div>
          </div>

          <div className="mx-5 mt-4 rounded-xl bg-slate-50 border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Mail size={16} className="text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  Email
                </p>
                <p className="text-sm text-slate-700 font-medium truncate">
                  {email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <Calendar size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  근무 시작일
                </p>
                <p className="text-sm text-slate-700 font-medium">
                  {workedAt || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <div className="px-5 pt-4 pb-5 mt-2 space-y-2.5">
            {profileImage && (
              <Button
                onClick={handleImageSave}
                className={`w-full rounded-xl bg-gradient-to-r ${roleStyle.gradient} hover:opacity-90 text-white h-11 text-sm font-semibold shadow-md cursor-pointer`}
              >
                프로필 이미지 저장
              </Button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 h-11 text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              <LogOut size={15} />
              로그아웃
            </button>
          </div>
        </div>

        {/* ── 오른쪽: 내가 쓴 글 ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => router.push("/mypage/profile")}
              className="px-8 py-5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              계정 관리
            </button>
            <button className="px-8 py-5 text-sm font-bold text-slate-800 border-b-2 border-slate-800 bg-white -mb-px rounded-t-lg">
              내가 쓴 글
            </button>
          </div>

          <div className="p-6 md:p-10 flex-1 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900">내가 쓴 글</h3>
              <p className="text-sm text-slate-400 mt-1">
                작성한 공지사항과 댓글을 확인할 수 있습니다.
              </p>

              {!loadingPosts && myPosts.length > 0 && (
                <div className="flex gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 border border-sky-100">
                    <FileText size={14} className="text-sky-500" />
                    <span className="text-sm font-bold text-sky-700">
                      {myPosts.length}
                    </span>
                    <span className="text-xs text-sky-500">게시글</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <MessageCircle size={14} className="text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700">
                      {totalComments}
                    </span>
                    <span className="text-xs text-emerald-500">댓글</span>
                  </div>
                </div>
              )}
            </div>

            {/* 로딩 */}
            {loadingPosts && (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">불러오는 중...</span>
                </div>
              </div>
            )}

            {/* 빈 상태 */}
            {!loadingPosts && myPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                  <FileText size={32} className="text-slate-300" />
                </div>
                <p className="font-semibold text-slate-500">
                  작성한 글이 없습니다
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  새로운 글을 작성해보세요.
                </p>
              </div>
            )}

            {/* 게시글 리스트 */}
            {!loadingPosts && myPosts.length > 0 && (
              <div className="flex-1 flex flex-col">
                <div className="rounded-xl border border-slate-200 overflow-hidden flex-1">
                  {paginatedPosts.map((post, index) => {
                    const comments = commentsMap[post.noticeId] || [];
                    const isExpanded = expandedPost === post.noticeId;
                    const globalIndex =
                      (currentPage - 1) * POSTS_PER_PAGE + index;
                    const isLast = index === paginatedPosts.length - 1;

                    return (
                      <div key={post.noticeId}>
                        {/* 게시글 행 */}
                        <div
                          onClick={() =>
                            router.push(`/notice/${post.noticeId}`)
                          }
                          className="flex items-center gap-3 px-5 py-3.5 cursor-pointer group hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-300 w-6 text-center shrink-0">
                            {String(globalIndex + 1).padStart(2, "0")}
                          </span>

                          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                            <FileText size={14} className="text-sky-500" />
                          </div>

                          <p className="flex-1 text-sm font-semibold text-slate-700 truncate group-hover:text-sky-700 transition-colors">
                            {post.title}
                          </p>

                          {comments.length > 0 && (
                            <button
                              onClick={(e) => toggleComments(post.noticeId, e)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 shrink-0"
                            >
                              <MessageCircle size={12} />
                              <span className="text-xs font-semibold">
                                {comments.length}
                              </span>
                              <ChevronDown
                                size={12}
                                className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          )}
                        </div>

                        {/* 댓글 아코디언 */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isExpanded
                              ? "max-h-[400px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="bg-slate-50/60">
                            {comments.map((c, cIdx) => (
                              <div key={c.commentId}>
                                <div
                                  onClick={() =>
                                    router.push(`/notice/${post.noticeId}`)
                                  }
                                  className="flex items-center gap-2.5 py-2.5 cursor-pointer hover:bg-slate-100/60 transition-colors"
                                  style={{
                                    paddingLeft: "4.5rem",
                                    paddingRight: "1.25rem",
                                  }}
                                >
                                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <MessageCircle
                                      size={10}
                                      className="text-emerald-500"
                                    />
                                  </div>
                                  <p className="flex-1 text-xs text-slate-500 truncate">
                                    {c.content}
                                  </p>
                                  <span className="text-[10px] text-slate-400 font-medium shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                    {c.writerName}
                                  </span>
                                </div>
                                {cIdx < comments.length - 1 && (
                                  <Separator className="ml-[4.5rem]" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Separator */}
                        {!isLast && <Separator />}
                      </div>
                    );
                  })}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 pt-5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            setExpandedPost(null);
                          }}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-slate-800 text-white"
                              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
