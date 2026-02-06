import { useRouter } from "next/router";
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
import {
  Home,
  NotebookPen,
  MessageSquareMore,
  Settings,
  Columns3,
  UserCog,
  Inbox,
  FlaskConical,
  Flag,
  BookMarked,
  ContactRound,
  Captions,
} from "lucide-react";
import { useAccount } from "@/stores/account-store";

const items = [
  { title: "대시보드", url: "/dashboard", icon: Home },
  { title: "시나리오", url: "/scenarios/create/form" },
  { title: "시뮬레이션 결과", url: "/simulations" },
  { title: "게시판", url: "/notice/announcements", icon: NotebookPen },
  { title: "채팅", url: "/chat/chat-list", icon: MessageSquareMore },
  { title: "설정", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const router = useRouter();
  const { account } = useAccount();
  const userRole = account?.role;
  const isManager = userRole === "ADMIN" || userRole === "PLANNER";
  const isWorker = userRole === "WORKER";

  const getFilteredSections = () => {
    const sections = [];

    // 1. 설계 엔진 (Manager 전용)
    if (isManager) {
      sections.push({
        title: "설계 엔진",
        items: [
          {
            label: "시나리오 설계",
            href: "/scenarios/create/form",
            icon: FlaskConical,
          },
          { label: "시뮬레이션 결과", href: "/simulations", icon: Settings },
        ],
      });
    }

    // 2. 게시판 (공통 + 권한 분기)
    const boardItems = [
      { label: "공지사항", href: "/notice/announcements", icon: Flag },
      { label: "자료실", href: "/resources/products", icon: BookMarked },
    ];
    if (isWorker) {
      boardItems.push({
        label: "사원 게시판",
        href: "/community/posts",
        icon: Captions,
      });
    }
    sections.push({ title: "게시판", items: boardItems });

    // 3. 나의 업무 (Worker 전용)
    if (isWorker) {
      sections.push({
        title: "나의 업무",
        items: [
          { label: "근무표", href: "/schedule", icon: Settings },
          { label: "배포 작업", href: "/deployment", icon: Settings },
        ],
      });
    }

    // 4. 채팅 (공통)
    sections.push({
      title: "채팅",
      items: [
        {
          label: "채팅하기",
          href: "/chat/chat-create",
          icon: MessageSquareMore,
        },
        { label: "채팅방 목록", href: "/chat/chat-list", icon: Settings },
      ],
    });

    // 5. 사원 관리 (Manager 전용)
    if (isManager) {
      sections.push({
        title: "관리",
        items: [
          { label: "사원 관리", href: "/management", icon: ContactRound },
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
          onClick={() => router.push("/dashboard")}
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
                    {/* 💡 tooltip={item.label}을 넣어줘야 접었을 때 이름이 나옵니다 */}
                    <SidebarMenuButton
                      tooltip={item.label}
                      onClick={() => router.push(item.href)}
                      isActive={router.pathname === item.href}
                    >
                      {item.icon && <item.icon className="w-2 h-2" />}
                      <span>{item.label}</span>
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
