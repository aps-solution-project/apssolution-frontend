import "@/styles/globals.css";

import MainLayout from "@/components/layout/MainLayout";
import { Spinner } from "@/components/ui/spinner";

import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { getUnreadCount } from "@/api/chat-api";
import { getUnreadScenario } from "@/api/scenario-api";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const token = useToken((s) => s.token);
  const account = useAccount((s) => s.account);
  const stomp = useStomp((s) => s.stomp);
  const { setHasScenarioUnread } = useStomp();
  const stompRef = useRef(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const isLoginPage = router.pathname === "/login";

  useEffect(() => {
    if (!token) return;
    getUnreadCount(token).then((count) => {
      useStomp.getState().setTotalUnreadCount(count.totalUnreadCount || 0);
    });

    getUnreadScenario(token).then((res) => {
      useStomp.getState().setHasScenarioUnread(res.unreadCount || 0);
    });
  }, [token]);

  /* ===================== 1️⃣ persist 복구 ===================== */
  useEffect(() => {
    useToken.persist.rehydrate().then(() => {
      setIsHydrated(true);
    });
  }, []);

  /* ===================== 2️⃣ 로그인 가드 ===================== */
  useEffect(() => {
    if (!router.isReady || !isHydrated) return;

    if (!token && !isLoginPage) {
      router.replace("/login");
    }
  }, [token, router.isReady, isHydrated, isLoginPage]);

  /* ===================== 3️⃣ STOMP 연결 ===================== */
  useEffect(() => {
    if (!token) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}/ws`),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ STOMP connected");
        useStomp.getState().setStomp(client);
      },

      onDisconnect: () => {
        console.log("❌ STOMP disconnected");
      },
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

  /* ===================== 4️⃣ 전역 알림 구독 ===================== */
  useEffect(() => {
    if (!stomp || !stomp.connected || !account) return;

    console.log("🌍 GLOBAL CHAT SUBSCRIBE");

    const sub = stomp.subscribe(`/topic/user/${account.accountId}`, (frame) => {
      try {
        const body = JSON.parse(frame.body);

        // refresh = 안 읽은 메시지 발생 알림
        if (body.msg === "refresh") {
          const { currentChatId } = useStomp.getState();

          // 👉 현재 채팅방 보고 있으면 무시
          if (currentChatId) return;

          useStomp.getState().markChatUnread();
          return;
        } else if (body.message === "publishRefresh") {
          getUnreadScenario(token).then((count) => {
            // setHasScenarioUnread(count.unreadCount);
            useStomp.getState().setHasScenarioUnread(count.unreadCount);
          });
        }
      } catch (e) {
        console.error("❌ STOMP handler error", e);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [stomp, account]);

  // 미확인 메시지 최초 불러오기
  useEffect(() => {
    if (!token) return;
    getUnreadCount(token).then((count) => {
      useStomp.getState().setTotalUnreadCount(count.totalUnreadCount || 0);
    });
  }, [token, useStomp]);

  /* ===================== 5️⃣ 렌더 가드 ===================== */
  if (!router.isReady || !isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-20" />
      </div>
    );
  }

  if (!token && !isLoginPage) {
    return null;
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
