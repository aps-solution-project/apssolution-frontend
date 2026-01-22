import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu, LogOut, UserCog } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

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
import { useRouter } from "next/router";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

  const account = useAccount((state) => state.account);
  const clearToken = useToken((state) => state.clearToken);

  const handleLogout = () => {
    clearToken();
    router.push("/Login");
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-background">
      <div className="flex h-full items-center gap-3 px-4 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{account?.name || "사용자"}</Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Settings
                  <DropdownMenuShortcut>
                    <UserCog className="h-4 w-4" />
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
        </div>
      </div>
    </header>
  );
}
