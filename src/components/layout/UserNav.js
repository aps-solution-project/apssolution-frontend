import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount, useToken } from "@/stores/account-store";
import { FileText, LogOut, UserCog } from "lucide-react";
import { useRouter } from "next/router";

export function UserNav() {
  const router = useRouter();
  const { clearToken } = useToken();
  const { account, clearAccount } = useAccount();

  const handleLogout = () => {
    clearToken();
    clearAccount();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* 아바타나 사용자 이름 버튼 */}
        <Button variant="outline" className="relative">
          {account?.name || "사용자"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/mypage/profile")}>
            마이페이지
            <DropdownMenuShortcut>
              <UserCog className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/mypage/article")}>
            내가 쓴 글
            <DropdownMenuShortcut>
              <FileText className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout}>
          <span className="text-red-500">Logout</span>
          <DropdownMenuShortcut>
            <LogOut className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
