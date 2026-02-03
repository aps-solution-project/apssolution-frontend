import { getChatDetail, leaveChat, sendMessage } from "@/api/chat-api";
import { AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import {
  ChevronLeft,
  FilePlus,
  Image as ImageIcon,
  LogOut,
  Send,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function ChatRoom() {
  const router = useRouter();
  const { chatId } = router.query;
  const { account } = useAccount();
  const { token } = useToken();
  const { stomp } = useStomp();

  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. 초기 데이터 로드
  useEffect(() => {
    if (!chatId || !token) return;

    getChatDetail(token, chatId)
      .then((data) => {
        setChatInfo(data);
        // 백엔드에서 reversed()로 오기 때문에 다시 뒤집어서 시간순 정렬
        const chronologicalMessages = [...(data.messages || [])].reverse();
        setMessages(chronologicalMessages);
        console.log("채팅방 데이터:", data);
      })
      .catch((err) => {
        console.error("채팅방 로드 실패:", err);
        router.replace("/chat/chat-list");
      });
  }, [chatId, token]);

  // 2. STOMP 실시간 구독
  // useEffect(() => {
  //   console.log("🔥 STOMP EFFECT CHECK", {
  //     stomp,
  //     connected: stomp?.connected,
  //     chatId,
  //   });

  //   if (!stomp || !stomp.connected || !chatId) return;

  //   const sub = stomp.subscribe(`/topic/chat/${chatId}`, (frame) => {
  //     const body = JSON.parse(frame.body);
  //     setMessages((prev) => [...prev, body]);
  //   });

  //   return () => sub.unsubscribe();
  // }, [stomp, chatId]);

  useEffect(() => {
    if (!stomp || !stomp.connected || !chatId) return;

    console.log("📡 채팅 구독 시작:", chatId);

    const sub = stomp.subscribe(`/topic/chat/${chatId}`, (frame) => {
      const body = JSON.parse(frame.body);
      setMessages((prev) => [...prev, body]);
    });

    return () => {
      console.log("❌ 채팅 구독 해제:", chatId);
      sub.unsubscribe();
    };
  }, [stomp, stomp?.connected, chatId]);

  // 하단 스크롤
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 텍스트 전송
  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      // API 함수가 원하는 구조로 전달
      await sendMessage(token, chatId, {
        type: "TEXT",
        content: inputText,
      });
      setInputText("");
    } catch (e) {
      console.error(e);
    }
  };

  // 파일 전송
  const handleFileSend = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      // API 함수가 원하는 구조로 전달
      await sendMessage(token, chatId, {
        type: "FILE",
        files: files,
      });
    } catch (e) {
      console.error(e);
    } finally {
      e.target.value = "";
    }
  };

  function downloadFile(file) {
    const downloadUrl = `http://192.168.0.20:8080/api/chats/files/download?path=${encodeURIComponent(
      file.fileUrl.replace("/apssolution/chatAttachments/", ""),
    )}`;
    window.open(downloadUrl, "_blank");
  }

  function leaveChatRoom() {
    leaveChat(token, chatId)
      .then(() => {
        router.replace("/chat/chat-list");
      })
      .catch((err) => {
        console.error("채팅방 나가기 실패:", err);
      });
  }

  if (!chatInfo) {
    return (
      <div className="flex items-center justify-center h-[85vh]">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-white border shadow-2xl rounded-2xl overflow-hidden mt-4">
      {/* 상단 헤더 */}
      <div className="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800">
              {chatInfo?.chatRoomName || "로딩 중..."}
            </h2>
            <p className="text-[10px] text-emerald-500 flex items-center gap-1">
              <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
              실시간 연결됨
            </p>
          </div>
          <div>
            <Button
              onClick={leaveChatRoom}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              채팅방 나가기
            </Button>
          </div>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f9fc]">
        {messages.map((msg) => {
          if (msg.type === "LEAVE") {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <div className="px-4 py-2 text-xs text-slate-500 bg-slate-200 rounded-full shadow-sm">
                  {msg.talker && msg.talker.name}님이 나갔습니다
                </div>
              </div>
            );
          }
          const isMe =
            String(account?.accountId) === String(msg.talker?.userId);

          const timeText =
            msg.talkedAt &&
            new Date(msg.talkedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} gap-3 mb-6`}
            >
              {/* 상대방 아바타 */}
              {!isMe && (
                <Avatar className="size-10 shrink-0 rounded-full shadow-sm border">
                  <AvatarImage
                    src={
                      "http://192.168.0.20:8080" + msg.talker?.profileImageUrl
                    }
                  />
                  <AvatarFallback>
                    {msg.talker?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* 메시지 영역 */}
              <div
                className={`flex flex-col max-w-[70%] ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                {/* 이름 */}
                <span className="text-[11px] text-slate-500 mb-1 px-1">
                  {msg.talker?.name || "알 수 없음"}
                </span>

                {/* 💬 말풍선 + 시간 (한 줄) */}
                <div
                  className={`flex items-end gap-2 ${
                    isMe ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* 말풍선 */}
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-sm text-sm whitespace-pre-wrap ${
                      isMe
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white border text-slate-800 rounded-tl-none"
                    }`}
                  >
                    {msg.type === "TEXT" && msg.content}

                    {msg.type === "FILE" && (
                      <div className="flex flex-col gap-2">
                        {msg.attachments?.map((file, index) => (
                          <img
                            key={file.id || index}
                            onClick={() => downloadFile(file)}
                            src={`http://192.168.0.20:8080${file.fileUrl}`}
                            className="rounded-lg w-full max-w-[220px] object-contain cursor-pointer hover:scale-[1.02] transition"
                            alt={file.fileName}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 시간 */}
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {timeText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={scrollRef} />
      </div>

      {/* 하단 입력바 */}
      <div className="p-4 bg-white border-t flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSend}
            accept="image/*"
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full border-slate-200 text-slate-500"
            onClick={() => fileInputRef.current.click()}
          >
            <ImageIcon className="size-5" />
          </Button>

          <FilePlus className="size-5" />
          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="메시지를 입력하세요..."
              className="pr-12 py-6 bg-slate-50 border-none focus-visible:ring-indigo-500 rounded-2xl"
            />
            <Button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="absolute right-1.5 top-1.5 size-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              <Send className="size-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
