import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { getChatDetail, sendMessage } from "@/api/chat-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, ChevronLeft, User2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      })
      .catch((err) => {
        console.error("채팅방 로드 실패:", err);
        router.replace("/chat/chat-list");
      });
  }, [chatId, token]);

  // 2. STOMP 실시간 구독
  useEffect(() => {
    console.log("🔥 STOMP EFFECT CHECK", {
      stomp,
      connected: stomp?.connected,
      chatId,
    });

    if (!stomp || !stomp.connected || !chatId) return;

    const sub = stomp.subscribe(`/topic/chat/${chatId}`, (frame) => {
      const body = JSON.parse(frame.body);
      setMessages((prev) => [...prev, body]);
    });

    return () => sub.unsubscribe();
  }, [stomp, chatId]);

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
              {chatInfo?.chatRoomName || chatInfo?.otherUser?.name || "채팅방"}
            </h2>
            <p className="text-[10px] text-emerald-500 flex items-center gap-1">
              <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
              실시간 연결됨
            </p>
          </div>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f9fc]">
        {messages.map((msg) => {
          const isMe =
            String(account?.accountId) === String(msg.talker?.userId);

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 mb-4`}
            >
              <div
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}
              >
                {/* 말풍선 컨테이너 */}
                <div
                  className={`p-3 rounded-2xl shadow-sm ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border rounded-bl-none"
                  }`}
                >
                  {/* 텍스트 메시지 */}
                  {msg.type === "TEXT" && (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* 파일/이미지 메시지 */}
                  {msg.type === "FILE" && (
                    <div className="flex flex-col gap-2 p-1">
                      {" "}
                      {/* 패딩을 살짝 주어 테두리 안 겹치게 수정 */}
                      {msg.attachments && msg.attachments.length > 0 ? (
                        msg.attachments.map((file, index) => (
                          <div
                            key={file.id || `file-${index}`}
                            className="relative group"
                          >
                            {/* 1. key 추가: 고유 ID가 없으면 index라도 사용하여 경고 해결 */}
                            <img
                              src={encodeURI(
                                `http://192.168.0.20:8080${file.fileUrl}`,
                              )}
                              className="rounded-lg w-full min-w-[150px] max-w-[250px] h-auto object-contain border border-white/20 shadow-sm transition-transform group-hover:scale-[1.02]"
                              alt={file.fileName}
                              onLoad={() =>
                                console.log("이미지 로드 성공:", file.fileUrl)
                              }
                              onError={(e) => {
                                console.error(
                                  "파일 경로 확인용:",
                                  e.target.src,
                                );
                                // 2. 무한 루프 방지: onError 내에서 src 교체 시 실패하면 계속 실행될 수 있음
                                if (!e.target.src.includes("placehold.co")) {
                                  e.target.src =
                                    "https://placehold.co/250x200?text=Image+Not+Found";
                                }
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-white/70 italic p-2">
                          첨부된 파일이 없습니다.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {/* ... 시간 표시 ... */}
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.talkedAt && (
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {new Date(msg.talkedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </span>
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
