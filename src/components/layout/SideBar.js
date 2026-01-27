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

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

import Header from "./Header";
import Link from "next/link";

import { Calendar, Inbox, Settings, Columns3Cog } from "lucide-react";

const sections = [
  {
    title: "설계 엔진",
    icon: Columns3Cog,
    items: [
      { label: "주문 항목 생성", href: "/scenarios" },
      { label: "시뮬레이션 결과", href: "/simulations" },
    ],
  },
  {
    title: "생산 계획",
    icon: Calendar,
    items: [{ label: "프로덕션 타임라인", href: "/schedules" }],
  },
  {
    title: "게시판",
    icon: Inbox,
    items: [
      { label: "공지사항", href: "/notice/announcements" },
      { label: "자료실", href: "/resources" },
      { label: "사원 게시판", href: "/forum" },
    ],
  },
  {
    title: "도구 (Tools)",
    icon: Columns3Cog, // 적절한 아이콘으로 변경 가능
    items: [
      { label: "도구 관리", href: "/tools" },
      { label: "도구 카테고리 관리", href: "/tools/category" },
    ],
  },
  {
    title: "관리",
    icon: Settings,
    items: [{ label: "사원 관리", href: "/management" }],
  },
];

export default function SideBar({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
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

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
