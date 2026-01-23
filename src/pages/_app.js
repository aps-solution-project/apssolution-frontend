import "@/styles/globals.css";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useToken } from "@/stores/account-store";
import SideBar from "@/components/layout/SideBar";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const token = useToken((state) => state.token);

  const isLoginPage = router.pathname === "/Login";

  useEffect(() => {
    console.log(!token && !isLoginPage);

    if (!token && !isLoginPage) {
      router.replace("/Login");
    }
  }, [token, isLoginPage, router]);

  if (isLoginPage) {
    return <Component {...pageProps} />;
  }

  return (
    <SideBar>
      <Component {...pageProps} />
    </SideBar>
  );
}
