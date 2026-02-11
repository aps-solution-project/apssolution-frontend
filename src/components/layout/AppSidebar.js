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
  Brain,
  CalendarDays,
  Captions,
  ClipboardCheck,
  ContactRound,
  FlaskRound,
  Home,
  MessageSquareMore,
  MessagesSquare,
  NotebookPen,
} from "lucide-react";
import { useRouter } from "next/router";

export function AppSidebar() {
  const router = useRouter();
  const { account } = useAccount();
  const { totalUnreadCount } = useStomp();
  const userRole = account?.role;
  const isManager = userRole === "ADMIN" || userRole === "PLANNER";
  const isWorker = userRole === "WORKER";
  const hasUnread = useStomp((state) => state.hasUnread);
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
            icon: FlaskRound,
          },
        ],
      });
    }

    // 2. 게시판 (공통 + 권한 분기)
    const boardItems = [
      { label: "공지사항", href: "/notice/list", icon: NotebookPen },
    ];
    if (isManager) {
      boardItems.push({
        label: "자료실",
        href: "/resources/task",
        icon: Brain,
      });
    }
    if (isWorker) {
      boardItems.push({
        label: "사원 게시판",
        href: "/community/list",
        icon: Captions,
      });
    }
    sections.push({ title: "게시판", items: boardItems });

    // 3. 나의 업무 (Worker 전용)
    if (isWorker) {
      sections.push({
        title: "나의 업무",
        items: [
          { label: "근무표", href: "/calendar", icon: CalendarDays },
          { label: "배포 작업", href: "/deployment", icon: ClipboardCheck },
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
        },
      ],
    });

    // 5. 사원 관리 (Manager 전용)
    if (isManager) {
      sections.push({
        title: "관리",
        items: [{ label: "사원 관리", href: "/employees", icon: ContactRound }],
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
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      onClick={() => router.push(item.href)}
                      isActive={router.pathname === item.href}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                      <Badge show={hasUnread[item.href]} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
