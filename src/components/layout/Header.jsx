import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, UserCog } from "lucide-react";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  return (
    <header
      className="
        sticky top-0 z-50
        h-16 w-full
        border-b bg-background
      "
    >
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
              <Button variant="outline">마이페이지</Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Settings
                  <DropdownMenuShortcut>
                    <UserCog />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <p className="text-red-500">Logout</p>
                <DropdownMenuShortcut>
                  <LogOut />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
