import { upsertTasks, getTasks } from "@/api/task-api";
import ResoucesUpload from "@/components/layout/modal/resourcesUpload";
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
import { useToken } from "@/stores/account-store";
import { FileInput, MoreHorizontalIcon, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function TasksPage() {
  const [modal, setModal] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = useToken((state) => state.token);

  // 📥 자료실 레퍼런스 구조 그대로
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const resp = await getTasks(token);
        setTasks(resp.tasks);
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetch();
  }, [token]);

  // 💾 레퍼런스랑 동일한 bulk save 방식
  const handleFinalSave = async () => {
    if (pendingTasks.length === 0) return;

    try {
      await upsertTasks(token, [...tasks, ...pendingTasks]);
      setPendingTasks([]);
      const resp = await getTasks(token);
      setTasks(resp.tasks);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">자료실</h1>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            작업과정 리스트를 확인할 수 있습니다.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={() => setModal(true)}
              className="bg-indigo-900 hover:bg-indigo-500"
            >
              파일 추가
              <FileInput className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={handleFinalSave}
              disabled={pendingTasks.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              저장
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">작업명</TableHead>
              <TableHead className="w-[40%]">설명</TableHead>
              <TableHead className="w-[30%]">등록일</TableHead>
              <TableHead className="w-[15%] text-center">설정</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  불러오는 중...
                </TableCell>
              </TableRow>
            )}

            {/* 신규 (자료실 레퍼런스와 동일 UX) */}
            {pendingTasks.map((task, idx) => (
              <TableRow key={`pending-${idx}`} className="bg-emerald-50">
                <TableCell className="font-medium truncate">
                  {task.name}
                </TableCell>
                <TableCell className="text-muted-foreground truncate">
                  {task.description}
                </TableCell>
                <TableCell className="text-emerald-700 font-medium">
                  저장 대기
                </TableCell>
                <TableCell className="text-center text-emerald-600">
                  신규
                </TableCell>
              </TableRow>
            ))}

            {/* 기존 자료 */}
            {!loading &&
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium truncate">
                    {task.name}
                  </TableCell>

                  <TableCell className="text-muted-foreground truncate">
                    {task.description}
                  </TableCell>

                  <TableCell>{task.createdAt?.slice(0, 10) || "-"}</TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
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
              ))}
          </TableBody>
        </Table>
      </div>

      {/* 레퍼런스랑 동일한 모달 구조 유지 */}
      <ResoucesUpload
        open={modal}
        onClose={() => setModal(false)}
        onAddPending={(list) => setPendingTasks((prev) => [...prev, ...list])}
      />
    </div>
  );
}
