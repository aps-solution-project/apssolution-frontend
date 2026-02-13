const BACKEND_URL = `${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}`;
import {
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { createAccount, deleteAccount, getAllAccounts } from "@/api/auth-api";
import AdminProfileEditModal from "@/components/layout/modal/adminProfileSetting";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { cn } from "@/lib/utils";
import { useAccount, useToken } from "@/stores/account-store";
import { useRouter } from "next/router";

export default function ManagementPage() {
  useAuthGuard();

  const token = useToken((state) => state.token);
  const loginAccount = useAccount((state) => state.account);
  const router = useRouter();

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 페이징 상태
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const [profileOpen, setProfileOpen] = useState(false);
  const [target, setTarget] = useState({});

  const [newAccount, setNewAccount] = useState({
    name: "",
    email: "",
    role: "WORKER",
  });

  if (!loginAccount) return null;

  const userRole = loginAccount.role;
  const isAdmin = userRole === "ADMIN";
  const isPlanner = userRole === "PLANNER";
  const isWorker = userRole === "WORKER";

  if (loginAccount?.role === "WORKER") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <X className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">접근 권한 제한</h2>
        <p className="text-slate-500 font-medium text-center">
          사원 관리 페이지는 관리자(ADMIN) 및 플래너 전용 구역입니다.
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

  /* =========================
     데이터 로딩 & 이벤트 (기능 유지)
  ========================= */

  useEffect(() => {
    if (!token) return;
    fetchAccounts();
  }, [token]);

  const fetchAccounts = async () => {
    const res = await getAllAccounts(token);
    setData(res.accounts);
  };

  const handleSave = async () => {
    if (!isAdmin) return alert("ADMIN만 가능합니다.");
    setIsSaving(true);
    try {
      const res = await createAccount(
        {
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role,
        },
        token,
      );

      // 🌟 서버 응답 데이터에 isNew 플래그 주입
      const newMember = { ...res, isNew: true };

      // 리스트 최상단에 추가
      setData((prev) => [newMember, ...prev]);

      alert(
        "사원 계정이 생성되었습니다.\n임시 비밀번호는 이메일로 발송되었습니다.",
      );
      setIsAdding(false);
      setNewAccount({ name: "", email: "", role: "WORKER" });
    } catch (err) {
      alert("계정 생성 실패: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (accountId) => {
    if (!isAdmin) return alert("ADMIN만 가능합니다.");
    if (!confirm("정말 퇴사 처리하시겠습니까?")) return;

    await deleteAccount(accountId, token);
    setData((prev) =>
      prev.map((item) =>
        item.accountId === accountId
          ? { ...item, resignedAt: new Date().toISOString() }
          : item,
      ),
    );
  };

  const handleRefresh = async () => {
    try {
      // 🌟 서버에서 최신 목록 가져오기 (이미 정의된 getAccounts 등 사용)
      const res = await getAllAccounts(token);
      setData(res.accounts || []); // 정렬된 순수 데이터로 교체
    } catch (err) {
      console.error("새로고침 실패:", err);
    }
  };

  /* =========================
     검색 및 페이징 계산
  ========================= */

  const filteredData = data.filter(
    (item) =>
      item.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.accountName.includes(searchTerm),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage - (isAdding ? 1 : 0),
  );

  const roleColor = {
    ADMIN: "bg-yellow-500 text-white border-none",
    PLANNER: "bg-blue-500 text-white border-none",
    WORKER: "bg-emerald-500 text-white border-none",
  };

  /* =========================
     상세 조회 핸들러 (상단 분리)
  ========================= */
  const handleOpenDetail = (account) => {
    // 1. 이미지 경로 가공
    const rawPath = account.profileImageUrl || account.profileImage;
    const fullPath = rawPath
      ? rawPath.startsWith("http")
        ? rawPath
        : `${BACKEND_URL}${rawPath}`
      : null;

    // 2. 모달이 기대하는 데이터 구조(account.id)로 매핑
    setTarget({
      id: account.accountId,
      name: account.accountName, // 🌟 필드명 체크
      email: account.accountEmail,
      role: account.role,
      workedAt: account.workedAt,
      resignedAt: account.resignedAt,
      profileImageUrl: fullPath,
    });
    setProfileOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* 🌟 게시판 스타일 통일 헤더 */}
      <div className="flex justify-between items-end border-b pb-3 border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Users size={20} />
            <span className="text-xs font-black uppercase tracking-widest">
              Human Resources
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            사원 관리
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            총{" "}
            <span className="text-slate-600 font-bold">
              {filteredData.length}
            </span>{" "}
            명의 사원
          </p>
        </div>
        <div className="flex justify-end gap-5">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="h-12 w-12 rounded-xl border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
          >
            <RefreshCw size={20} />
          </Button>

          {isAdmin && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:scale-95 gap-2"
              onClick={() => setIsAdding(true)}
            >
              <UserPlus size={18} />
              <span className="font-bold">사원 추가</span>
            </Button>
          )}
        </div>
      </div>
      {/* 검색 바 */}
      <div className="relative w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="사원번호 또는 이름"
          className="pl-8 rounded-xl"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <AdminProfileEditModal
        setData={setData}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        account={target}
      />
      {/* 카드 그리드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 추가 모드 카드 */}
        {isAdding && (
          <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/30">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-20 h-24 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <User className="w-10 h-10 text-slate-200" />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="이름"
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, name: e.target.value })
                    }
                    className="h-8"
                  />
                  <Input
                    placeholder="이메일"
                    value={newAccount.email}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, email: e.target.value })
                    }
                    className="h-8"
                  />
                  <select
                    className="w-full border rounded-md h-8 text-sm px-1"
                    value={newAccount.role}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, role: e.target.value })
                    }
                  >
                    <option value="WORKER">WORKER</option>
                    <option value="PLANNER">PLANNER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-indigo-600"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "저장"
                  )}
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 사원 카드 리스트 */}
        {currentItems.map((account) => {
          const isResigned = !!account.resignedAt;

          const imgRaw = account.profileImageUrl || account.profileImage;
          const fullImgPath = imgRaw
            ? imgRaw.startsWith("http")
              ? imgRaw
              : `${BACKEND_URL}${imgRaw}`
            : null;

          return (
            <Card
              key={account.accountId}
              className={cn(
                "relative transition-all duration-300 hover:shadow-xl border-slate-200", // 🌟 overflow-hidden 삭제
                isResigned && "grayscale opacity-80 bg-slate-50",
              )}
            >
              {account.isNew && (
                <div className="absolute -top-2 -right-2 z-30">
                  <span className="bg-[#eab308] text-white text-[12px] font-black px-3 py-1 rounded-full shadow-md border border-white animate-pulse">
                    New
                  </span>
                </div>
              )}

              {isResigned && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <div className="border-4 border-red-600/30 px-4 py-2 text-red-600/30 text-4xl font-black uppercase tracking-tighter rotate-12 border-double rounded-lg">
                    Voided
                  </div>
                </div>
              )}

              <CardContent className="p-0">
                <div className="flex h-44">
                  <div className="w-32 flex flex-col items-center justify-center border-r border-slate-300 p-3 gap-2">
                    <div className="w-24 h-28 bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center">
                      {fullImgPath ? (
                        <img
                          src={fullImgPath}
                          className="w-full h-full object-cover"
                          alt="profile"
                          onError={(e) => {
                            e.currentTarget.src = "";
                          }}
                        />
                      ) : (
                        <img
                          src="/images/default-profile.png"
                          className="w-full h-full object-cover opacity-20" // 디폴트 느낌을 주려면 투명도 조절 가능
                          alt="default profile"
                        />
                      )}
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] px-2 py-0 h-4",
                        roleColor[account.role],
                      )}
                    >
                      {account.role}
                    </Badge>
                  </div>

                  <div className="flex-1 p-5 relative flex flex-col justify-between">
                    <div className="absolute top-2 right-2">
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>관리</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDetail(account)}
                            >
                              상세 정보
                            </DropdownMenuItem>
                            {!isResigned && isAdmin && (
                              <DropdownMenuItem
                                className="text-red-600 font-bold"
                                onClick={() => handleDelete(account.accountId)}
                              >
                                퇴사 처리
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-indigo-500/60 tracking-widest uppercase">
                        {account.accountId}
                      </span>
                      <h3 className="text-xl font-black text-slate-800 truncate">
                        {account.accountName}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {account.accountEmail}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-dashed border-slate-400 flex items-center justify-between">
                      <div className="text-[10px]">
                        <p className="text-slate-400 font-bold tracking-tighter uppercase">
                          Joined Date
                        </p>
                        <p className="text-slate-900 font-bold">
                          {account.workedAt
                            ? new Date(account.workedAt).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      {isResigned ? (
                        <Badge
                          variant="secondary"
                          className="bg-stone-200 text-stone-500 border-none text-[10px]"
                        >
                          퇴직
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                          재직중
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 하단 페이징 처리 */}
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
