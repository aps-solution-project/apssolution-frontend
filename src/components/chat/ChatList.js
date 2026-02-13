import { getMyChats } from "@/api/chat-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { UserCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ChatList() {
  const { account } = useAccount();
  const { token } = useToken();
  const { stomp, setTotalUnreadCount } = useStomp();
  const router = useRouter();
  const { chatId: currentChatId } = router.query;

  const [chatData, setChatData] = useState({ myChatList: [] });
  const rooms = chatData.myChatList || [];

  /** ================= 채팅 목록 최초 로딩 ================= */
  const refreshChatList = async () => {
    if (!token) return;
    try {
      const data = await getMyChats(token);
      setChatData(data);

      const total = data.myChatList.reduce(
        (acc, cur) => acc + (cur.unreadCount || 0),
        0,
      );
      setTotalUnreadCount(total);
    } catch (err) {
      console.error("목록 갱신 실패:", err);
    }
  };

  /** 1. 최초 로드 */
  useEffect(() => {
    refreshChatList();
  }, [token]);

  /** 2. 🌟 실시간 구독 로직 수정 */
  useEffect(() => {
    // stomp가 연결되지 않았거나 account가 없으면 대기
    if (!stomp || !stomp.connected || !account?.accountId) return;
    const topic = `/topic/user/${account.accountId}`;
    const sub = stomp.subscribe(`/topic/user/${account.accountId}`, (frame) => {
      try {
        const body = JSON.parse(frame.body);
        // 서버에서 'refresh' 신호가 오면 목록을 새로 가져옴
        if (body.msg === "refresh") {
          refreshChatList();
        }
      } catch (e) {
        console.error("메시지 파싱 에러:", e);
      }
    });

    return () => {
      console.log("❌ 채팅 리스트 구독 해제");
      sub.unsubscribe();
    };
    // 🌟 stomp.connected와 currentChatId를 의존성에 추가하여 상태 변화에 대응
  }, [stomp, stomp?.connected, account?.accountId, currentChatId]);

  /** ================= 날짜 안전 파싱 ================= */
  function parseDateSafe(value) {
    if (!value) return null;

    if (typeof value === "string") {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }

    if (Array.isArray(value)) {
      const [y, m, d, h, min, s] = value;
      return new Date(y, m - 1, d, h, min, s);
    }

    return null;
  }

  /** ================= 화면 렌더 ================= */
  return (
    <div className="flex flex-col">
      {rooms.length > 0 ? (
        rooms.map((room) => {
          const time = parseDateSafe(room.lastMessageTime);
          const isSelected = String(currentChatId) === String(room.id);
          const showBadge = room.unreadCount > 0;

          return (
            <div
              key={room.id}
              onClick={() => {
                router.push(`/chat?chatId=${room.id}`);
              }}
              className={`flex items-center gap-4 p-4 transition-all cursor-pointer relative
              border-l-4 border-transparent border-b border-slate-100 last:border-b-0
              ${
                isSelected
                  ? "bg-indigo-50/60 border-l-indigo-600 border-b-transparent"
                  : "hover:bg-slate-50"
              }`}
            >
              {/* 아바타 */}
              <div className="relative flex -space-x-3 overflow-hidden p-1">
                {room.otherUsers?.slice(0, 2).map((user) => (
                  <Avatar
                    key={user.userId}
                    className="border-2 border-white size-12 shadow-sm"
                  >
                    <AvatarImage
                      src={`http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080${user.profileImageUrl}`}
                    />
                    <AvatarFallback>
                      <UserCircle />
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900 truncate">
                    {room.name ||
                      room.otherUsers?.map((u) => u.name).join(", ") ||
                      "대화 상대 없음"}
                  </h3>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    {time
                      ? new Date().toDateString() === time.toDateString()
                        ? time.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : time.toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })
                      : ""}
                  </span>
                </div>

                <p className="text-sm text-slate-500 truncate">
                  {room.lastMessage || "메시지가 없습니다."}
                </p>
              </div>

              {showBadge && currentChatId != room.id && (
                <Badge variant="destructive">{room.unreadCount}</Badge>
              )}
            </div>
          );
        })
      ) : (
        <div className="p-10 text-center text-slate-400 text-sm">
          진행 중인 채팅이 없습니다.
        </div>
      )}
    </div>
  );
}
