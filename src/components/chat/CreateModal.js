import { getActiveAccounts } from "@/api/auth-api";
import { createGroupChat, startDirectChat } from "@/api/chat-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAccount, useToken } from "@/stores/account-store";
import { Loader2, Search, User2, X, MessagesSquare, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CreateChatModal({ onClose }) {
  const router = useRouter();
  const { token } = useToken();
  const { account } = useAccount();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const SERVER_URL = "http://192.168.0.20:8080";
  const DEFAULT_IMAGE = "/images/default-profile.png";

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

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    setIsCreating(true);

    try {
      // 🌟 1:1 채팅
      if (selectedUsers.length === 1) {
        const targetId = `new_direct_${selectedUsers[0].accountId}`;
        const targetName = selectedUsers[0].name;

        onClose();
        router.push({
          pathname: "/chat",
          query: {
            chatId: targetId,
            targetName: targetName,
          },
        });
      } else {
        const memberIds = selectedUsers.map((u) => u.accountId);

        // 기존 API 사용: createGroupChat
        const result = await createGroupChat(token, {
          roomName:
            roomName.trim() || selectedUsers.map((u) => u.name).join(", "), // 👈 이 필드명 확인
          members: memberIds, // 👈 이 필드명도 확인 (data.memberIds가 아니라 data.members일 수도)
        });

        const newChatId = result.chatRoomId || result.id;

        onClose();

        // 생성된 그룹 채팅방으로 바로 이동
        router.push(`/chat?chatId=${newChatId}`);
      }
    } catch (err) {
      console.error("채팅방 생성 실패:", err);
      alert("채팅방 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchTerm = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(searchTerm) ||
      (u.accountId || "").toLowerCase().includes(searchTerm) ||
      (u.email || "").toLowerCase().includes(searchTerm)
    );
  });

  // 🌟 선택된 인원에 따른 UI 텍스트
  const getButtonText = () => {
    if (selectedUsers.length === 0) return "대화 상대를 선택하세요";
    if (selectedUsers.length === 1) return "1:1 채팅 시작";
    return `그룹 채팅 시작 (${selectedUsers.length}명)`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-start bg-slate-900/40 backdrop-blur-sm pt-20">
      <div
        className="bg-white w-full max-w-3xl h-[85vh] shadow-2xl rounded-[32px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-8 border-b flex justify-between items-end bg-white sticky top-0 z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              {selectedUsers.length > 1 ? (
                <Users size={20} />
              ) : (
                <MessagesSquare size={20} />
              )}
              <span className="text-xs font-black uppercase tracking-widest">
                {selectedUsers.length > 1 ? "Group Chat" : "Messenger"}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              새 대화 시작
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              {selectedUsers.length > 1
                ? "그룹 채팅방을 생성하고 있습니다."
                : "대화할 상대를 목록에서 선택하세요."}
            </p>
          </div>

          <div className="flex items-center gap-3 pb-1">
            <Button
              disabled={selectedUsers.length === 0 || isCreating}
              onClick={handleCreateChat}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:scale-95 font-bold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  {selectedUsers.length > 1 ? (
                    <Users size={18} />
                  ) : (
                    <MessagesSquare size={18} />
                  )}
                  <span>{getButtonText()}</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-slate-100"
              disabled={isCreating}
            >
              <X className="size-6 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* 검색바 */}
        <div className="px-8 pt-6 pb-2 relative">
          <Search className="absolute left-12 top-[60%] -translate-y-1/2 size-5 text-slate-400" />
          <Input
            placeholder="이름, 사번, 이메일로 검색..."
            className="pl-12 py-7 bg-slate-50 border-none rounded-2xl text-base focus-visible:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 선택된 인원 및 그룹 이름 입력 */}
        <div className="px-8 py-4 border-b bg-white min-h-[120px] flex flex-col justify-center transition-all">
          {selectedUsers.length > 0 ? (
            <div className="space-y-4 animate-in slide-in-from-top-1">
              {/* 선택된 사용자 태그 */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {selectedUsers.map((user) => (
                  <div
                    key={user.accountId}
                    className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-sm text-indigo-600 font-bold shadow-sm shrink-0"
                  >
                    <span>{user.name}</span>
                    <X
                      className="size-4 cursor-pointer hover:text-red-500 transition-colors"
                      onClick={() => toggleUser(user)}
                    />
                  </div>
                ))}
              </div>

              {/* 🌟 그룹 채팅방 이름 입력 (2명 이상일 때만) */}
              {selectedUsers.length > 1 && (
                <div className="animate-in fade-in duration-500">
                  <Input
                    placeholder="그룹 채팅방 이름을 입력하세요 (선택사항)"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="bg-slate-50 border-slate-100 focus-visible:ring-indigo-500 h-12 rounded-xl"
                  />
                  <p className="text-xs text-slate-400 mt-2 px-1">
                    💡 이름을 입력하지 않으면 멤버 이름으로 자동 생성됩니다
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-slate-400 py-4 opacity-60">
              <User2 className="size-5" />
              <p className="text-sm font-medium">
                상단 검색을 통해 대화 상대를 추가해보세요.
              </p>
            </div>
          )}
        </div>

        {/* 사원 리스트 */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin size-8 mb-4" />
              <p className="font-medium font-bold">
                목록을 불러오고 있습니다...
              </p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {filteredUsers.map((user) => {
                const isSelected = !!selectedUsers.find(
                  (u) => u.accountId === user.accountId,
                );

                return (
                  <div
                    key={user.accountId}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-50/50 ring-1 ring-indigo-100"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => toggleUser(user)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12 border-2 border-white shadow-sm">
                        <AvatarImage
                          src={
                            user.profileImageUrl
                              ? `${SERVER_URL}${user.profileImageUrl}`
                              : DEFAULT_IMAGE
                          }
                        />
                        <AvatarFallback className="bg-slate-100 text-slate-400">
                          <User2 />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-800 text-base">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {user.role} · {user.email}
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleUser(user)}
                      className="rounded-full size-6 border-slate-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Search className="size-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 바깥쪽 클릭 시 닫기 */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
