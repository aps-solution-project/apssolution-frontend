import { useAccount } from "@/stores/account-store";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { UserNav } from "./UserNav";
import { useRouter } from "next/router";

export default function MainLayout({ children }) {
  const router = useRouter();

  const isCalendar = router.pathname === "/schedule";

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* 1. 사이드바 본체 */}
        <AppSidebar />

        {/* 2. 메인 콘텐츠 영역 */}
        <main className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white z-10">
            <div className="flex items-center gap-4 flex-1">
              {/* 사이드바 열고 닫는 버튼은 여기서 관리 */}
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              {!isWorker && (
                <div className="flex-1 max-w-2xl">
                  <GlobalSearch />
                </div>
              )}
            </div>

            {/* 오른쪽 끝에 사용자 메뉴 배치 */}
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
