// 페이지마다 토큰 인증 (추가 보호 - _app.js에서 이미 체크함)
import { useToken } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useAuthGuard() {
  const token = useToken((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    // _app.js에서 이미 체크하므로, 추가 보호용
    if (!token && router.isReady) {
      router.replace("/login");
    }
  }, [token, router]);
}
