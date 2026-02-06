import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { useAuthGuard } from "@/hooks/use-authGuard";

export default function AppLayout({ children }) {
  useAuthGuard();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <SideBar />

        <div className="flex flex-col flex-1 min-w-0">
          <Header />

          <main className="flex-1 overflow-y-auto bg-muted/30 p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
