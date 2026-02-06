import "@/styles/globals.css";

import Header from "@/components/layout/Header";
import SideBar from "@/components/layout/SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useAccount, useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { Client } from "@stomp/stompjs";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import MainLayout from "@/main-layout";

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
    if (!token && !isLoginPage) {
      router.replace("/login");
    }
  }, [token, router.isReady, isHydrated, isLoginPage]);

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

    const sub = stomp.subscribe(
      `/topic/user/${account?.accountId}`,
      (frame) => {
        const body = JSON.parse(frame.body);
        if (body.msg === "refresh") {
          stomp.hasUnread = true;
          const { increaseUnreadIfNeeded } = useStomp.getState();
          const currentAccount = useAccount.getState().account;
          if (!currentAccount) return;

          increaseUnreadIfNeeded(body, currentAccount.accountId);
        }
      },
    );

    return () => {
      sub.unsubscribe();
    };
  }, [stomp, token, account]);

  /* ===================== 5️⃣ 렌더 가드 (깜빡임 방지 핵심) ===================== */
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
