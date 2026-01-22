import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileInput, MoreHorizontalIcon } from "lucide-react";
import ResoucesUpload from "@/components/layout/modal/resourcesUpload";

export default function ResourcesPage() {
  const [modal, setModal] = useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">자료실</h1>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            레시피 자료를 확인할 수 있습니다.
          </p>

          <Button
            onClick={() => setModal(true)}
            className="bg-indigo-900 hover:bg-indigo-700"
          >
            새 레시피 추가
            <FileInput className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">제품명</TableHead>
              <TableHead className="w-[40%]">설명</TableHead>
              <TableHead className="w-[15%]">업로드 날짜</TableHead>
              <TableHead className="w-[15%]">담당</TableHead>
              <TableHead className="w-[8%] text-center">설정</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell className="font-medium truncate">
                블랙 올리브 포카치아
              </TableCell>

              <TableCell className="text-muted-foreground">
                데크오븐용 포카치아 레시피 (48시간 저온 숙성)
              </TableCell>

              <TableCell>2026-01-20</TableCell>
              <TableCell>존 도</TableCell>

              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>수정</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <ResoucesUpload open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
