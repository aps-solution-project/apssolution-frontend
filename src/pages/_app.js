import "@/styles/globals.css";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useToken } from "@/stores/account-store";
import SideBar from "@/components/layout/SideBar";
import { Spinner } from "@/components/ui/spinner";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const token = useToken((s) => s.token);
  const flag = useToken((s) => s.flag);

  useEffect(() => {
    useToken.persist.rehydrate();
  }, []);

  if (!flag) {
    return (
      <div className="flex justify-center items-center gap-6 h-screen w-screen">
        <Spinner className="size-20" />
      </div>
    );
  }

  if (!token && router.asPath !== "/login") {
    router.replace("/login");
    return null;
  }

  if (router.asPath === "/login") {
    return <Component {...pageProps} />;
  }
  return (
    <SideBar>
      <Component {...pageProps} />
    </SideBar>
  );
}
