import { useRouter } from "next/router";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatRoom from "@/components/chat/ChatRoom";
import EmptyChatRoom from "@/components/chat/EmptyChatRoom";
import { MessagesSquare } from "lucide-react";
import { startDirectChat, sendMessage } from "@/api/chat-api";
import { useToken } from "@/stores/account-store";

export default function ChatPage() {
  const router = useRouter();
  const { chatId, targetName } = router.query;
  const { token } = useToken();

  const isNewChat = chatId?.startsWith("new_direct_");
  const targetUserId = isNewChat ? chatId.replace("new_direct_", "") : null;

  const handleFirstSend = async (content) => {
    if (!targetUserId || !token) return;

    try {
      console.log("🚀 1. 채팅방 생성 시작, targetUserId:", targetUserId);
      
      // 1. 채팅방 생성
      const result = await startDirectChat(token, targetUserId);
      const newChatId = result.chatRoomId || result.id;
      
      console.log("✅ 2. 채팅방 생성 완료, newChatId:", newChatId);
      console.log("📤 3. 첫 메시지 전송 시작:", content);

      // 2. 첫 메시지 전송
      const messageResult = await sendMessage(token, newChatId, {
        type: "TEXT",
        content: content,
      });
      
      console.log("✅ 4. 메시지 전송 완료:", messageResult);
      console.log("⏳ 5. 1초 대기 중...");

      // 🌟 백엔드 저장 대기 시간 추가
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("🔄 6. 채팅방으로 이동:", newChatId);

      // 3. forceRefresh 플래그와 함께 이동
      router.replace(`/chat?chatId=${newChatId}&forceRefresh=true`);

    } catch (err) {
      console.error("❌ 채팅방 생성/메시지 전송 실패:", err);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  return (
    <ChatLayout>
      {isNewChat ? (
        <EmptyChatRoom
          targetUser={{
            accountId: targetUserId,
            name: targetName || "사용자"
          }}
          onFirstSend={handleFirstSend}
        />
      ) : chatId ? (
        <ChatRoom key={chatId} chatId={chatId} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
          <MessagesSquare size={64} className="mb-4 opacity-10" />
          <p className="font-medium">대화방을 선택해주세요.</p>
        </div>
      )}
    </ChatLayout>
  );
}