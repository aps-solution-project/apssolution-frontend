import "@/styles/globals.css";

import SideBar from "@/components/layout/SideBar";
import { getMyChats } from "@/api/chat-api";
import { Spinner } from "@/components/ui/spinner";
import { useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { useAccount } from "@/stores/account-store";
import { Client } from "@stomp/stompjs";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const token = useToken((s) => s.token);
  const [isReady, setIsReady] = useState(false);
  const stompRef = useRef(null);

  const isLoginPage = router.pathname === "/login";
  const isRedirecting = !token && !isLoginPage && isReady;
  const stomp = useStomp.getState().stomp;
  const account = useAccount.getState().account;

  // Persist 복구 + 라우터 준비 확인
  useEffect(() => {
    useToken.persist.rehydrate();

    // 라우터 준비 대기
    if (!router.isReady) return;
    setIsReady(true);
  }, [router.isReady]);

  // 토큰 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isReady) return;

    if (!token && !isLoginPage) {
      router.replace("/login");
    }
  }, [token, isReady, isLoginPage, router]);

  // STOMP 초기화 (토큰이 있을 때만)
  useEffect(() => {
    if (!token) return;
    if (stompRef.current) return;

    console.log("🔥 STOMP INIT EFFECT RUN");

    const client = new Client({
      webSocketFactory: () => new SockJS("http://192.168.0.20:8080/ws"),
      // reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ STOMP connected");
        useStomp.getState().setStomp(client);
      },

      debug: (str) => console.log("[STOMP]", str),
    });

    client.activate();
    stompRef.current = client;

    return () => {
      console.log("🧹 STOMP deactivate");
      client.deactivate();
      useStomp.getState().clearStomp();
      stompRef.current = null;
    };
  }, [token]);

  // 전체 영역 구독용 stomp
  useEffect(() => {
    if (!stomp || !stomp.connected || !token || !account) return;

    console.log("🌍 GLOBAL CHAT SUBSCRIBE");

    let isIgnore = false;
    let subs = [];

    const subscribeAllChats = async () => {
      try {
        const data = await getMyChats(token);
        if (isIgnore || !stomp.connected) return;

        data.myChatList.forEach((room) => {
          if (subs.find((s) => s.roomId === room.id)) return;

          const sub = stomp.subscribe(`/topic/chat/${room.id}`, (frame) => {
            const msg = JSON.parse(frame.body);
            const { currentChatId, increaseUnreadIfNeeded } =
              useStomp.getState();
            const currentAccount = useAccount.getState().account;
            if (!currentAccount) return;

            increaseUnreadIfNeeded(msg, currentAccount.accountId);
          });

          subs.push({ roomId: room.id, sub });
        });
      } catch (err) {
        console.error("구독할 채팅 목록 로드 실패", err);
      }
    };

    subscribeAllChats();

    return () => {
      isIgnore = true;
      subs.forEach(({ sub }) => sub.unsubscribe());
    };
  }, [stomp?.connected, token, account?.accountId]);

  // 라우터 준비 전 로딩 화면
  if (!isReady) {
    return (
      <div className="flex justify-center items-center gap-6 h-screen w-screen">
        <Spinner className="size-20" />
      </div>
    );
  }

  // 토큰 없고 로그인 페이지 아님 = 리다이렉트 중
  if (!token && !isLoginPage) {
    return null;
  }

  // 로그인 페이지는 사이드바 없음
  if (isLoginPage || isRedirecting) {
    return <Component {...pageProps} />;
  }

  // 나머지는 사이드바 포함
  return (
    <SideBar>
      <Component {...pageProps} />
    </SideBar>
  );
}
