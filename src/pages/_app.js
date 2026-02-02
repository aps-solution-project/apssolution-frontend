import "@/styles/globals.css";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useToken } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import SideBar from "@/components/layout/SideBar";
import { Spinner } from "@/components/ui/spinner";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const token = useToken((s) => s.token);
  const flag = useToken((s) => s.flag);
  const stompRef = useRef(null);

  const isLoginPage = router.pathname === "/login";

  useEffect(() => {
    useToken.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!token) return;
    if (stompRef.current) return;

    console.log("🔥 STOMP INIT EFFECT RUN");

    const client = new Client({
      webSocketFactory: () => new SockJS("http://192.168.0.20:8080/ws"),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("✅ STOMP connected");
        useStomp.getState().setStomp(client);
      },

      debug: (str) => console.log("[STOMP]", str),
    });

    client.activate();

    return () => {
      console.log("🧹 STOMP deactivate");
      client.deactivate();
      useStomp.getState().clearStomp();
    };
  }, [token]);

  // ⛔ 아직 persist 복구 안 됨
  if (!flag) {
    return (
      <div className="flex justify-center items-center gap-6 h-screen w-screen">
        <Spinner className="size-20" />
      </div>
    );
  }

  // ⛔ 인증 안 됐는데 로그인 페이지 아님
  if (!token && !isLoginPage) {
    router.replace("/login");
    return null;
  }

  // ✅ 로그인 페이지는 사이드바 없음
  if (isLoginPage) {
    return <Component {...pageProps} />;
  }

  // ✅ 나머지는 사이드바 포함
  return (
    <SideBar>
      <Component {...pageProps} />
    </SideBar>
  );
}
