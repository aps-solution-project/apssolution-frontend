import { getMyChats } from "@/api/chat-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { UserCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function ChatList() {
  const { account } = useAccount();
  const { token } = useToken();
  const { stomp } = useStomp();
  const { setTotalUnreadCount } = useStomp();
  const router = useRouter();

  const [chatData, setChatData] = useState({ myChatList: [] });
  const rooms = chatData.myChatList || [];

  /** 현재 구독 저장용 (중복 구독 방지) */
  const subscriptionsRef = useRef({});

  /** ================= 채팅 목록 최초 로딩 ================= */
  useEffect(() => {
    if (!token) return;

    const fetchChats = async () => {
      try {
        const data = await getMyChats(token);
        setChatData(data);
        const total = data.myChatList.reduce(
          (acc, cur) => acc + (cur.unreadCount || 0),
          0,
        );
        setTotalUnreadCount(total);
      } catch (err) {
        console.error("목록 로드 실패:", err);
      }
    };

    fetchChats();
  }, [token, setTotalUnreadCount]);

  /** ================= STOMP 구독 처리 ================= */
  useEffect(() => {
    if (!stomp?.connected) return;
    if (!rooms.length) return;

    console.log(
      "📡 채팅방 구독 시작",
      rooms.map((r) => r.id),
    );

    rooms.forEach((room) => {
      const roomId = String(room.id);

      // 이미 구독 중이면 스킵
      if (subscriptionsRef.current[roomId]) return;

      const sub = stomp.subscribe(`/topic/chat/${roomId}`, async () => {
        try {
          // STOMP 메시지가 오면 항상 서버에서 최신 목록 가져오기
          const data = await getMyChats(token);
          setChatData(data);

          const total = data.myChatList.reduce(
            (acc, cur) => acc + (cur.unreadCount || 0),
            0,
          );
          setTotalUnreadCount(total);
        } catch (err) {
          console.error("STOMP 메시지 처리 중 목록 갱신 실패:", err);
        }
      });

      subscriptionsRef.current[roomId] = sub;
    });

    return () => {
      console.log("❌ 채팅방 구독 해제");
      Object.values(subscriptionsRef.current).forEach((sub) =>
        sub.unsubscribe(),
      );
      subscriptionsRef.current = {};
    };
  }, [stomp?.connected, rooms, token, setTotalUnreadCount]);

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
    <div className="divide-y">
      {rooms.length > 0 ? (
        rooms.map((room) => {
          const time = parseDateSafe(room.lastMessageTime);

          return (
            <div
              key={room.id}
              onClick={() => router.push(`/chat/${room.id}`)}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer"
            >
              {/* 아바타 */}
              <div className="relative flex -space-x-3 overflow-hidden p-1">
                {room.otherUsers?.slice(0, 2).map((user) => (
                  <Avatar
                    key={user.userId}
                    className="border-2 border-white size-12 shadow-sm"
                  >
                    <AvatarImage
                      src={`http://192.168.0.20:8080${user.profileImageUrl}`}
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

              {room.unreadCount > 0 && (
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
