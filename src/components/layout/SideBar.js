import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { useAccount } from "@/stores/account-store"; // 계정 스토어 추가
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import Link from "next/link";

import {
  CalendarDays,
  Columns3Cog,
  Inbox,
  PackageCheck,
  Settings,
  Wrench,
  MessageSquareMore,
} from "lucide-react";
import { useStomp } from "@/stores/stomp-store";

export default function SideBar() {
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

    const chatItems = [
      { label: "채팅하기", href: "/chat/chat-create" },
      { label: "채팅방 목록", href: "/chat/chat-list" },
    ];
    sections.push({
      title: "채팅",
      icon: MessageSquareMore,
      items: chatItems,
    });

    // 5. 관리 및 채팅 (공통 + 사원관리 분기)
    if (isManager) {
      sections.push({
        title: "사원 관리",
        icon: Settings,
        items: [{ label: "사원 관리", href: "/management" }],
      });
    }

    return sections;
  };

  const filteredSections = getFilteredSections();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          {filteredSections.map((section) => {
            const Icon = section.icon;

            return (
              <Collapsible key={section.title} defaultOpen>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Icon className="h-4 w-4" />
                      <span className="font-bold">{section.title}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {section.items.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <Link href={item.href}>{item.label}</Link>
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
  );
}
