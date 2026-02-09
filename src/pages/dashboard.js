import { useState, useEffect } from "react";
import { useAccount } from "@/stores/account-store";
import { useToken } from "@/stores/account-store";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/router";
import { getNotices } from "@/api/notice-api";
import {
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  FileText,
  Calendar as CalendarIcon,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { account } = useAccount();
  const { token } = useToken();
  const router = useRouter();
  const userRole = account?.role;

  const [date, setDate] = useState(new Date());
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    if (!token) return;

    getNotices(token)
      .then((data) => {
        const list = data?.notices ?? [];
        setNotices(list.slice(0, 2));
      })
      .catch(console.error);
  }, [token]);

  // 근무 데이터 맵핑
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

  const formatKey = (day) =>
    `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
      day.getDate(),
    ).padStart(2, "0")}`;

  const modifiers = {
    work: (day) => {
      const key = formatKey(day);
      return scheduleData[key]?.status === "주간";
    },
    night: (day) => {
      const key = formatKey(day);
      return scheduleData[key]?.status === "야간";
    },
    off: (day) => {
      const key = formatKey(day);
      return scheduleData[key]?.status === "휴무";
    },
  };

  function formatRelativeTime(dateString) {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  return (
    <div className="flex flex-col gap-10 pb-12 px-6">
      <div className="max-w-6xl mx-auto w-full pt-4">
        <h1 className="text-2xl font-black text-slate-800">워크스페이스</h1>
        <p className="text-sm text-slate-400 mt-1">
          오늘의 일정과 주요 작업을 확인하세요
        </p>
      </div>
      {/* 상단 메인 레이아웃: 달력과 버튼 */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-12 gap-8 items-stretch">
        {/* [왼쪽] 달력 영역 (4/12 비율) */}
        <div className="col-span-5 bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
          <div className="py-5 px-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-slate-700 shrink-0">
              <CalendarIcon size={18} className="text-indigo-500" />
              Work Schedule
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> 주간
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                야간
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> 휴무
              </div>
            </div>
          </div>

          <div className="p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              modifiers={modifiers}
              modifiersClassNames={{
                work: "after:bg-sky-400",
                night: "after:bg-yellow-400",
                off: "after:bg-gray-400",
              }}
              classNames={{
                day: `
      relative
      after:content-['']
      after:absolute
      after:bottom-1
      after:left-1/2
      after:-translate-x-1/2
      after:w-1.5
      after:h-1.5
      after:rounded-full
    `,
              }}
            />
          </div>
        </div>

        {/* [오른쪽] 버튼 영역 (8/12 비율 - 더 시원하게 늘어남) */}
        <div className="col-span-7 flex flex-col gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              className="group flex items-center p-6 bg-white rounded-[32px] border border-slate-100 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] transition-all text-left"
            >
              <div
                className={`p-5 rounded-2xl ${action.color} mr-6 group-hover:scale-110 transition-transform`}
              >
                <action.icon size={28} />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {action.label}
                </h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  {action.desc}
                </p>
              </div>

              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:rotate-[-45deg] transition-all duration-300">
                <ArrowRight
                  size={24}
                  className="text-slate-300 group-hover:text-white transition-colors"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 업데이트 섹션 */}
      <footer className="max-w-6xl mx-auto w-full">
        <div className="bg-slate-50/80 rounded-[32px] p-6 border border-slate-50">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Recent Updates
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                onClick={() =>
                  router.push(`/notice/${notice.id}`)
                }
                className="bg-white px-5 py-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-indigo-200 hover:shadow-sm hover:-translate-y-0.5 transition-all group"
              >
                <span className="text-sm font-bold text-slate-600 truncate mr-2 group-hover:text-indigo-600 transition-colors">
                  {notice.title}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                    {formatRelativeTime(notice.createdAt)}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-slate-200 group-hover:text-indigo-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
