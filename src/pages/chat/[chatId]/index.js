import {
  getChatDetail,
  getUnreadCount,
  leaveChat,
  sendMessage,
} from "@/api/chat-api";
import ChatFileModal from "@/components/chat/chat-file-modal";
import ChatGalleryModal from "@/components/chat/chat-gallery-modal";
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
  ChevronLeft,
  FilePlus,
  FileText,
  Image as ImageIcon,
  Images,
  LogOut,
  Menu,
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
  const { totalUnreadCount, setTotalUnreadCount } = useStomp();
  const { setCurrentChatId } = useStomp();

  const [chatInfo, setChatInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    setCurrentChatId(chatId);

    return () => {
      setCurrentChatId(null);
    };
  }, [chatId, setCurrentChatId]);

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
        if (err.status === 403 || err.status === 404) {
          router.replace("/chat/chat-list");
          return;
        }
        setChatInfo({
          id: chatId,
          chatRoomName: "새로운 대화", // 혹은 상대방 이름 로직 추가
          messages: [],
        });
        setMessages([]);
      });
  }, [chatId, token]);

  useEffect(() => {
    if (!stomp || !stomp.connected || !chatId) return;

    console.log("📡 채팅 구독 시작:", chatId);

    const sub = stomp.subscribe(`/topic/chat/${chatId}`, (frame) => {
      const body = JSON.parse(frame.body);
      if (body.type !== "LEAVE") {
        getChatDetail(token, chatId).then((data) => {
          setMessages([...(data.messages || [])].reverse());
        });
      }
    });

    return () => {
      console.log("❌ 채팅 구독 해제:", chatId);
      sub.unsubscribe();
    };
  }, [stomp, chatId, token]);

  // 하단 스크롤
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 채팅방 진입 시 안읽은 메세지 카운트 초기화
  useEffect(() => {
    if (!chatId || !token) return;

    const updateGlobalCount = async () => {
      try {
        // 서버에서 최신 안 읽은 개수 가져오기
        const data = await getUnreadCount(token);

        // 사파리 등 브라우저 렌더링 에러 방지를 위해 setTimeout 사용
        setTimeout(() => {
          setTotalUnreadCount(data.unreadCount || 0);
        }, 0);
      } catch (err) {
        console.error("전역 카운트 업데이트 실패:", err);
      }
    };

    updateGlobalCount();

    // (선택 사항) 채팅방을 나갈 때도 한 번 더 갱신하여
    // 목록으로 돌아갔을 때 사이드바가 최신 상태를 유지하게 함
    return () => {
      updateGlobalCount();
    };
  }, [chatId, token, setTotalUnreadCount]);

  // 텍스트 전송
  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      await sendMessage(token, chatId, {
        type: "TEXT",
        content: inputText,
      });
      setInputText(""); // 입력창만 초기화
      // 메시지는 STOMP 이벤트에서 처리
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
        router.push("/chat/chat-list");
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
            <ChevronLeft className="size-5 text-slate-900" />
          </Button>
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

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500 truncate max-w-[120px]">
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

        {/* 🍔 우측 햄버거 메뉴 영역 */}
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
              {/* 1. 사진 모아보기 */}
              <DropdownMenuItem
                onClick={() => {
                  setIsGalleryOpen(true);
                  const allImages = messages
                    .filter((m) => m.type === "FILE")
                    .flatMap((m) => m.attachments || [])
                    .filter((a) =>
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(a.fileName),
                    );
                }}
                className="gap-2 py-3 cursor-pointer focus:bg-slate-50"
              >
                <Images className="size-4 text-indigo-600" />
                <span className="text-sm font-medium">사진 모아보기</span>
              </DropdownMenuItem>

              {/* 구분선 */}
              <div className="h-px bg-slate-100 my-1" />

              {/* 파일 모아보기 (새로 추가) */}
              <DropdownMenuItem
                onClick={() => setIsFileModalOpen(true)}
                className="gap-2 py-3 cursor-pointer"
              >
                <FileText className="size-4 text-blue-600" />
                <span className="text-sm font-medium">파일 모아보기</span>
              </DropdownMenuItem>

              {/* 구분선 */}
              <div className="h-px bg-slate-100 my-1" />

              {/* 3. 채팅방 나가기 */}
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
                  {/* 말풍선 본체: TEXT일 때만 배경/패딩 적용 */}
                  <div
                    className={`whitespace-pre-wrap ${
                      msg.type === "TEXT"
                        ? `px-4 py-2 rounded-2xl shadow-sm text-sm ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-white border text-slate-800 rounded-tl-none"
                          }`
                        : "rounded-xl" // 이미지/파일은 별도 패딩 없이 둥글게만 처리
                    }`}
                  >
                    {/* 1. 텍스트 메시지 */}
                    {msg.type === "TEXT" && msg.content}

                    {/* 2. 파일/이미지 메시지 */}
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
          {/* 1. 이미지 전용 Input */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSend}
            accept="image/*"
          />
          {/* 2. 일반 파일 전용 Input (추가) */}
          <input
            type="file"
            multiple
            ref={documentInputRef} // 새로운 ref 필요
            className="hidden"
            onChange={handleFileSend}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip" // 허용할 확장자 제한
          />

          {/* 이미지 버튼 */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full border-slate-200 text-slate-500 hover:text-indigo-600"
            onClick={() => fileInputRef.current.click()}
          >
            <ImageIcon className="size-5" />
          </Button>

          {/* 일반 파일 추가 버튼 (수정) */}
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
