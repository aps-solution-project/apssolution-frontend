import "@/styles/globals.css";

import SideBar from "@/components/layout/SideBar";
import { Spinner } from "@/components/ui/spinner";
import { useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { Client } from "@stomp/stompjs";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const token = useToken((s) => s.token);
  const [isHydrated, setIsHydrated] = useState(false);
  const stompRef = useRef(null);

  const isLoginPage = router.pathname === "/login";

  // ✅ 1. persist 복구 완료 신호
  useEffect(() => {
    useToken.persist.rehydrate().then(() => {
      setIsHydrated(true);
    });
  }, []);

  // ✅ 2. 로그인 리다이렉트
  useEffect(() => {
    if (!router.isReady || !isHydrated) return;

    if (!token && router.pathname !== "/login") {
      router.replace("/login");
    }
  }, [token, router.isReady, isHydrated]);

  // ✅ 3. STOMP 연결
  useEffect(() => {
    if (!token) return;
    if (stompRef.current) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://192.168.0.20:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => useStomp.getState().setStomp(client),
      debug: (str) => console.log("[STOMP]", str),
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
      useStomp.getState().clearStomp();
      stompRef.current = null;
    };
  }, [token]);

  // ✅ 🚨 가장 중요: 준비 안됐으면 아무것도 그리지 않음
  if (!router.isReady || !isHydrated) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <Spinner className="size-20" />
      </div>
    );
  }

  // ✅ 로그인 안 된 상태 → 리다이렉트 중에는 빈 화면
  if (!token && router.pathname !== "/login") {
    return null;
  }

  // ✅ 로그인 페이지는 Sidebar 없음
  if (isLoginPage) {
    return <Component {...pageProps} />;
  }

  // ✅ 로그인 된 일반 페이지
  return (
    <SideBar>
      <Component {...pageProps} />
    </SideBar>
  );
}
