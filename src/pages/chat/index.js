import ChatLayout from "@/components/chat/ChatLayout";
import { MessagesSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
        <MessagesSquare size={64} className="mb-4 opacity-10" />
        <p className="font-medium">대화방을 선택해주세요.</p>
      </div>
    </ChatLayout>
  );
}