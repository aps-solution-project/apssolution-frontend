import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function MainLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* 1. 사이드바 본체 */}
        <AppSidebar />
        
        {/* 2. 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto">
          <header className="flex h-16 items-center border-b px-4">
            <SidebarTrigger />
            <div className="ml-4 font-semibold text-slate-700">Bread Factory Management</div>
          </header>
          
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}