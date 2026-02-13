import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount, useToken } from "@/stores/account-store";
import { FileText, LogOut, UserCog } from "lucide-react";
import { useRouter } from "next/router";

const API_BASE_URL = "${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}";

const ROLE_CONFIG = {
  ADMIN: {
    label: "ADMIN",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  PLANNER: {
    label: "PLANNER",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-400",
  },
  WORKER: {
    label: "WORKER",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
  },
};

export function UserNav() {
  const router = useRouter();
  const { clearToken } = useToken();
  const { account, clearAccount } = useAccount();

  const handleLogout = () => {
    clearToken();
    clearAccount();
    router.push("/login");
  };

  const name = account?.name || "사용자";
  const role = ROLE_CONFIG[account?.role] || ROLE_CONFIG.WORKER;
  const initials = name.slice(0, 2);
  const profileImage = account?.profileImageUrl
    ? account.profileImageUrl.startsWith("http")
      ? account.profileImageUrl
      : `${API_BASE_URL}${account.profileImageUrl}`
    : null;

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center gap-3">
        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            text-[10px] font-semibold tracking-wider uppercase
            ${role.bg} ${role.text}
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${role.dot}`} />
          {role.label}
        </span>

        <span className="text-[13px] font-medium text-slate-500 tracking-tight">
          {name}
        </span>
      </div>

      <div className="hidden sm:block w-px h-6 bg-slate-200" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group relative rounded-full outline-none">
            <Avatar className="h-9 w-9 ring-2 ring-slate-100 transition-all duration-200 group-hover:ring-slate-300 group-hover:scale-105">
              <AvatarImage
                src={profileImage}
                alt={name}
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-800 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* 온라인 인디케이터 */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-60 rounded-xl border border-slate-100 shadow-lg shadow-slate-200/50 p-1"
          align="end"
          sideOffset={8}
          forceMount
        >
          {/* 프로필 헤더 */}
          <div className="flex items-center gap-3 px-3 py-3 mb-1">
            <Avatar className="h-10 w-10 ring-2 ring-slate-100">
              <AvatarImage
                src={profileImage}
                alt={name}
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-800 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">
                {name}
              </span>
              <span
                className={`
                  inline-flex items-center gap-1 w-fit
                  text-[10px] font-medium tracking-wide
                  ${role.text}
                `}
              >
                <span className={`w-1 h-1 rounded-full ${role.dot}`} />
                {role.label}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-slate-100" />

          <DropdownMenuGroup className="py-1">
            <DropdownMenuItem
              onClick={() => router.push("/mypage/profile")}
              className="rounded-lg px-3 py-2.5 cursor-pointer text-slate-600 hover:text-slate-900 focus:bg-slate-50"
            >
              <UserCog className="h-4 w-4 mr-3 text-slate-400" />
              마이페이지
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/mypage/article")}
              className="rounded-lg px-3 py-2.5 cursor-pointer text-slate-600 hover:text-slate-900 focus:bg-slate-50"
            >
              <FileText className="h-4 w-4 mr-3 text-slate-400" />
              내가 쓴 글
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-slate-100" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="rounded-lg px-3 py-2.5 cursor-pointer text-red-500 hover:text-red-600 focus:bg-red-50 my-1"
          >
            <LogOut className="h-4 w-4 mr-3" />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
