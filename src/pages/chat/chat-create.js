import { getActiveAccounts } from "@/api/auth-api";
import { createGroupChat, startDirectChat } from "@/api/chat-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAccount, useToken } from "@/stores/account-store";
import { ChevronLeft, Loader2, Search, User2, X } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CreateChatPage() {
  const router = useRouter();
  const { token } = useToken();
  const { account } = useAccount();

  const [users, setUsers] = useState([]); // 전체 사원 리스트
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]); // 선택된 유저들
  const [roomName, setRoomName] = useState(""); // 그룹 채팅 방 이름

  const SERVER_URL = "http://192.168.0.20:8080"; // 프로필 이미지 경로
  const DEFAULT_IMAGE = "/images/default-profile.png"; // 디폴트 이미지 경로

  // 1. 페이지 로드 시 사원 목록 가져오기
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    getActiveAccounts(token)
      .then((data) => {
        const otherUsers = data.filter(
          (u) => u.accountId !== account?.accountId,
        );
        setUsers(otherUsers);
      })
      .catch((err) => {
        console.error(err);
        alert("사원 목록을 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [token, account]);

  const toggleUser = (user) => {
    if (selectedUsers.find((u) => u.accountId === user.accountId)) {
      setSelectedUsers(
        selectedUsers.filter((u) => u.accountId !== user.accountId),
      );
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // 2. 채팅방 생성 핸들러
  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    try {
      let result;
      if (selectedUsers.length === 1) {
        // 1:1 채팅 API 호출
        result = await startDirectChat(token, selectedUsers[0].accountId);
      } else {
        // 그룹 채팅 API 호출 (방 이름이 없으면 참여자 이름들로 자동 생성)
        //const defaultName = `${selectedUsers.map((u) => u.accountName).join(", ")} 정담방`;
        result = await createGroupChat(token, {
          //roomName: roomName || defaultName,
          roomName: roomName,
          members: selectedUsers.map((u) => u.accountId),
        });
      }

      // 생성된 채팅방 ID로 이동 (백엔드 DTO 필드명 확인: chatRoomId 또는 id)
      const targetId = result.chatRoomId || result.id;
      router.push(`/chat/${targetId}`);
    } catch (e) {
      console.error(e);
      alert("채팅방 생성 중 오류가 발생했습니다.");
    }
  };

  // 검색 필터링
  const filteredUsers = users.filter((u) => {
    // 1. 검색어를 소문자로 변환 (대소문자 구분 방지)
    const searchTerm = search.toLowerCase();

    // 2. 이름 검색 (소문자 변환 후 비교)
    const nameMatch = (u.name || "").toLowerCase().includes(searchTerm);

    // 3. 사원 번호 검색 (소문자 변환 후 비교)
    const idMatch = (u.accountId || "").toLowerCase().includes(searchTerm);

    // 이름이나 사원 번호 중 하나라도 일치하면 결과에 포함
    return nameMatch || idMatch;
  });

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-[85vh] shadow-lg border rounded-2xl flex flex-col overflow-hidden my-4">
      {/* 헤더 */}
      <div className="p-5 border-b flex items-center justify-between bg-slate-50/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800">새 대화 시작</h1>
        </div>
        <Button
          disabled={selectedUsers.length === 0}
          onClick={handleCreateChat}
          className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 transition-all"
        >
          {selectedUsers.length > 1 ? "그룹 채팅" : "시작하기"}
        </Button>
      </div>

      {/* 검색 바 */}
      <div className="p-5 relative">
        <Search className="absolute left-9 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder="이름으로 사원 검색..."
          className="pl-11 py-6 bg-slate-50 border-none rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 상단 설정 영역: min-h를 주어 리스트 밀림 현상 방지 */}
      <div className="border-b bg-slate-50/50 min-h-[145px] flex flex-col justify-center transition-all">
        {selectedUsers.length > 0 ? (
          <div className="p-5 space-y-4 animate-in fade-in duration-300">
            {/* 1. 선택된 인원 요약 */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {selectedUsers.map((user) => (
                <div
                  key={user.accountId}
                  className="flex items-center gap-1.5 bg-white border border-indigo-200 px-3 py-1.5 rounded-full text-sm text-indigo-600 shadow-sm shrink-0 
               animate-in fade-in zoom-in-90 slide-in-from-left-2 duration-300 ease-out"
                >
                  <span className="font-medium">{user.name}</span>
                  <X
                    className="size-3.5 cursor-pointer hover:text-red-500"
                    onClick={() => toggleUser(user)}
                  />
                </div>
              ))}
            </div>

            {/* 2. 그룹 채팅 설정: 공간을 미리 차지하도록 구성 */}
            <div className="min-h-[60px]">
              {selectedUsers.length > 1 ? (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">
                    채팅방 이름 설정
                  </label>
                  <Input
                    placeholder="대화방 이름을 정해주세요 (선택)"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="bg-white border-slate-200 focus-visible:ring-indigo-500 h-10 shadow-sm"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400 ml-1 mt-6 italic">
                  사원을 한 명 더 선택하면 그룹 채팅이 가능합니다.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* 멤버 미선택 시 가이드: 이 영역 덕분에 리스트가 위로 붙지 않음 */
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-60 animate-in fade-in">
            <User2 className="size-8 mb-1.5 stroke-[1.5px]" />
            <p className="text-sm">대화할 상대를 목록에서 선택하세요.</p>
          </div>
        )}
      </div>

      {/* 사원 리스트 영역 */}
      <div className="flex-1 overflow-y-auto px-2 pb-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Loader2 className="animate-spin mb-2" />
            <p className="text-sm">목록을 가져오는 중...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.accountId}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                selectedUsers.find((u) => u.accountId === user.accountId)
                  ? "bg-indigo-50/50"
                  : "hover:bg-slate-50"
              }`}
              onClick={() => toggleUser(user)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="size-11 border shadow-sm">
                  <AvatarImage
                    src={
                      user.profileImageUrl
                        ? `${SERVER_URL}${user.profileImageUrl}`
                        : DEFAULT_IMAGE
                    }
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-slate-100 text-slate-400">
                    <User2 className="size-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-slate-800">
                    {user.accountId} · {user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user.role} · {user.email}
                  </p>
                </div>
              </div>
              <Checkbox
                checked={
                  !!selectedUsers.find((u) => u.accountId === user.accountId)
                }
                onCheckedChange={() => toggleUser(user)}
                className="rounded-full size-5 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-slate-400 text-sm">
            검색 결과와 일치하는 사원이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
