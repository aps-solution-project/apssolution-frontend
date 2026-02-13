import Badge from "@/components/common/Badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAccount } from "@/stores/account-store";
import { useStomp } from "@/stores/stomp-store";
import {
  BellRing,
  CalendarFold,
  ClipboardList,
  ContactRound,
  FolderOpen,
  Hammer,
  Home,
  MessageSquareMore,
  NotebookPen,
} from "lucide-react";
import { useRouter } from "next/router";

export function AppSidebar() {
  const router = useRouter();
  const { account } = useAccount();

  // 🌟 각 상태를 개별 구독 (이게 핵심!)
  const totalUnreadCount = useStomp((state) => state.totalUnreadCount);
  const hasUnread = useStomp((state) => state.hasUnread);
  const hasScenarioUnread = useStomp((state) => state.hasScenarioUnread);

  const userRole = account?.role;
  const isManager = userRole === "ADMIN" || userRole === "PLANNER";
  const isWorker = userRole === "WORKER";

  const isLoginPage = router.pathname === "/login";

  if (isLoginPage) {
    return null;
  }

  const getFilteredSections = () => {
    const sections = [
      {
        title: "메인",
        items: [
          {
            label: "워크스페이스",
            href: "/",
            icon: Home,
          },
        ],
      },
    ];

    // 1. 설계 엔진 (Manager 전용)
    if (isManager) {
      sections.push({
        title: "설계 엔진",
        items: [
          {
            label: "시나리오 설계",
            href: "/scenarios",
            icon: Hammer,
          },
        ],
      });
    }

    // 2. 게시판 (공통 + 권한 분기)
    const boardItems = [
      {
        label: "공지사항",
        href: "/notice/list",
        icon: BellRing,
      },
    ];
    if (isManager) {
      boardItems.push({
        label: "자료실",
        href: "/resources/product",
        icon: FolderOpen,
      });
    }
    if (isWorker) {
      boardItems.push({
        label: "사원 게시판",
        href: "/community/list",
        icon: NotebookPen,
      });
    }
    sections.push({ title: "게시판", items: boardItems });

    // 3. 나의 업무 (Worker 전용)
    if (isWorker) {
      sections.push({
        title: "나의 업무",
        items: [
          {
            label: "근무표",
            href: "/calendar",
            icon: CalendarFold,
            badgeKey: "/calendar", // 🌟 배포 작업도 같은 키 사용
          },
          {
            label: "배포 작업",
            href: "/deployment",
            icon: ClipboardList,
          },
        ],
      });
    }

    // 3-1. 일정 관리 (Admin, Planner 전용)
    if (isManager) {
      sections.push({
        title: "캘린더",
        items: [
          {
            label: "캘린더",
            href: "/calendar",
            icon: CalendarFold,
            badgeKey: "/calendar",
          },
        ],
      });
    }

    // 4. 채팅 (공통)
    sections.push({
      title: "메신저",
      items: [
        {
          label: "채팅",
          href: "/chat",
          icon: MessageSquareMore,
          badgeKey: "/chat",
          showCount: true, // 🌟 채팅은 숫자 표시
        },
      ],
    });

    // 5. 사원 관리 (Manager 전용)
    if (isManager) {
      sections.push({
        title: "관리",
        items: [
          {
            label: "사원 관리",
            href: "/employees",
            icon: ContactRound,
          },
        ],
      });
    }

    return sections;
  };

  const menuSections = getFilteredSections();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 py-5">
        <div
          className="flex items-center gap-2 font-bold text-xl cursor-pointer"
          onClick={() => router.push("/")}
        >
          <img src="/images/logo.png" alt="logo" className="h-6 w-auto" />
          <span className="group-data-[collapsible=icon]:hidden">BakeFlow</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:invisible">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  // 🌟 배지 표시 로직
                  let shouldShowBadge = false;

                  if (item.badgeKey === "/chat") {
                    shouldShowBadge = hasUnread?.["/chat"] === true;
                  } else if (item.badgeKey === "/calendar") {
                    shouldShowBadge = hasScenarioUnread?.["/calendar"] === true;
                  }

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        onClick={() => router.push(item.href)}
                        isActive={router.pathname === item.href}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}

                        <span className="relative flex items-center">
                          {item.label}
                          {/* 🌟 채팅은 숫자, 나머지는 점만 */}
                          {shouldShowBadge && (
                            <>
                              {item.showCount && totalUnreadCount > 0 ? (
                                <Badge show={true} count={totalUnreadCount} />
                              ) : (
                                <Badge show={true} />
                              )}
                            </>
                          )}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
