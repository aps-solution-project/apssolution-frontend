import { sendMessage, startDirectChat } from "@/api/chat-api";
import ChatLayout from "@/components/chat/ChatLayout";
import ChatRoom from "@/components/chat/ChatRoom";
import EmptyChatRoom from "@/components/chat/EmptyChatRoom";
import { useToken } from "@/stores/account-store";
import { MessagesSquare } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const router = useRouter();
  const { chatId, targetName } = router.query;
  const { token } = useToken();

  // 상태를 통해 최초 메시지를 전달한다. 라우팅 시에도 컴포넌트가 유지되기 때문에
  // 간단하게 부모에서 prop으로 내려줄 수 있다.
  const [pendingFirstMessage, setPendingFirstMessage] = useState(null);

  const isNewChat = chatId?.startsWith("new_direct_");
  const targetUserId = isNewChat ? chatId.replace("new_direct_", "") : null;

  const handleFirstSend = async (content) => {
    if (!targetUserId || !token) return;

    try {
      // 1. 채팅방 생성
      const result = await startDirectChat(token, targetUserId);
      const newChatId = result.chatRoomId || result.id;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      // 2. 첫 메시지 전송
      await sendMessage(token, newChatId, {
        type: "TEXT",
        content,
      });

      // 3. 앞으로 보여줘야 할 메시지를 로컬에 저장
      setPendingFirstMessage({ chatId: newChatId, content });

      // 4. 새 채팅방으로 이동한다.
      //    목록도 즉시 갱신시키도록 이벤트를 던진다.
      window.dispatchEvent(new Event("chatListRefresh"));

      //    forceRefresh는 ChatRoom에서 URL에서 제거하는 역할만 한다.
      router.replace(`/chat?chatId=${newChatId}&forceRefresh=true`, undefined, {
        shallow: true,
      });
    } catch (err) {
      console.error("❌ 채팅방 생성/메시지 전송 실패:", err);
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  // chatId가 바뀌는 시점을 감지해서 pendingFirstMessage를 초기화한다.
  useEffect(() => {
    if (!chatId) {
      setPendingFirstMessage(null);
      return;
    }

    if (pendingFirstMessage?.chatId === chatId) {
      setPendingFirstMessage(null);
    }
  }, [chatId, pendingFirstMessage]);

  return (
    <ChatLayout>
      {isNewChat ? (
        <EmptyChatRoom
          targetUser={{
            accountId: targetUserId,
            name: targetName || "사용자",
          }}
          onFirstSend={handleFirstSend}
        />
      ) : chatId ? (
        <ChatRoom
          key={chatId}
          chatId={chatId}
          initialMessage={
            pendingFirstMessage?.chatId === chatId
              ? pendingFirstMessage.content
              : null
          }
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
          <MessagesSquare size={64} className="mb-4 opacity-10" />
          <p className="font-medium">대화방을 선택해주세요.</p>
        </div>
      )}
    </ChatLayout>
  );
}
