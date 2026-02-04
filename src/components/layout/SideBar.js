import { getMyChats } from "@/api/chat-api";
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
import { useToken } from "@/stores/account-store";

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
import { useEffect, useState } from "react";

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
  if (!token) return;

  useAuthGuard();
  const { token } = useToken();
  // const hasUnread = useStomp((state) => state.hasUnread);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // 💡 토큰이 없거나 'null', 'undefined' 문자열인 경우 아예 실행 안 함
    if (!token) {
      setHasUnread(false);
      return;
    }

    const checkUnread = async () => {
      try {
        if (!token) return;
        // API 호출 직전 토큰 재확인
        const response = await getMyChats(token);
        const rooms = response?.myChatList || [];

        let exists = false;
        for (const room of rooms) {
          if (Number(room.unreadCount) > 0) {
            exists = true;
            break;
          }
        }
        setHasUnread(exists);
      } catch (err) {
        if (err.message.includes("401")) {
          setHasUnread(false);
        }
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, [token]);

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
                          {section.items.map((item) => (
                            <SidebarMenuSubItem key={item.href}>
                              <Link
                                href={item.href}
                                className="flex items-center justify-between w-full pr-2"
                              >
                                <span>{item.label}</span>

                                {/* 🔴 '채팅방 관리' 메뉴이고 안 읽은 메시지가 있다면 레드닷 표시 */}
                                {item.label === "채팅방 관리" && hasUnread && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuSubItem>
                          ))}
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
