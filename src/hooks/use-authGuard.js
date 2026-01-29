// 페이지마다 토큰인증

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useToken } from "@/stores/account-store";

export function useAuthGuard() {
  const token = useToken((s) => s.token);
  const router = useRouter();

  // console.log("AuthGuard token:", token); <-- 토큰 인증하고 있는지 확인용

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token]);
}
