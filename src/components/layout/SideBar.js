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
import { useAccount } from "@/stores/account-store"; // 계정 스토어 추가
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import Link from "next/link";

import { useStomp } from "@/stores/stomp-store";
import {
  CalendarDays,
  Columns3Cog,
  Inbox,
  PackageCheck,
  Settings,
  Wrench,
} from "lucide-react";

export default function SideBar({ children }) {
  useAuthGuard();
  const { account } = useAccount(); // 현재 로그인한 사용자 정보 가져오기
  const userRole = account?.role; // 'ADMIN', 'PLANNER', 'WORKER' 등
  const hasUnread = useStomp((state) => state.hasUnread);

  // 권한별 메뉴 구성 로직
  const getFilteredSections = () => {
    const isManager = userRole === "ADMIN" || userRole === "PLANNER";
    const isWorker = userRole === "WORKER";

    const sections = [];

    // 1. 설계 엔진 (ADMIN, PLANNER 전용)
    if (isManager) {
      sections.push({
        title: "설계 엔진",
        icon: Columns3Cog,
        items: [
          { label: "지희꺼", href: "/scenarios/create/form" },
          { label: "주문 항목 생성", href: "/scenarios/create" },
          { label: "시뮬레이션 결과", href: "/simulations" },
        ],
      });
    }

    // 2. 게시판 (공통 + 권한별 분기)
    const boardItems = [
      { label: "공지사항", href: "/notice/announcements" },
      { label: "자료실", href: "/resources/products" },
    ];
    // 사원 게시판은 WORKER만 작성/수정이 가능하다고 하셨으니 리스트 노출도 WORKER 위주로 설정
    if (isWorker) {
      boardItems.push({ label: "사원 게시판", href: "/community/posts" });
    }

    sections.push({
      title: "게시판",
      icon: Inbox,
      items: boardItems,
    });

    // 3. 도구 & 작업 (ADMIN, PLANNER 전용)
    if (isManager) {
      sections.push(
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
      );
    }

    // 4. 근무/배포 (WORKER 전용)
    if (isWorker) {
      sections.push({
        title: "나의 업무",
        icon: CalendarDays,
        items: [
          { label: "근무표", href: "/schedule" }, // 경로 임시 설정
          { label: "배포 작업", href: "/deployment" }, // 경로 임시 설정
        ],
      });
    }

    // 5. 관리 및 채팅 (공통 + 사원관리 분기)
    const managementItems = [];
    if (isManager) {
      managementItems.push({ label: "사원 관리", href: "/management" });
    }
    managementItems.push(
      { label: "채팅하기", href: "/chat/chat-create" },
      { label: "채팅방 목록", href: "/chat/chat-list" },
    );

    sections.push({
      title: "관리",
      icon: Settings,
      items: managementItems,
    });

    return sections;
  };

  const filteredSections = getFilteredSections();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen overflow-x-hidden">
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              {filteredSections.map((section) => {
                const Icon = section.icon;

                return (
                  <Collapsible key={section.title} defaultOpen>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-bold">{section.title}</span>
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
                                  className="flex items-center justify-between w-full pr-2 py-1 text-sm hover:text-indigo-600 transition-colors"
                                >
                                  <span>{item.label}</span>
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
          <main className="bg-muted/30 min-h-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
