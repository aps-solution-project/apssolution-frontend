// components/chat/ChatLayout.js
import ChatList from "./ChatList";
import { MessagesSquare, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CreateChatModal from "./CreateModal";

export default function ChatLayout({ children }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      {/* 공통 헤더 */}
      <div className="flex justify-between items-end border-b pb-3 border-slate-100 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <MessagesSquare size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Messenger</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">채팅</h1>
          <p className="text-sm text-slate-400 font-medium">동료들과 실시간으로 소통합니다.</p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-6 shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5 active:scale-95 gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <MessageSquarePlus size={18} />
          <span className="font-bold">새 채팅</span>
        </Button>
      </div>

      {/* 스플릿 뷰 프레임 */}
      <div className="flex flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* 왼쪽 목록 (고정) */}
        <div className="w-[380px] border-r border-slate-100 flex flex-col bg-slate-50/20">
          <div className="flex-1 overflow-y-auto">
            <ChatList />
          </div>
        </div>

        {/* 오른쪽 영역 (가변 - children) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {children}
        </div>
      </div>

      {isCreateModalOpen && <CreateChatModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
}