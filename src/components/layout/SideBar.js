import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { useAuthGuard } from "@/hooks/use-authGuard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import Link from "next/link";
import Header from "./Header";

import {
  Columns3Cog,
  Inbox,
  PackageCheck,
  Settings,
  Wrench,
} from "lucide-react";
import { useStomp } from "@/stores/stomp-store";

const sections = [
  {
    title: "설계 엔진",
    icon: Columns3Cog,
    items: [
      { label: "주문 항목 생성", href: "/scenarios/create" },
      { label: "시뮬레이션 결과(gantt임시 페이지)", href: "/simulations" },
    ],
  },

  {
    title: "게시판",
    icon: Inbox,
    items: [
      { label: "공지사항", href: "/notice/announcements" },
      { label: "자료실", href: "/resources/products" },
      { label: "사원 게시판", href: "/community/posts" },
    ],
  },
  {
    title: "도구",
    icon: Wrench,
    items: [{ label: "도구 관리", href: "/tools" }],
  },
  {
    title: "작업 공정",
    icon: PackageCheck,
    items: [{ label: "작업 관리", href: "/tasks" }],
  },
  {
    title: "관리",
    icon: Settings,
    items: [
      { label: "사원 관리", href: "/management" },
      { label: "채팅하기", href: "/chat/chat-create" },
      { label: "채팅방 목록", href: "/chat/chat-list" },
    ],
  },
];

export default function SideBar({ children }) {
  useAuthGuard();
  const hasUnread = useStomp((state) => state.hasUnread);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen overflow-x-hidden">
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <Collapsible key={section.title} defaultOpen>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{section.title}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((item) => {
                            const showUnreadDot =
                              hasUnread && item.href === "/chat/chat-list";

                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <Link
                                  href={item.href}
                                  className="flex items-center justify-between w-full pr-2"
                                >
                                  <span>{item.label}</span>

                                  {/* 안 읽은 메시지가 있다면 레드닷 표시 */}
                                  {showUnreadDot && (
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                  )}
                                </Link>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
          <Header />
          <main className="  bg-muted/30 p-6 min-h-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
