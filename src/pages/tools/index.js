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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { Plus, Trash2, Save, RefreshCw, FileInput } from "lucide-react";

export default function ToolManagementPage() {
  useAuthGuard();
  // 1. 페이징 관련 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [tools, setTools] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const token = useToken((state) => state.token);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tools.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tools.length / itemsPerPage);

  // 1. 데이터 로드
  useEffect(() => {
    if (token) loadServerData();
  }, [token]);

  const loadServerData = () => {
    getAllTools(token)
      .then((data) => {
        const savedList = (data.tools || []).map((item) => ({
          ...item,
          isSaved: true,
        }));
        setTools(savedList);
        setIsAdding(false);
      })
      .catch((err) => console.error("데이터 로드 실패:", err));
  };

  // 🚀 엑셀 파싱 핸들러 (Endpoint: /api/tools/xls/parse)
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await parseToolXls(file, token);

      const newItems = (data.tools || []).map((item) => ({
        id: item.id,

        // ⭐ 프론트 표준 구조로 변환
        categoryId: item.category?.id || "",
        category: item.category ? { id: item.category.id } : { id: "" },

        description: item.description || "",

        isSaved: false,
      }));

      setTools((prev) => [...prev, ...newItems]);

      alert(
        `${newItems.length}건의 데이터를 불러왔습니다. '전체 저장'을 눌러 확정하세요.`,
      );

      e.target.value = "";
    } catch (err) {
      alert("엑셀 파싱 실패: " + err.message);
    }
  };

  // 2. 입력 값 변경 (ID, 카테고리ID, 설명 모두 대응)
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
    updatedTools[index].isSaved = false; // 수정되면 N(빨간색)으로 표시
    setTools(updatedTools);
  };

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

  const handleSaveAll = async () => {
    const hasEmptyId = tools.some((t) => !t.id || !t.category?.id);
    if (hasEmptyId) {
      return alert("도구 ID와 카테고리 ID는 필수 입력 사항입니다.");
    }
    try {
      const requestData = {
        tools: tools.map((t) => ({
          toolId: t.id,
          categoryId: t.category?.id || "",
          description: t.description || "",
        })),
      };

      // upsertTools API 호출
      const res = await upsertTools(requestData, token);

      // 백엔드가 주는 UpsertToolResponse 활용
      alert(
        `성공적으로 저장되었습니다!\n- 생성: ${res.created}건\n- 수정: ${res.updated}건\n- 삭제: ${res.deleted}건`,
      );

      loadServerData(); // 저장 후 최신 데이터로 새로고침
    } catch (err) {
      alert("저장 실패: " + err.message);
    }
  };

  const handleDeleteRow = (index) => {
    // 1. 현재 클릭한 행의 데이터를 가져옵니다.
    const targetTool = tools[index];

    // 2. 사용자에게 보여줄 이름을 결정합니다 (ID가 없으면 '새 항목')
    const displayName = targetTool.id || "새 항목";

    // 3. 브라우저 기본 confirm 창을 띄웁니다.
    // 이 창은 '확인'을 누르면 true, '취소'를 누르면 false를 반환합니다.
    if (window.confirm("이 항목을 목록에서 제외하시겠습니까?")) {
      if (!targetTool.isSaved) {
        setIsAdding(false);
      }
      // 확인을 눌렀을 때만 리스트에서 필터링하여 제거
      setTools(tools.filter((_, i) => i !== index));
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">도구 관리</h1>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            도구 목록을 관리하고 엑셀로 일괄 등록할 수 있습니다.
          </p>

          <div className="flex gap-2">
            {/* 새로고침 버튼 (Ghost/Stone) */}
            <Button
              variant="outline"
              onClick={loadServerData}
              className="border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>

            {/* 엑셀 추가 버튼 (Indigo) */}
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
                엑셀 파일 추가
                <FileInput className="ml-2 h-4 w-4" />
              </label>
            </Button>

            {/* 전체 저장 버튼 (Emerald) */}
            <Button
              onClick={handleSaveAll}
              className="bg-emerald-600 hover:bg-emerald-500 shadow-sm"
            >
              저장
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table className="table-fixed w-full">
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead className="w-[35px] text-center text-stone-600">
                  상태
                </TableHead>
                <TableHead className="w-[30%] text-stone-600 text-center">
                  도구 ID
                </TableHead>
                <TableHead className="w-[30%] text-stone-600 text-center">
                  카테고리 ID
                </TableHead>
                <TableHead className="text-stone-600 text-center">
                  설명
                </TableHead>
                <TableHead className="w-[50px] text-center text-stone-600"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPage === 1 && !isAdding && (
                <TableRow
                  className="cursor-pointer bg-stone-50/50"
                  onClick={handleAddRow}
                >
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-stone-400 font-medium"
                  >
                    <Plus className="inline-block mr-2 h-5 w-5" /> 새 도구 추가
                  </TableCell>
                </TableRow>
              )}

              {tools.map((tool, index) => (
                <TableRow
                  key={index}
                  className={`transition-colors ${!tool.isSaved ? "bg-emerald-50/40" : "hover:bg-stone-50/50"}`}
                >
                  {/* 1. 상태 셀 */}
                  <TableCell className="text-center p-2">
                    {tool.isSaved ? (
                      <span className="text-stone-400 text-xs font-bold">
                        Y
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold">
                        NEW
                      </span>
                    )}
                  </TableCell>

                  {/* 2. 도구 ID 셀 - 테두리 추가 */}
                  <TableCell className="p-2">
                    <Input
                      value={tool.id}
                      onChange={(e) =>
                        handleInputChange(index, "id", e.target.value)
                      }
                      className={`h-9 text-center !text-sm rounded-md border border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !tool.isSaved
                          ? "border-emerald-300 ring-1 ring-emerald-100"
                          : ""
                      }`}
                      placeholder="ID 입력"
                    />
                  </TableCell>

                  {/* 3. 카테고리 ID 셀 - 테두리 추가 */}
                  <TableCell className="p-2">
                    <Input
                      value={tool.category?.id || ""}
                      onChange={(e) =>
                        handleInputChange(index, "categoryId", e.target.value)
                      }
                      className={`h-9 text-center !text-xs rounded-md border border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !tool.isSaved
                          ? "border-emerald-300 ring-1 ring-emerald-100"
                          : ""
                      }`}
                      placeholder="카테고리 ID 입력"
                    />
                  </TableCell>

                  {/* 4. 설명 셀 - 테두리 추가 */}
                  <TableCell className="p-2">
                    <Input
                      value={tool.description}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                      className={`h-9 text-center !text-xs text-stone-500 rounded-md border border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !tool.isSaved
                          ? "border-emerald-300 ring-1 ring-emerald-100"
                          : ""
                      }`}
                      placeholder="설명 입력"
                    />
                  </TableCell>

                  {/* 5. 삭제 버튼 셀 */}
                  <TableCell className="text-center p-2">
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
    </div>
  );
}
