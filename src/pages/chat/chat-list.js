import { getMyChats } from "@/api/chat-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // 읽지 않은 개수용
import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { UserCircle } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ChatList() {
  const { account } = useAccount();
  const { token } = useToken();
  const { stomp } = useStomp();
  const [chatData, setChatData] = useState({ myChatList: [] });
  const rooms = chatData.myChatList || [];
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    // 채팅 목록 API 호출 (경로는 프로젝트 설정에 맞춰 수정)
    // fetch("http://192.168.0.20:8080/api/chats", {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // })
    //   .then((res) => res.json())
    getMyChats(token)
      .then((data) => {
        // console.log("응답 데이터:", data); // 여기서 구조를 꼭 확인하세요!
        setChatData(data); // { myChatList: [...] } 형태가 들어감
      })
      .catch((err) => console.error("목록 로드 실패:", err));
  }, [token]);

  useEffect(() => {
    if (!stomp || !account) return;

    // 내 계정 ID 전용 채널 구독 (예: /topic/user/worker)
    const sub = stomp.subscribe(`/topic/user/${account.id}`, (payload) => {
      // 메시지가 오면 목록을 다시 불러옴
      getMyChats(token).then(setChatData);
    });

    return () => sub.unsubscribe();
  }, [stomp, account]);

  return (
    <div className="divide-y">
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <div
            key={room.id} // elm.chat.id -> room.id
            onClick={() => router.push(`/chat/${room.id}`)}
            className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer"
          >
            {/* 아바타: otherUsers 사용 */}
            <div className="relative flex -space-x-3 overflow-hidden p-1">
              {room.otherUsers?.slice(0, 2).map((user) => (
                <Avatar
                  key={user.userId}
                  className="border-2 border-white size-12 shadow-sm"
                >
                  <AvatarImage
                    src={"http://192.168.0.20:8080" + user.profileImageUrl}
                  />
                  <AvatarFallback>
                    <UserCircle />
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>

            {/* 내용 영역 */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-slate-900 truncate">
                  {room.name ||
                    room.otherUsers?.map((u) => u.name).join(", ") ||
                    "대화 상대 없음"}
                </h3>
                {/* ✅ 우측 상단: 시간을 보여주는 자리 */}
                <span className="text-[11px] text-slate-400 shrink-0">
                  {(() => {
                    const time = room.lastMessageTime;
                    if (!time) return "";

                    // 백엔드에서 @JsonFormat을 적용했으므로 이제 문자열로 옵니다.
                    const date = new Date(time);
                    if (isNaN(date.getTime())) return ""; // 혹시 모를 배열 방지

                    // 오늘이면 시간만, 어제 이전이면 날짜를 보여주는 센스
                    const isToday =
                      new Date().toDateString() === date.toDateString();
                    return isToday
                      ? date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : date.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        });
                  })()}
                </span>
              </div>

              {/* ✅ 하단: 메시지 내용을 요약해서 보여주는 자리 */}
              <p className="text-sm text-slate-500 truncate">
                {room.lastMessage || "메시지가 없습니다."}
              </p>
            </div>

            {/* 알림 배지 */}
            {room.unreadCount > 0 && (
              <Badge variant="destructive">{room.unreadCount}</Badge>
            )}
          </div>
        ))
      ) : (
        <div className="p-10 text-center text-slate-400 text-sm">
          진행 중인 채팅이 없습니다.
        </div>
      )}
    </div>
  );
}
