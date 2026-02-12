// components/chat/EmptyChatRoom.js
import { useState } from "react";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function EmptyChatRoom({ targetUser, onFirstSend }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await onFirstSend(message.trim());
      setMessage("");
    } catch (err) {
      console.error("메시지 전송 실패:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-4 h-[83.5px] border-b flex items-center justify-between bg-white/80">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-indigo-100">
              <User className="text-indigo-600" size={20} />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="font-bold text-slate-800">
              {targetUser.name}의 채팅방
            </h2>
            <p className="text-[11px] text-slate-500">새 대화</p>
          </div>
        </div>
      </div>

      {/* 빈 공간 (환영 메시지) */}
      <div className="flex-1 flex items-center justify-center bg-[#f8f9fc]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <User size={32} className="text-indigo-600" />
          </div>
          <p className="text-slate-600 font-medium">{targetUser.name}님과의 대화</p>
          <p className="text-sm text-slate-400">첫 메시지를 보내보세요!</p>
        </div>
      </div>

      {/* 입력창 */}
      <div className="p-4 bg-white border-t flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full px-4 py-3 pr-12 bg-slate-50 border-none rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={1}
              disabled={isSending}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              className="absolute right-1.5 top-1.5 size-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <Send className="size-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}