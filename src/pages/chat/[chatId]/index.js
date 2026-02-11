// pages/chat/[chatId].js
import { useRouter } from "next/router";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatRoom from "@/components/chat/ChatRoom"; // 🌟 별도 컴포넌트로 분리된 파일 호출

export default function ChatDetailPage() {
  const router = useRouter();
  const { chatId } = router.query;

  return (
    <ChatLayout>
      {chatId ? (
        <ChatRoom key={chatId} chatId={chatId} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-300">
           로딩 중...
        </div>
      )}
    </ChatLayout>
  );
}