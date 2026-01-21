import "@/styles/globals.css";

import SideBar from "@/components/layout/SideBar";
export default function App({ Component, pageProps }) {
  return (
    <SideBar>
      <Component {...pageProps} />
    </SideBar>
  );
}
