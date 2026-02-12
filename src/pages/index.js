import { ko } from "date-fns/locale";
import { getNotices } from "@/api/notice-api";
import { getMonthlyCalendars } from "@/api/calendar-api";
import { Calendar } from "@/components/ui/calendar";
import { useAccount, useToken } from "@/stores/account-store";
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
import { keyOf } from "@/lib/date";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const { account } = useAccount();
  const { token } = useToken();
  const router = useRouter();
  const userRole = account?.role;

  const [date, setDate] = useState(new Date());
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [cursorDate, setCursorDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(keyOf(new Date()));
  const [notices, setNotices] = useState([]);
  const [serverSchedules, setServerSchedules] = useState([]);

  // 1. 공지사항 초기 로드
  useEffect(() => {
    if (!token) return;
    getNotices(token)
      .then((data) => setNotices((data?.notices ?? []).slice(0, 2)))
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    const loadSchedules = async () => {
      if (!token) return;
      try {
        const monthNum = displayMonth.getMonth() + 1;
        // ⚠️ 주의: api 정의에 따라 (token, monthNum) 또는 (monthNum, token) 순서를 확인하세요.
        // 로그의 401 에러는 토큰이 인자로 제대로 안 들어갔을 때 발생합니다.
        const data = await getMonthlyCalendars(token, monthNum);

        // 서버 응답 구조에 맞춰 데이터 추출
        const schedules =
          data?.monthlySchedules || data?.schedules || data || [];
        setServerSchedules(Array.isArray(schedules) ? schedules : []);
        console.log(`${monthNum}월 데이터 로드 완료:`, schedules);
      } catch (err) {
        console.error("❌ 데이터 로드 실패:", err);
      }
    };

    loadSchedules();
  }, [displayMonth, token]);

  const goToday = () => {
    const today = new Date();
    setCursorDate(today);
    setSelectedDateKey(keyOf(today));
    setDisplayMonth(today);
  };

  const getStatusByDay = (day) => {
    if (!Array.isArray(serverSchedules)) return null;
    const formatted = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    return (
      serverSchedules.find((item) => item.date === formatted)?.shift || null
    );
  };

  const modifiers = useMemo(
    () => ({
      work: (day) => getStatusByDay(day) === "day",
      night: (day) => getStatusByDay(day) === "night",
    }),
    [serverSchedules],
  );

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
    <div className="flex flex-col gap-5">
      {/* 1. 헤더 영역 (페이지 전체 타이틀) */}
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-end border-b pb-3 border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600">
              <Home size={20} />
              <span className="text-xs font-black uppercase tracking-widest">
                Overview
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {account?.name ? `${account.name}님, 반갑습니다.` : "Dashboard"}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              오늘의 일정과 주요 작업을 확인하세요
            </p>
          </div>
          <div className="text-right pb-1">
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border">
              {/* 🌟 선택된 date가 있으면 그 날짜를, 없으면 오늘 날짜를 표시 */}
              {(date || new Date()).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 메인 그리드 영역 (달력 카드 + 버튼 리스트) */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-12 gap-6 items-stretch">
        {/* [왼쪽] 달력 카드 영역 (col-span-5) */}
        <div className="col-span-5 bg-white rounded-[32px] border border-slate-50 shadow-sm overflow-hidden flex flex-col h-full">
          {/* 달력 카드 상단 바: Work Schedule -- TODAY -- 범례 */}
          <div className="py-3 px-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-slate-700">
              <CalendarIcon size={18} className="text-indigo-500" />
              Work Schedule
            </div>

            <button
              onClick={goToday}
              className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl hover:bg-indigo-100 border border-indigo-100 transition-all shadow-sm active:scale-95"
            >
              TODAY
            </button>

            <div className="flex gap-2 text-[10px] font-bold text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> 주간
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> 야간
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> 휴무
              </div>
            </div>
          </div>

          {/* 달력 본체 영역 */}
          <div className="py-2 flex justify-center">
            <Calendar
              mode="single"
              selected={cursorDate}
              onSelect={(newDate) => {
                if (newDate) {
                  setCursorDate(newDate);
                  setSelectedDateKey(keyOf(newDate));
                }
              }}
              month={displayMonth} // 🌟 현재 달력 화면 제어
              onMonthChange={setDisplayMonth} // 🌟 화살표 클릭 시 displayMonth 변경 -> useEffect 실행
              classNames={{
                caption:
                  "relative flex justify-center items-center h-10 mb-8 w-full",
                caption_label: "text-lg font-black text-slate-800",
                nav: "flex items-center justify-between absolute w-full px-2 z-10",
                nav_button:
                  "h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white hover:bg-slate-50 shadow-sm transition-all",
                table: "w-full border-collapse",
                head_row: "flex w-full justify-between mb-4 px-1",
                head_cell:
                  "text-slate-400 w-10 font-bold text-[12px] uppercase",
                row: "flex w-full justify-between mt-2 px-1",
                cell: "relative p-0 text-center focus-within:relative focus-within:z-20",
              }}
              components={{
                Day: (props) => {
                  const dayDate = props.date || props.day?.date;
                  if (!dayDate) return null;

                  const formatted = keyOf(dayDate);
                  const schedule = serverSchedules?.find(
                    (s) => s.date === formatted,
                  );
                  const isSelected = selectedDateKey === formatted;

                  // 기본 스타일 정의
                  const baseClass =
                    "relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all cursor-pointer";
                  const selectedClass = isSelected
                    ? "bg-slate-100 text-indigo-600 font-bold"
                    : "text-slate-700 font-medium hover:bg-slate-50";

                  // 1. 일정이 있는 경우에만 HoverCard 적용
                  if (schedule) {
                    return (
                      <td {...props} className="p-0">
                        <HoverCard openDelay={0} closeDelay={0}>
                          <HoverCardTrigger asChild>
                            <div className={`${baseClass} ${selectedClass}`}>
                              {dayDate.getDate()}
                              {/* 일정 점 표시 */}
                              <div
                                className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                                  schedule.shift === "day"
                                    ? "bg-sky-400"
                                    : "bg-yellow-400"
                                }`}
                              />
                            </div>
                          </HoverCardTrigger>

                          <HoverCardContent
                            side="top"
                            className="w-48 p-4 rounded-2xl shadow-2xl border-none bg-white/95 backdrop-blur-md z-[100]"
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
                      </td>
                    );
                  }

                  // 2. 일정이 없는 평범한 날
                  return (
                    <td {...props} className="p-0">
                      <div className={`${baseClass} ${selectedClass}`}>
                        {dayDate.getDate()}
                      </div>
                    </td>
                  );
                },
              }}
            />
          </div>
        </div>

        {/* [오른쪽] 버튼 영역 */}
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

      {/* 3. 하단 업데이트 섹션 (푸터) */}
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
