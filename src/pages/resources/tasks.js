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
import { useEffect, useMemo, useState } from "react";

export default function TasksPage() {
  const token = useToken((s) => s.token);

  const [modal, setModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const resp = await getTasks(token);

        const sorted = [...resp.tasks].sort((a, b) => a.seq - b.seq);
        setTasks(sorted);
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTasks();
  }, [token]);

  const mergedTasks = useMemo(() => {
    return [...tasks, ...pendingTasks].sort((a, b) => a.seq - b.seq);
  }, [tasks, pendingTasks]);

  const handleFinalSave = async () => {
    if (pendingTasks.length === 0) return;

    try {
      await upsertTasks(token, mergedTasks);
      setPendingTasks([]);

      const resp = await getTasks(token);
      setTasks([...resp.tasks].sort((a, b) => a.seq - b.seq));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">작업 공정 관리</h1>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            엑셀 업로드 시 순서가 자동 정렬됩니다.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={() => setModal(true)}
              className="bg-indigo-900 hover:bg-indigo-500"
            >
              파일 추가 <FileInput className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={handleFinalSave}
              disabled={pendingTasks.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              저장 <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>제품</TableHead>
              <TableHead>도구</TableHead>
              <TableHead>순서</TableHead>
              <TableHead>작업명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead>시간</TableHead>
              <TableHead className="text-center">설정</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  불러오는 중...
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              mergedTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className={pendingTasks.includes(task) ? "bg-emerald-50" : ""}
                >
                  <TableCell>{task.id}</TableCell>
                  <TableCell>{task.productId}</TableCell>
                  <TableCell>{task.toolCategoryId}</TableCell>
                  <TableCell className="font-semibold">{task.seq}</TableCell>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.duration}</TableCell>

                  <TableCell className="text-center">
                    {pendingTasks.includes(task) ? (
                      <span className="text-emerald-600 font-medium">신규</span>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
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
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <ResoucesUpload
        open={modal}
        onClose={() => setModal(false)}
        onAddPending={(list) => setPendingTasks(list)}
      />
    </div>
  );
}
