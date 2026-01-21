import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

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
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            ⚙️
          </Button>
          <Button variant="ghost" size="icon">
            👤
          </Button>
        </div>
      </div>
    </header>
  );
}
