import "@/styles/globals.css";

import { getMyChats } from "@/api/chat-api";
import SideBar from "@/components/layout/SideBar";
import { Spinner } from "@/components/ui/spinner";
import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { Client } from "@stomp/stompjs";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const token = useToken((s) => s.token);
  const account = useAccount((s) => s.account);
  const stomp = useStomp((s) => s.stomp);

  const [isHydrated, setIsHydrated] = useState(false);
  const stompRef = useRef(null);

  const isLoginPage = router.pathname === "/login";

  /* ===================== 1️⃣ Zustand persist 복구 ===================== */
  useEffect(() => {
    useToken.persist.rehydrate().then(() => setIsHydrated(true));
  }, []);

  /* ===================== 2️⃣ 로그인 리다이렉트 ===================== */
  useEffect(() => {
    if (!router.isReady || !isHydrated) return;
    if (!token && router.pathname !== "/login") {
      router.replace("/login");
    }
  }, [token, router.isReady, router.pathname, isHydrated]);

  /* ===================== 3️⃣ STOMP 연결 ===================== */
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://192.168.0.20:8080/ws"),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ STOMP connected");
        useStomp.getState().setStomp(client);
      },

      onDisconnect: () => {
        console.log("❌ STOMP disconnected");
      },

      debug: (str) => console.log("[STOMP]", str),
    });

    client.activate();
    stompRef.current = client;

    return () => {
      console.log("🧹 STOMP cleanup");
      client.deactivate();
      useStomp.getState().clearStomp();
      stompRef.current = null;
    };
  }, [token]);

  /* ===================== 4️⃣ 전체 채팅방 구독 ===================== */
  useEffect(() => {
    if (!stomp || !stomp.connected || !token || !account) return;

    console.log("🌍 GLOBAL CHAT SUBSCRIBE");

    let isCancelled = false;
    const subscriptions = [];

    const loadAndSubscribe = async () => {
      try {
        const data = await getMyChats(token);
        if (isCancelled) return;

        data.myChatList.forEach((room) => {
          const sub = stomp.subscribe(`/topic/chat/${room.id}`, (frame) => {
            const msg = JSON.parse(frame.body);
            const { increaseUnreadIfNeeded } = useStomp.getState();
            const currentAccount = useAccount.getState().account;
            if (!currentAccount) return;

            increaseUnreadIfNeeded(msg, currentAccount.accountId);
          });

          subscriptions.push(sub);
        });
      } catch (err) {
        console.error("채팅 목록 구독 실패", err);
      }
    };

    loadAndSubscribe();

    return () => {
      isCancelled = true;
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [stomp, token, account]);

  /* ===================== 5️⃣ 렌더 가드 (깜빡임 방지 핵심) ===================== */
  if (!router.isReady || !isHydrated) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Spinner className="size-20" />
      </div>
    );
  }

  if (!token && router.pathname !== "/login") {
    return null;
  }

  if (isLoginPage) {
    return <Component {...pageProps} />;
  }

  return (
    <SideBar>
      <Component {...pageProps} />
    </SideBar>
  );
}
