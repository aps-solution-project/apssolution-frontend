import { getTasks, parseTaskXls, upsertTasks } from "@/api/task-api";
import { useToken } from "@/stores/account-store";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { FileInput, Plus, RefreshCw, Save, Trash2 } from "lucide-react";

/**
 * Task Management Page
 * - 작업 공정 전체 조회
 * - 엑셀 파싱 미리보기
 * - 벌크 저장
 */
export default function TaskManagementPage() {
  useAuthGuard();
  const token = useToken((state) => state.token);
  const [tasks, setTasks] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  /* =========================
   * 1. 서버 데이터 로드
   * ========================= */
  useEffect(() => {
    if (token) loadServerData();
  }, [token]);

  const loadServerData = async () => {
    try {
      const data = await getTasks(token);
      const savedList = (data.tasks || []).map((item) => ({
        ...item,
        isSaved: true,
      }));
      setTasks(savedList);
    } catch (e) {
      console.error("작업 목록 조회 실패", e);
      alert("작업 목록을 불러오지 못했습니다.");
    }
    setIsAdding(false);
  };

  /* =========================
   * 2. 엑셀 파싱
   * ========================= */
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await parseTaskXls(token, file);

      const newItems = (data.tasks || []).map((item) => ({
        id: item.id,
        productId: item.productId,
        toolCategoryId: item.toolCategoryId,
        seq: item.seq,
        name: item.name,
        description: item.description,
        duration: item.duration,
        requiredWorkers: item.requiredWorkers,
        isSaved: false,
      }));

      setTasks((prev) => [...prev, ...newItems]);

      alert(
        `${newItems.length}건의 작업 공정을 불러왔습니다.\n'저장' 버튼을 눌러 반영하세요.`,
      );

      e.target.value = "";
    } catch (err) {
      alert("엑셀 파싱 실패: " + err.message);
    }
  };

  /* =========================
   * 3. 입력 변경
   * ========================= */
  const handleInputChange = (index, field, value) => {
    const copied = [...tasks];
    copied[index][field] = value;
    copied[index].isSaved = false;
    setTasks(copied);
  };

  /* =========================
   * 4. 행 추가 / 삭제
   * ========================= */
  const handleAddRow = () => {
    setIsAdding(true);
    setTasks([
      {
        id: "",
        productId: "",
        toolCategoryId: "",
        seq: 1,
        name: "",
        description: "",
        duration: 0,
        isSaved: false,
        requiredWorkers: 1,
      },
      ...tasks,
    ]);
  };

  const handleDeleteRow = (index) => {
    const target = tasks[index];
    if (window.confirm("이 항목을 목록에서 제외하시겠습니까?")) {
      if (!target.isSaved) {
        setIsAdding(false);
      }
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  /* =========================
   * 5. 전체 저장 (벌크 업서트)
   * ========================= */
  const handleSaveAll = async () => {
    const hasEmpty = tasks.some(
      (t) => !t.id || !t.productId || !t.toolCategoryId || !t.name,
    );

    if (hasEmpty) {
      return alert("필수 값(ID, 제품, 도구, 작업명)이 비어 있습니다.");
    }

    try {
      const payload = {
        tasks: tasks.map((t) => ({
          taskId: t.id,
          productId: t.productId,
          categoryId: t.toolCategoryId,
          seq: Number(t.seq),
          name: t.name,
          description: t.description,
          duration: Number(t.duration),
          requiredWorkers: Number(t.requiredWorkers),
        })),
      };

      const res = await upsertTasks(
        token,
        tasks.map((t) => ({
          taskId: t.id,
          productId: t.productId,
          categoryId: t.toolCategoryId,
          seq: Number(t.seq),
          name: t.name,
          description: t.description,
          duration: Number(t.duration),
          requiredWorkers: Number(t.requiredWorkers),
        })),
      );

      alert(
        `저장 완료\n생성: ${res.created}\n수정: ${res.updated}\n삭제: ${res.deleted}`,
      );

      loadServerData();
    } catch (e) {
      alert("저장 실패: " + e.message);
    }
  };

  /* =========================
   * 6. UI
   * ========================= */
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">작업 공정 관리</h1>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex justify-between">
          <p className="text-sm text-muted-foreground">
            엑셀 업로드 시 순서는 자동 정렬됩니다.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={loadServerData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>

            <Button
              asChild
              className="bg-indigo-900 hover:bg-indigo-500 text-white cursor-pointer"
            >
              <label>
                <Input
                  type="file"
                  accept=".xls,.xlsx"
                  className="hidden"
                  onChange={handleExcelUpload}
                />
                <FileInput className="ml-2 h-4 w-4" />
                엑셀 추가
              </label>
            </Button>

            <Button
              onClick={handleSaveAll}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Save className="size-4" />
              저장
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          {/* table-fixed를 주어야 설정한 너비가 고정됩니다 */}
          <Table className="table-fixed w-full">
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead className="w-[1.5%] text-center text-stone-600">
                  상태
                </TableHead>
                <TableHead className="w-[13%] text-center text-stone-600">
                  ID
                </TableHead>
                <TableHead className="w-[15%] text-center text-stone-600">
                  제품
                </TableHead>
                <TableHead className="w-[13%] text-center text-stone-600">
                  도구
                </TableHead>
                <TableHead className="w-[5%] text-center text-stone-600">
                  작업레벨
                </TableHead>
                <TableHead className="w-[11%] text-center text-stone-600">
                  작업명
                </TableHead>
                <TableHead className="text-center">설명</TableHead>
                <TableHead className="w-[5%] text-center text-stone-600">
                  시간(분)
                </TableHead>
                <TableHead className="w-[4%] text-center text-stone-600">
                  요구인원
                </TableHead>
                <TableHead className="w-[45px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {!isAdding && (
                <TableRow
                  onClick={handleAddRow}
                  className="cursor-pointer hover:bg-slate-50 border-b-2 border-dashed group transition-colors bg-stone-50/50"
                >
                  <TableCell
                    colSpan={9}
                    className="text-center py-4 text-stone-400 group-hover:text-indigo-600 font-medium"
                  >
                    <Plus className="inline mr-2 size-4" /> 새로운 작업 추가
                  </TableCell>
                </TableRow>
              )}

              {tasks.map((t, i) => (
                <TableRow
                  key={i}
                  className={`transition-colors ${!t.isSaved ? "bg-emerald-50/40" : "hover:bg-stone-50/50"}`}
                >
                  <TableCell className="text-center">
                    {t.isSaved ? (
                      <span className="text-stone-400 text-xs font-bold">
                        Y
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold">
                        NEW
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Input
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !t.isSaved ? "border-emerald-300" : ""
                      }`}
                      placeholder="ID 입력"
                      value={t.id}
                      onChange={(e) =>
                        handleInputChange(i, "id", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !t.isSaved ? "border-emerald-300" : ""
                      }`}
                      placeholder="제품 ID 입력"
                      value={t.productId}
                      onChange={(e) =>
                        handleInputChange(i, "productId", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !t.isSaved ? "border-emerald-300" : ""
                      }`}
                      placeholder="카테고리 ID 입력"
                      value={t.toolCategoryId}
                      onChange={(e) =>
                        handleInputChange(i, "toolCategoryId", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !t.isSaved ? "border-emerald-300" : ""
                      }`}
                      placeholder="난이도 입력"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={t.seq}
                      onChange={(e) =>
                        handleInputChange(i, "seq", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !t.isSaved ? "border-emerald-300" : ""
                      }`}
                      placeholder="이름 입력"
                      value={t.name}
                      onChange={(e) =>
                        handleInputChange(i, "name", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !t.isSaved ? "border-emerald-300" : ""
                      }`}
                      placeholder="설명 입력"
                      value={t.description}
                      onChange={(e) =>
                        handleInputChange(i, "description", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !t.isSaved ? "border-emerald-300" : ""
                      }`}
                      placeholder="소요 시간 입력"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={t.duration}
                      onChange={(e) =>
                        handleInputChange(i, "duration", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !t.isSaved ? "border-emerald-300" : ""
                      }`}
                      placeholder="1"
                      type="text"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      pattern="[0-9]*"
                      value={t.requiredWorkers}
                      onChange={(e) =>
                        handleInputChange(i, "requiredWorkers", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRow(i)}
                      className="text-stone-300 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
