import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { UserNav } from "./UserNav";

export default function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* 1. 사이드바 본체 */}
        <AppSidebar />

        {/* 2. 메인 콘텐츠 영역 */}
        <main className="flex flex-1 flex-col min-w-0 min-h-0 bg-background overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
            <div className="flex items-center gap-4">
              {/* 사이드바 열고 닫는 버튼은 여기서 관리 */}
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="font-semibold text-slate-700">
                Bread Factory Management
              </h1>
            </div>

            {/* 오른쪽 끝에 사용자 메뉴 배치 */}
            <div className="ml-auto flex items-center gap-4">
              <UserNav />
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-hidden p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
