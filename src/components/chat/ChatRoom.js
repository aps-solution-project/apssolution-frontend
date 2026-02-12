import {
  getChatDetail,
  getUnreadCount,
  leaveChat,
  sendMessage,
} from "@/api/chat-api";
import ChatFileModal from "@/components/chat/ChatFileModal";
import ChatGalleryModal from "@/components/chat/ChatGalleryModal";
import { AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import {
  FilePlus,
  FileText,
  Image as ImageIcon,
  Images,
  Loader2,
  LogOut,
  Menu,
  Send,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function ChatRoom({ chatId }) {
  const router = useRouter();
  const { forceRefresh } = router.query;
  const { account } = useAccount();
  const { token } = useToken();
  const { stomp, setCurrentChatId, setTotalUnreadCount } = useStomp();

  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  // 🌟 채팅방 진입 시 currentChatId 설정
  useEffect(() => {
    if (!chatId || chatId === "chat-list" || chatId.startsWith("new_")) {
      setCurrentChatId(null);
      return;
    }
    setCurrentChatId(chatId);

    return () => {
      setCurrentChatId(null);
    };
  }, [chatId, setCurrentChatId]);

  // 1. 초기 데이터 로드
  useEffect(() => {
    if (!chatId || !token) return;
    if (chatId === "chat-list" || chatId.startsWith("new_")) return;

    const loadChatDetail = async () => {
      try {
        const data = await getChatDetail(token, chatId);

        setChatInfo(data);
        const chronologicalMessages = [...(data.messages || [])].reverse();

        setMessages(chronologicalMessages);

        // forceRefresh 플래그가 있으면 URL에서 제거
        if (forceRefresh) {
          router.replace(`/chat?chatId=${chatId}`, undefined, {
            shallow: true,
          });
        }
      } catch (err) {
        console.error("❌ 채팅방 로드 실패:", err);
        if (err.status === 403 || err.status === 404) {
          router.replace("/chat");
        }
      }
    };

    loadChatDetail();
  }, [chatId, token, forceRefresh, router]);

  // 2. 실시간 구독
  useEffect(() => {
    if (!stomp || !stomp.connected || !chatId) return;
    if (chatId === "chat-list" || chatId.startsWith("new_")) return;

    const sub = stomp.subscribe(`/topic/chat/${chatId}`, async (frame) => {
      const body = JSON.parse(frame.body);

      if (body.type !== "LEAVE") {
        // 🌟 메시지 목록 갱신
        getChatDetail(token, chatId).then((data) => {
          setMessages([...(data.messages || [])].reverse());
        });

        // 🌟 즉시 읽음 처리 (안읽은 메시지 카운트 갱신)
        try {
          const data = await getUnreadCount(token);
          setTotalUnreadCount(data.unreadCount || 0);
        } catch (err) {
          console.error("카운트 업데이트 실패:", err);
        }
      }
    });

    return () => {
      console.log("❌ 채팅 구독 해제:", chatId);
      sub.unsubscribe();
    };
  }, [stomp, stomp?.connected, chatId, token, setTotalUnreadCount]);

  // 3. 하단 스크롤
  const scrollToBottom = (behavior = "smooth") => {
    scrollRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. 🌟 채팅방 진입 시 안읽은 메시지 카운트 초기화
  useEffect(() => {
    if (!chatId || !token) return;
    if (chatId === "chat-list" || chatId.startsWith("new_")) return;

    const updateGlobalCount = async () => {
      try {
        const data = await getUnreadCount(token);

        setTimeout(() => {
          setTotalUnreadCount(data.unreadCount || 0);
        }, 0);
      } catch (err) {
        console.error("전역 카운트 업데이트 실패:", err);
      }
    };

    updateGlobalCount();

    return () => {
      updateGlobalCount();
    };
  }, [chatId, token, setTotalUnreadCount]);

  // 5. 텍스트 전송
  const handleSend = async () => {
    if (!inputText.trim()) return;

    try {
      await sendMessage(token, chatId, {
        type: "TEXT",
        content: inputText,
      });

      setInputText("");
    } catch (e) {
      console.error("메시지 전송 실패:", e);
    }
  };

  // 6. 파일 전송
  const handleFileSend = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
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
        router.push("/chat");
      })
      .catch((err) => {
        console.error("채팅방 나가기 실패:", err);
      });
  }

  if (!chatInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50/30 space-y-4">
        <div className="relative">
          <Loader2 className="size-10 text-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-1.5 bg-indigo-200 rounded-full" />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-400 animate-pulse">
          메시지를 불러오고 있습니다...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* 헤더 */}
      <div className="p-4 h-[83.5px] border-b flex items-center justify-between bg-white/80 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800">
                  {chatInfo?.chatRoomName + "의 채팅방" || "로딩 중..."}
                </h2>
                {chatInfo?.otherUsers?.length > 0 && (
                  <span className="text-sm text-slate-400 font-medium">
                    {chatInfo.otherUsers.length + 1}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500 truncate max-w-[200px]">
                {[
                  account?.name,
                  ...(chatInfo?.otherUsers?.map((u) => u.name) || []),
                ].join(", ")}
              </span>
              <span className="text-slate-300">|</span>
              <p className="text-emerald-500 flex items-center gap-1 shrink-0">
                <span className="size-1 bg-emerald-500 rounded-full animate-pulse" />
                실시간 연결됨
              </p>
            </div>
          </div>
        </div>

        {/* 햄버거 메뉴 */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="size-6 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 mt-2 shadow-xl rounded-xl border-slate-100"
            >
              <DropdownMenuItem
                onClick={() => {
                  setIsGalleryOpen(true);
                }}
                className="gap-2 py-3 cursor-pointer focus:bg-slate-50"
              >
                <Images className="size-4 text-indigo-600" />
                <span className="text-sm font-medium">사진 모아보기</span>
              </DropdownMenuItem>

              <div className="h-px bg-slate-100 my-1" />

              <DropdownMenuItem
                onClick={() => setIsFileModalOpen(true)}
                className="gap-2 py-3 cursor-pointer"
              >
                <FileText className="size-4 text-blue-600" />
                <span className="text-sm font-medium">파일 모아보기</span>
              </DropdownMenuItem>

              <div className="h-px bg-slate-100 my-1" />

              <DropdownMenuItem
                onClick={leaveChatRoom}
                className="gap-2 py-3 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="size-4" />
                <span className="text-sm font-medium">채팅방 나가기</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 메시지 영역 */}
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
              {!isMe && (
                <Avatar className="size-10 shrink-0 rounded-full overflow-hidden shadow-sm border border-slate-200">
                  <AvatarImage
                    src={
                      "http://192.168.0.20:8080" + msg.talker?.profileImageUrl
                    }
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500 font-medium">
                    {msg.talker?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`flex flex-col max-w-[70%] ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <span className="text-[11px] text-slate-500 mb-1 px-1">
                  {msg.talker?.name || "알 수 없음"}
                </span>

                <div
                  className={`flex items-end gap-2 ${
                    isMe ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`whitespace-pre-wrap ${
                      msg.type === "TEXT"
                        ? `px-4 py-2 rounded-2xl shadow-sm text-sm ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-white border text-slate-800 rounded-tl-none"
                          }`
                        : "rounded-xl"
                    }`}
                  >
                    {msg.type === "TEXT" && msg.content}

                    {msg.type === "FILE" && (
                      <div
                        className={`flex flex-col gap-2 ${isMe ? "items-end" : "items-start"}`}
                      >
                        {msg.attachments?.map((file, index) => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                            file.fileName,
                          );

                          return isImage ? (
                            <img
                              key={file.id || index}
                              onClick={() => downloadFile(file)}
                              src={`http://192.168.0.20:8080${file.fileUrl}`}
                              onLoad={() => scrollToBottom("auto")}
                              className="rounded-lg w-full max-w-[220px] object-contain cursor-pointer hover:opacity-90 transition shadow-md border border-slate-100"
                              alt={file.fileName}
                            />
                          ) : (
                            <div
                              key={file.id || index}
                              onClick={() => downloadFile(file)}
                              className="flex items-center gap-2 p-3 bg-white hover:bg-slate-50 rounded-xl cursor-pointer transition border border-slate-200 shadow-sm min-w-[200px]"
                            >
                              <div className="p-2 bg-slate-100 rounded-lg">
                                <FilePlus className="size-4 text-slate-600" />
                              </div>
                              <div className="flex flex-col overflow-hidden text-left">
                                <span className="text-xs font-medium truncate w-[130px] text-slate-800">
                                  {file.fileName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  파일 다운로드
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

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

      {/* 입력바 */}
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
          <input
            type="file"
            multiple
            ref={documentInputRef}
            className="hidden"
            onChange={handleFileSend}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
          />

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full border-slate-200 text-slate-500 hover:text-indigo-600"
            onClick={() => fileInputRef.current.click()}
          >
            <ImageIcon className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full border-slate-200 text-slate-500 hover:text-indigo-600"
            onClick={() => documentInputRef.current.click()}
          >
            <FilePlus className="size-5" />
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

      <ChatGalleryModal
        isOpen={isGalleryOpen}
        onClose={setIsGalleryOpen}
        messages={messages}
        onDownload={downloadFile}
      />
      <ChatFileModal
        isOpen={isFileModalOpen}
        onClose={setIsFileModalOpen}
        messages={messages}
        onDownload={downloadFile}
      />
    </div>
  );
}
