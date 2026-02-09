import { useState, useEffect } from "react";
import { getAllTools, upsertTools, parseToolXls } from "@/api/tool-api";
import { useToken } from "@/stores/account-store";
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
import { Plus, Trash2, Save, RefreshCw, FileInput } from "lucide-react";
import { useRouter } from "next/router"; // 🌟 필수
import { cn } from "@/lib/utils";

export default function ToolManagementPage() {
  useAuthGuard();
  const router = useRouter(); // 🌟 컴포넌트 최상단 선언
  const token = useToken((state) => state.token);

  const [tools, setTools] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. 데이터 로드 (서버에서 가져오기)
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
        setIsAdding(false);
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadServerData();
  }, [token]);

  // 2. 입력 값 변경 핸들러
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
    updatedTools[index].isSaved = false; // 수정 시 NEW 상태로 변경
    setTools(updatedTools);
  };

  // 3. 새 행 추가
  const handleAddRow = () => {
    setIsAdding(true);
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

  // 4. 전체 저장 후 페이지 이동
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
      
      // 🌟 저장 완료 후 도구 목록(또는 원하는 경로)으로 이동
      router.push("/resources/tools"); 
      
      // 만약 같은 페이지에서 데이터만 새로고침하고 싶다면:
      // loadServerData(); 
    } catch (err) {
      alert("저장 중 오류가 발생했습니다: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. 행 삭제 (목록에서 제외)
  const handleDeleteRow = (index) => {
    if (window.confirm("이 항목을 목록에서 제외하시겠습니까?")) {
      const targetTool = tools[index];
      if (!targetTool.isSaved) {
        setIsAdding(false);
      }
      setTools(tools.filter((_, i) => i !== index));
    }
  };

  // 6. 엑셀 업로드 처리
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

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-600">도구 관리</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadServerData}
            disabled={isLoading}
            className="border-stone-200"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            새로고침
          </Button>
          <Button asChild className="bg-indigo-900 hover:bg-indigo-800 text-white cursor-pointer">
            <label>
              <Input type="file" className="hidden" onChange={handleExcelUpload} />
              <FileInput className="ml-2 h-4 w-4" />
              엑셀 추가
            </label>
          </Button>
          <Button onClick={handleSaveAll} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500">
            <Save className="size-4" />
            저장
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50">
            <TableRow>
              <TableHead className="w-[80px] text-center text-stone-600">상태</TableHead>
              <TableHead className="w-[25%] text-stone-600 text-center">도구 ID</TableHead>
              <TableHead className="w-[25%] text-stone-600 text-center">카테고리 ID</TableHead>
              <TableHead className="text-stone-600 text-center">설명</TableHead>
              <TableHead className="w-[80px] text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isAdding && (
              <TableRow className="cursor-pointer hover:bg-stone-50 transition-colors" onClick={handleAddRow}>
                <TableCell colSpan={5} className="text-center py-6 text-stone-400 font-medium italic">
                  <Plus className="inline-block mr-2 h-5 w-5" /> 클릭하여 새로운 도구 정보를 추가하세요.
                </TableCell>
              </TableRow>
            )}

            {tools.map((tool, index) => (
              <TableRow key={index} className={cn(!tool.isSaved && "bg-emerald-50/40")}>
                <TableCell className="text-center">
                  <span className={cn("text-xs font-bold", tool.isSaved ? "text-stone-300" : "text-emerald-600")}>
                    {tool.isSaved ? "Y" : "NEW"}
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    value={tool.id}
                    onChange={(e) => handleInputChange(index, "id", e.target.value)}
                    className="text-center h-9 focus-visible:ring-emerald-500"
                    placeholder="ID 입력"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={tool.category?.id || ""}
                    onChange={(e) => handleInputChange(index, "categoryId", e.target.value)}
                    className="text-center h-9 focus-visible:ring-emerald-500"
                    placeholder="카테고리 ID"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={tool.description}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                    className="h-9 focus-visible:ring-emerald-500"
                    placeholder="설명 입력"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRow(index)}
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
  );
}