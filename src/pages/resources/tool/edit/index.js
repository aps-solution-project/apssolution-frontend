import { getAllTools, parseToolXls, upsertTools } from "@/api/tool-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { cn } from "@/lib/utils";
import { useAccount, useToken } from "@/stores/account-store";
import {
  ArrowLeft,
  FileInput,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ToolManagementPage() {
  useAuthGuard();
  const router = useRouter();
  const token = useToken((state) => state.token);
  const loginAccount = useAccount((state) => state.account);
  const [tools, setTools] = useState([]);
  const [isAdding, setIsAdding] = useState(false); // 🌟 isAdding 상태
  const [isLoading, setIsLoading] = useState(false);

  const gridLayout = "grid-cols-[100px_250px_270px_1fr_60px]"; // 비율 살짝 조정

  const loadServerData = () => {
    if (!token) return;
    setIsLoading(true);
    getAllTools(token)
      .then((data) => {
        const savedList = (data.tools || []).map((item) => ({
          ...item,
          isSaved: true,
        }));
        setTools(savedList);
        setIsAdding(false); // 🌟 로드 완료 시 초기화
      })
      .catch((err) => console.error("데이터 로드 실패:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (token && loginAccount?.role !== "WORKER") loadServerData();
  }, [token, loginAccount?.role]);

  if (loginAccount?.role === "WORKER") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <X className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">접근 권한 제한</h2>
        <p className="text-slate-500 font-medium text-center">
          도구 수정 페이지는 관리자(ADMIN) 및 플래너 전용 구역입니다.
          <br />
          권한이 필요하시다면 관리자에게 문의하세요.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-xl"
        >
          메인으로 돌아가기
        </Button>
      </div>
    );
  }

  const handleInputChange = (index, field, value) => {
    const updatedTools = [...tools];
    if (field === "categoryId") {
      updatedTools[index].category = {
        ...updatedTools[index].category,
        id: value,
      };
    } else {
      updatedTools[index][field] = value;
    }
    updatedTools[index].isSaved = false;
    setTools(updatedTools);
  };

  const handleAddRow = () => {
    setIsAdding(true); // 🌟 행 추가 시 버튼 숨김
    setTools([
      {
        id: "",
        category: { id: "", name: "" },
        description: "",
        isSaved: false,
      },
      ...tools,
    ]);
  };

  const handleSaveAll = async () => {
    const hasEmptyFields = tools.some((t) => !t.id || !t.category?.id);
    if (hasEmptyFields) {
      return alert("도구 ID와 카테고리 ID는 필수 입력 사항입니다.");
    }
    try {
      setIsLoading(true);
      const requestData = {
        tools: tools.map((t) => ({
          toolId: t.id,
          categoryId: t.category?.id || "",
          description: t.description || "",
        })),
      };
      await upsertTools(requestData, token);
      alert("성공적으로 저장되었습니다.");
      router.push("/resources/tool");
    } catch (err) {
      alert("저장 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRow = (index) => {
    if (window.confirm("이 항목을 목록에서 제외하시겠습니까?")) {
      const targetTool = tools[index];
      if (!targetTool.isSaved) setIsAdding(false); // 🌟 신규 행 삭제 시 버튼 다시 보임
      setTools(tools.filter((_, i) => i !== index));
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await parseToolXls(file, token);
      const newItems = (data.tools || []).map((item) => ({
        id: item.id,
        category: item.category ? { id: item.category.id } : { id: "" },
        description: item.description || "",
        isSaved: false,
      }));
      setTools((prev) => [...newItems, ...prev]);
      alert(`${newItems.length}건을 불러왔습니다. 저장 버튼을 눌러주세요.`);
      e.target.value = "";
    } catch (err) {
      alert("엑셀 처리 실패: " + err.message);
    }
  };

  // 🌟 placeholder 색상 추가
  const inputStyle =
    "h-8 w-full bg-transparent border-none shadow-none focus-visible:ring-1 focus-visible:ring-emerald-500/20 hover:bg-slate-100/50 transition-all rounded-sm px-2 text-xs text-slate-700 text-left placeholder:text-slate-300";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 1. 상단 헤더 영역 (기존 유지) */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Wrench size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Resources
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            도구 데이터 수정
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/resources/tool")}
            className="border-slate-200 text-slate-500 font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="size-4 mr-2" /> 목록으로
          </Button>
          <Button
            variant="outline"
            onClick={loadServerData}
            disabled={isLoading}
            className="border-blue-100 text-blue-600 font-bold rounded-xl transition-all"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
            />{" "}
            새로고침
          </Button>
          <Button
            asChild
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 font-bold rounded-xl px-4 cursor-pointer transition-all"
          >
            <label>
              <Input
                type="file"
                className="hidden"
                onChange={handleExcelUpload}
              />
              <FileInput className="size-4 mr-2" /> 엑셀 추가
            </label>
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl shadow-emerald-100 transition-all"
          >
            <Save className="size-4 mr-2" /> 변경사항 저장
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 mx-6 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        {/* 고정 헤더 */}
        <div
          className={cn(
            "grid w-full bg-slate-50 border-b shrink-0 z-20",
            gridLayout,
          )}
        >
          {[
            { label: "상태", align: "text-center" },
            { label: "도구 ID", align: "text-left px-3" },
            { label: "카테고리 ID", align: "text-left px-3" },
            { label: "설명", align: "text-left px-3" },
            { label: "삭제", align: "text-center" },
          ].map((h, i) => (
            <div
              key={i}
              className={cn(
                "py-3 text-[10px] font-bold text-slate-400 uppercase",
                h.align,
              )}
            >
              {h.label}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {/* 🌟 isAdding 조건부 렌더링 */}
          {!isAdding && (
            <div
              onClick={handleAddRow}
              className="w-full py-4 text-center text-slate-400 hover:text-indigo-600 text-xs font-bold border-b border-dashed bg-slate-50/30 cursor-pointer transition-all"
            >
              <Plus className="inline size-4 mr-1" /> 도구 라인 추가
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {tools.map((tool, index) => (
              <div
                key={index}
                className={cn(
                  "grid w-full group transition-colors",
                  gridLayout,
                  !tool.isSaved ? "bg-indigo-50/20" : "hover:bg-slate-50/50",
                )}
              >
                <div className="flex items-center justify-center py-2">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      !tool.isSaved
                        ? "bg-indigo-500 animate-pulse"
                        : "bg-slate-200",
                    )}
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    value={tool.id}
                    onChange={(e) =>
                      handleInputChange(index, "id", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="도구 ID 입력"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    value={tool.category?.id || ""}
                    onChange={(e) =>
                      handleInputChange(index, "categoryId", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="카테고리 ID 입력"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    value={tool.description}
                    onChange={(e) =>
                      handleInputChange(index, "description", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="도구에 대한 상세 설명을 입력하세요"
                  />
                </div>
                <div className="flex items-center justify-center px-1">
                  <button
                    onClick={() => handleDeleteRow(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 shrink-0 flex justify-between items-center text-[10px] text-slate-400 font-medium">
        <span>총 {tools.length}개의 항목</span>
      </div>
    </div>
  );
}
