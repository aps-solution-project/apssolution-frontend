import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAccount } from "@/stores/account-store";
import { useRouter } from "next/router";
import GlobalSearch from "./GlobalSearch";
import { UserNav } from "./UserNav";

export default function MainLayout({ children }) {
  const router = useRouter();
  const { account } = useAccount();
  const isWorker = account?.role === "WORKER";
  const isCalendar = router.pathname === "/schedule";

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <main className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white z-10">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
            </div>

            <div className="ml-auto flex items-center gap-4">
              <UserNav />
            </div>
          </header>

          <div
            className={[
              "flex-1 min-h-0 min-w-0 overflow-hidden",
              isCalendar ? "p-0" : "p-8",
            ].join(" ")}
          >
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
