import { AppSidebar } from "@/components/layout/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAccount } from "@/stores/account-store";
import { useRouter } from "next/router";
import GlobalSearch from "./GlobalSearch";
import { UserNav } from "./UserNav";
import { cn } from "@/lib/utils";

export default function MainLayout({ children }) {
  const router = useRouter();
  const { account } = useAccount();
  const isWorker = account?.role === "WORKER";
  const isCalendar = router.pathname === "/schedule";

  const isLoginPage = router.pathname === "/login";

  if (isLoginPage) {
    return <div className="h-screen w-full">{children}</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <main className="flex flex-1 flex-col h-full min-w-0 bg-slate-50/30 relative z-0">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white z-10">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger />
              <GlobalSearch />
              <Separator orientation="vertical" className="h-6" />
            </div>

            <div className="ml-auto flex items-center gap-4">
              <UserNav />
            </div>
          </header>

          <div
            className={cn(
              "flex-1 min-w-0 overflow-y-auto custom-scrollbar",
              isCalendar ? "p-0" : "p-8",
            )}
          >
            <div className="max-w-[1600px] mx-auto w-full h-full">
             {children} 
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
