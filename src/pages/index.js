import { getNotices } from "@/api/notice-api";
import { getMonthlyCalendars } from "@/api/calendar-api";
import { Calendar } from "@/components/ui/calendar";
import { useAccount, useToken } from "@/stores/account-store";
import { keyOf } from "@/lib/date";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  ClipboardList,
  FileText,
  Home,
  MessageSquare,
  X,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { account } = useAccount();
  const { token } = useToken();
  const router = useRouter();
  const userRole = account?.role;

  const [date, setDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [notices, setNotices] = useState([]);
  const [serverSchedules, setServerSchedules] = useState([]);
  const [cursorDate, setCursorDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(keyOf(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. 공지사항 초기 로드
  useEffect(() => {
    if (!token) return;
    getNotices(token)
      .then((data) => {
        const list = data?.notices ?? [];
        setNotices(list.slice(0, 2));
      })
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token || !date || !(date instanceof Date) || isNaN(date.getTime()))
      return;
    const targetDate = new Date(date);
    const monthNum = targetDate.getMonth() + 1;
    if (monthNum === currentMonth) return;

    getMonthlyCalendars(token, monthNum)
      .then((data) => {
        // 데이터가 monthlySchedules 안에 있으므로 정확히 맵핑
        const schedules = data.monthlySchedules || [];
        setServerSchedules(schedules);
        setCurrentMonth(monthNum); // 현재 로드된 월 업데이트
      })
      .catch(console.error);
  }, [token, date]);

  // 2. 달력 데이터 로드 (월 변경 감지)
  useEffect(() => {
    // 🌟 방어 코드: token이 없거나 date가 유효하지 않으면 실행 중단
    if (!token || !date || !(date instanceof Date) || isNaN(date.getTime())) {
      return;
    }

    // 🌟 백엔드가 원하는 것은 "2026-02" 문자열이 아니라 숫자 '월'입니다.
    const monthNum = date.getMonth() + 1;
    if (typeof monthNum !== "number" || isNaN(monthNum)) return;

    getMonthlyCalendars(token, monthNum)
      .then((data) => {
        const schedules = data.monthlySchedules || data.schedules || data || [];
        setServerSchedules(schedules);
      })
      .catch((err) => {
        console.error("❌ 데이터 로드 실패:", err);
      });
  }, [token, date]);

  // 4. 특정 날짜의 상태를 찾는 함수 (useMemo 대신 매번 호출)
  const getStatusByDay = (day) => {
    if (!Array.isArray(serverSchedules)) return null;
    // 1. 달력의 날짜를 문자열로 변환 (예: 2026-02-11)
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    const targetKey = `${y}-${m}-${d}`;

    // 2. 서버 데이터와 비교 (데이터가 있는지 로그로 확인)
    const found = serverSchedules.find((item) => item.date === targetKey);

    if (found) {
      return found.shift;
    }
    return null;
  };

  // 5. 달력 Modifiers 설정
  const modifiers = useMemo(
    () => ({
      work: (day) => getStatusByDay(day) === "day",
      night: (day) => getStatusByDay(day) === "night",
    }),
    [serverSchedules],
  );

  const selectedSchedule = useMemo(() => {
    if (!date || !Array.isArray(serverSchedules)) return null;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const targetKey = `${y}-${m}-${d}`;

    return serverSchedules.find((item) => item.date === targetKey);
  }, [date, serverSchedules]);

  const goToday = () => {
    const today = new Date();
    setDate(today); // Calendar가 보고 있는 실제 선택값 업데이트
    setCursorDate(today); // 필요하다면 동기화
    setSelectedDateKey(keyOf(today));
  };

  const isManager = userRole === "ADMIN" || userRole === "PLANNER";

  const actions = isManager
    ? [
        {
          label: "시나리오 생성",
          desc: "생산 시뮬레이션 가동",
          icon: ClipboardList,
          href: "/scenarios",
          color: "text-indigo-600 bg-indigo-50",
        },
        {
          label: "사원 관리",
          desc: "인력 현황 및 권한 설정",
          icon: MessageSquare,
          href: "/employees",
          color: "text-slate-600 bg-slate-100",
        },
        {
          label: "공지사항 관리",
          desc: "주요 소식 배포",
          icon: FileText,
          href: "/notice/list",
          color: "text-amber-600 bg-amber-50",
        },
      ]
    : [
        {
          label: "사원 게시판",
          desc: "동료와 소통하기",
          icon: MessageSquare,
          href: "/community/list",
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
          href: "/notice/list",
          color: "text-rose-600 bg-rose-50",
        },
      ];

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
    <div className="space-y-4">
      {/* Header 영역 */}
      <div className="">
        <div className="flex justify-between items-end border-b pb-2 border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Home size={20} />
              <span className="text-xs font-black uppercase tracking-widest">
                WORKSPACE
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {account?.name ? `${account.name}님, 반갑습니다.` : "Dashboard"}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              오늘의 업무 현황과 주요 공지사항을 확인하세요.
            </p>
          </div>

          {/* 필요하다면 우측에 오늘 날짜 표시 */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-500">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-12 gap-8 items-stretch">
        {/* [왼쪽] 달력 영역 */}
        <div className="col-span-5 bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
          <div className="py-5 px-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-slate-700">
              <CalendarIcon size={18} className="text-indigo-500" />
              Work Schedule
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 ml-2 px-3 rounded-lg border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs"
                onClick={goToday}
              >
                Today
              </Button>
              <div className="w-[1px] h-3 bg-slate-200" />
              <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> 주간
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{" "}
                  야간
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> 휴무
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              month={date}
              onMonthChange={setDate}
              modifiers={modifiers}
              modifiersClassNames={{
                work: "day-dot",
                night: "night-dot",
              }}
              components={{
                DayContent: ({ date: dayDate }) => {
                  const formatted = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`;
                  const schedule = serverSchedules?.find(
                    (s) => s.date === formatted,
                  );

                  if (!schedule) {
                    return (
                      <span className="relative z-10">{dayDate.getDate()}</span>
                    );
                  }

                  return (
                    /* portal을 지원한다면 HoverCardContent를 Portal로 감싸는 것이 가장 확실합니다 */
                    <HoverCard openDelay={100}>
                      <HoverCardTrigger asChild>
                        {/* 💡 핵심: 부모 버튼의 이벤트를 방해하지 않도록 w-full h-full 지정 */}
                        <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-20">
                          {dayDate.getDate()}
                        </div>
                      </HoverCardTrigger>
                      {/* 💡 sideOffset을 주어 날짜와 겹치지 않게 함 */}
                      <HoverCardContent
                        side="top"
                        sideOffset={8}
                        className="w-48 p-4 rounded-2xl shadow-2xl border border-slate-100 bg-white/95 backdrop-blur-md z-[9999]"
                      >
                        <div className="space-y-2 text-left">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              schedule.shift === "day"
                                ? "bg-sky-100 text-sky-600"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {schedule.shift?.toUpperCase()}
                          </span>
                          <h4 className="text-sm font-black text-slate-800 truncate">
                            {schedule.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-indigo-500 text-[11px] font-bold">
                            <Clock size={12} />
                            {schedule.startTime?.substring(0, 5)} -{" "}
                            {schedule.endTime?.substring(0, 5)}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                },
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
            <button
              onClick={() => router.push("/notice/list")}
              className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              모두 보기
            </button>
          </div>

          {notices && notices.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => router.push(`/notice/${notice.id}`)}
                  className="bg-white px-5 py-4 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-indigo-200 hover:shadow-sm hover:-translate-y-0.5 transition-all group"
                >
                  <span className="text-sm font-bold text-slate-600 truncate mr-2 group-hover:text-indigo-600 transition-colors">
                    {notice.title}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
                      {/* 필드명이 createdDate일 수도 있으니 확인 필요 */}
                      {formatRelativeTime(
                        notice.createdAt || notice.createdDate,
                      )}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-slate-200 group-hover:text-indigo-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm font-medium text-slate-400">
                등록된 공지사항이 없습니다.
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
