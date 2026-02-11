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
import {
  FileInput,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  ArrowLeft,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

export default function TaskManagementPage() {
  useAuthGuard();
  const router = useRouter();
  const token = useToken((state) => state.token);
  const [tasks, setTasks] = useState([]);
  // 🌟 isAdding 상태 추가
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (token) loadServerData();
  }, [token]);

  const loadServerData = async () => {
    try {
      const data = await getTasks(token);
      setTasks((data.tasks || []).map((item) => ({ ...item, isSaved: true })));
      // 🌟 데이터 로드 시 추가 상태 해제
      setIsAdding(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await parseTaskXls(token, file);
      const newItems = (data.tasks || []).map((item) => ({
        ...item,
        isSaved: false,
      }));
      setTasks((prev) => [...newItems, ...prev]);
      alert(`${newItems.length}건의 데이터를 불러왔습니다.`);
      e.target.value = "";
    } catch (err) {
      alert("엑셀 파싱 실패: " + err.message);
    }
  };

  const handleInputChange = (index, field, value) => {
    const copied = [...tasks];
    copied[index][field] = value;
    copied[index].isSaved = false;
    setTasks(copied);
  };

  const handleAddRow = () => {
    // 🌟 추가 버튼 클릭 시 true로 변경
    setIsAdding(true);
    setTasks([
      {
        id: "",
        productId: "",
        toolCategoryId: "",
        seq: "",
        name: "",
        description: "",
        duration: 0,
        requiredWorkers: 0,
        isSaved: false,
      },
      ...tasks,
    ]);
  };

  const handleDeleteRow = (index) => {
    if (window.confirm("항목을 제외하시겠습니까?")) {
      const target = tasks[index];
      // 🌟 저장 안 된 신규 행을 삭제할 경우 버튼 다시 활성화
      if (!target.isSaved) setIsAdding(false);
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const handleSaveAll = async () => {
    try {
      const payload = tasks.map((t) => ({
        taskId: t.id,
        productId: t.productId,
        categoryId: t.toolCategoryId,
        seq: Number(t.seq),
        name: t.name,
        description: t.description,
        duration: Number(t.duration),
        requiredWorkers: Number(t.requiredWorkers),
      }));
      await upsertTasks(token, payload);
      alert("저장되었습니다.");
      router.push("/resources/tasks");
    } catch (e) {
      alert("저장 실패");
    }
  };

  const gridLayout = "grid-cols-[40px_110px_110px_110px_140px_1fr_60px_80px_60px_50px]";
  const inputStyle = "h-8 w-full bg-transparent border-none shadow-none focus-visible:ring-1 focus-visible:ring-indigo-500/20 hover:bg-slate-100/50 transition-all rounded-sm px-2 text-xs text-slate-700 text-left placeholder:text-slate-300";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 상단 액션바 (기존 유지) */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Wrench size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Management
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            공정 데이터 수정
          </h1>
        </div>
        {/* 버튼 영역 생략 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/resources/tasks")}
            className="border-slate-200 text-slate-500 font-bold rounded-xl"
          >
            <ArrowLeft className="size-4 mr-2" /> 목록으로
          </Button>
          <Button
            variant="outline"
            onClick={loadServerData}
            className="border-blue-100 text-blue-600 font-bold rounded-xl"
          >
            <RefreshCw className="size-4 mr-2" /> 새로고침
          </Button>
          <Button
            asChild
            className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold rounded-xl px-4 cursor-pointer"
          >
            <label>
              <Input
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                onChange={handleExcelUpload}
              />
              <FileInput className="size-4 mr-2" /> 엑셀 업로드
            </label>
          </Button>
          <Button
            onClick={handleSaveAll}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl"
          >
            <Save className="size-4 mr-2" /> 변경사항 저장
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 mx-6 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        {/* 고정 헤더 영역 */}
        <div
          className={cn(
            "grid w-full bg-slate-50 border-b shrink-0 z-20 pr-[10px]", 
            gridLayout
          )}
        >
          {[
            { label: "상태", align: "text-center" },
            { label: "ID" },
            { label: "제품" },
            { label: "도구" },
            { label: "작업명" },
            { label: "상세 설명" },
            { label: "순서", align: "text-center" },
            { label: "시간", align: "text-center" },
            { label: "인원", align: "text-center" },
            { label: "삭제", align: "text-center" },
          ].map((h, i) => (
            <div
              key={i}
              className={cn(
                "py-3 text-[10px] font-bold text-slate-400 uppercase px-1",
                h.align || "text-left",
              )}
            >
              {h.label}
            </div>
          ))}
        </div>

        {/* 스크롤 본문 영역 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {/* 🌟 isAdding 조건부 렌더링 적용 */}
          {!isAdding && (
            <div
              onClick={handleAddRow}
              className="w-full py-3 text-center text-slate-400 hover:text-indigo-600 text-xs font-bold border-b border-dashed bg-slate-50/30 cursor-pointer transition-colors"
            >
              <Plus className="inline size-3 mr-1" /> 공정 라인 추가
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {tasks.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "grid w-full group transition-colors",
                  gridLayout,
                  !t.isSaved ? "bg-indigo-50/30" : "hover:bg-slate-50/50",
                )}
              >
                <div className="flex items-center justify-center py-2">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      !t.isSaved
                        ? "bg-indigo-500 animate-pulse"
                        : "bg-slate-200",
                    )}
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    className={inputStyle}
                    value={t.id}
                    onChange={(e) => handleInputChange(i, "id", e.target.value)}
                    placeholder="공정 ID"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    className={inputStyle}
                    value={t.productId}
                    onChange={(e) =>
                      handleInputChange(i, "productId", e.target.value)
                    }
                    placeholder="제품 ID"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    className={inputStyle}
                    value={t.toolCategoryId}
                    onChange={(e) =>
                      handleInputChange(i, "toolCategoryId", e.target.value)
                    }
                    placeholder="카테고리"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    className={cn(inputStyle, "font-bold")}
                    value={t.name}
                    onChange={(e) =>
                      handleInputChange(i, "name", e.target.value)
                    }
                    placeholder="작업명"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    className={inputStyle}
                    value={t.description}
                    onChange={(e) =>
                      handleInputChange(i, "description", e.target.value)
                    }
                    placeholder="상세 설명 입력"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    className={cn(inputStyle, "text-center")}
                    value={t.seq}
                    onChange={(e) =>
                      handleInputChange(i, "seq", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    className={cn(
                      inputStyle,
                      "text-center font-bold text-indigo-600",
                    )}
                    value={t.duration}
                    onChange={(e) =>
                      handleInputChange(i, "duration", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    className={cn(inputStyle, "text-center")}
                    value={t.requiredWorkers}
                    onChange={(e) =>
                      handleInputChange(i, "requiredWorkers", e.target.value)
                    }
                    placeholder="1"
                  />
                </div>
                <div className="flex items-center justify-center px-1">
                  <button
                    onClick={() => handleDeleteRow(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 shrink-0 flex justify-between items-center text-[10px] text-slate-400 font-medium">
        <span>총 {tasks.length}개의 항목</span>
      </div>
    </div>
  );
}
