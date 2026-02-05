import { useState } from "react"; // useState 추가됨
import { useAccount } from "@/stores/account-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  FileText,
  Calendar as CalendarIcon,
  ArrowRight,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { account } = useAccount();
  const router = useRouter();
  const userRole = account?.role;

  // 1. [해결 포인트] date와 setDate 상태 정의
  const [date, setDate] = useState(new Date());

  // 2. 근무 데이터 맵핑 함수
  const scheduleData = {
    "2026-02-05": { status: "오늘", color: "bg-indigo-600" },
    "2026-02-06": { status: "야간", color: "bg-orange-400" },
    "2026-02-10": { status: "휴무", color: "bg-rose-400" },
    "2026-02-12": { status: "출장", color: "bg-emerald-400" },
    "2026-02-15": { status: "주간", color: "bg-sky-400" },
  };

  const getDayData = (day) => {
    if (!day) return null;
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    return scheduleData[`${year}-${month}-${d}`];
  };

  const isManager = userRole === "ADMIN" || userRole === "PLANNER";

  const actions = isManager
    ? [
        {
          label: "시나리오 생성",
          desc: "생산 시뮬레이션 가동",
          icon: ClipboardList,
          href: "/scenarios/create",
          color: "text-indigo-600 bg-indigo-50",
        },
        {
          label: "사원 관리",
          desc: "인력 현황 및 권한 설정",
          icon: MessageSquare,
          href: "/management",
          color: "text-slate-600 bg-slate-100",
        },
        {
          label: "공지사항 관리",
          desc: "주요 소식 배포",
          icon: FileText,
          href: "/notice/announcements",
          color: "text-amber-600 bg-amber-50",
        },
      ]
    : [
        {
          label: "사원 게시판",
          desc: "동료와 소통하기",
          icon: MessageSquare,
          href: "/community/posts",
          color: "text-blue-600 bg-blue-50",
        },
        {
          label: "배포 작업 확인",
          desc: "오늘의 작업 리스트",
          icon: ClipboardList,
          href: "/deployment",
          color: "text-emerald-600 bg-emerald-50",
        },
        {
          label: "공지사항 조회",
          desc: "사내 공지 확인",
          icon: FileText,
          href: "/notice/announcements",
          color: "text-rose-600 bg-rose-50",
        },
      ];

  return (
    <div className="h-[calc(100vh-120px)] bg-white -m-8 p-6 flex flex-col gap-6 overflow-hidden">
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between border-b pb-4 border-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none mb-1">
              {isManager ? "Management" : "Workstation"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Welcome back, {account?.name}님
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-12 gap-6 flex-1 min-h-0">
        <Card className="col-span-7 border-slate-100 shadow-sm rounded-[24px] flex flex-col bg-white overflow-hidden">
          <CardHeader className="py-3 px-6 border-b border-slate-50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black flex items-center gap-2 text-slate-700">
              <CalendarIcon size={16} className="text-indigo-500" />
              Work Schedule
            </CardTitle>
            <div className="flex gap-2 text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> 주간
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> 야간
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> 휴무
              </div>
            </div>
          </CardHeader>

          {/* 캘린더 컨테이너: h-full과 justify-center를 주어 꽉 차게 배치 */}
          <CardContent className="flex-1 flex justify-center items-center p-4">
            <div className="w-full h-full flex justify-center items-center calendar-container">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-none"
                // Shadcn 내부 스타일 테마가 꼬일 경우를 대비해 인라인 클래스 보정
                classNames={{
                  day: "h-12 w-12 p-0 font-bold aria-selected:opacity-100 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-900", // 날짜 색상 강제
                  head_cell: "text-slate-400 font-medium w-12",
                  nav_button: "border border-slate-200 hover:bg-slate-50",
                }}
                components={{
                  DayContent: ({ date: day }) => {
                    const data = getDayData(day);
                    return (
                      <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm">{day.getDate()}</span>
                        {data && (
                          <div
                            className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${data.color} ring-2 ring-white`}
                          />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="col-span-5 flex flex-col gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className="flex-1 group flex items-center p-4 rounded-[24px] border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all text-left"
            >
              <div
                className={`p-3 rounded-xl ${action.color} group-hover:scale-105 transition-transform mr-4`}
              >
                <action.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {action.label}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {action.desc}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-300"
              />
            </button>
          ))}
        </div>
      </div>

      <footer className="max-w-6xl mx-auto w-full">
        <div className="bg-slate-50/80 rounded-[24px] p-4 border border-slate-50">
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-xs font-black text-slate-500 flex items-center gap-2 uppercase tracking-widest">
              Recent Updates
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "📌 하반기 안전 점검 실시", date: "2h ago" },
              { title: "📣 사원 게시판 새 글 알림", date: "5h ago" },
            ].map((news, idx) => (
              <div
                key={idx}
                className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-600 truncate mr-2">
                  {news.title}
                </span>
                <span className="text-[10px] font-medium text-slate-300 whitespace-nowrap">
                  {news.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
