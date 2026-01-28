import { useState, useEffect } from "react";
import { useToken } from "@/stores/account-store";
import {
  getToolCategories,
  createToolCategory,
  deleteToolCategory,
} from "@/api/tool-api";
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
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";

export default function ToolCategoryPage() {
  const token = useToken((state) => state.token);
  const [categories, setCategories] = useState([]);

  // 1. 데이터 로드
  useEffect(() => {
    if (token) loadCategories();
  }, [token]);

  const loadCategories = async () => {
    try {
      const data = await getToolCategories(token);
      // 서버 데이터를 가져올 때 'isSaved' 상태를 추가해서 저장 여부 판단
      const list = (data.categoryList || data || []).map((cat) => ({
        ...cat,
        isSaved: true,
      }));
      setCategories(list);
    } catch (err) {
      console.error("로드 실패:", err);
    }
  };

  // 2. 인라인 수정 핸들러
  const handleInputChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    updated[index].isSaved = false; // 수정되면 N 상태로 변경
    setCategories(updated);
  };

  const handleAddRow = () => {
    const newRow = {
      id: "",
      name: "",
      isSaved: false,
    };

    setCategories([newRow, ...categories]);
  };

  // 4. 단건 삭제 (카테고리는 즉시 삭제 혹은 필터링 후 저장)
  const handleDelete = async (index, categoryId) => {
    if (!categoryId) {
      // 새로 추가한 빈 행인 경우 리스트에서만 제거
      setCategories(categories.filter((_, i) => i !== index));
      return;
    }

    if (confirm(`[${categoryId}] 카테고리를 삭제하시겠습니까?`)) {
      try {
        await deleteToolCategory(categoryId, token);
        alert("삭제되었습니다.");
        loadCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // 5. 저장 (단 건 등록 로직으로 단순화)
  const handleSave = async () => {
    const newCat = categories.find((c) => !c.isSaved);

    if (!newCat) return; // 혹은 alert("등록할 내용이 없습니다.");

    if (!newCat.id.trim() || !newCat.name.trim()) {
      alert("ID와 이름을 모두 입력해주세요.");
      return;
    }

    try {
      await createToolCategory(
        { categoryId: newCat.id, name: newCat.name },
        token,
      );

      alert("카테고리가 등록되었습니다.");
      loadCategories();
    } catch (err) {
      console.error("저장 에러:", err);
      alert("저장 중 오류: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">도구 카테고리 관리</h1>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            도구 분류를 위한 카테고리를 설정합니다.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadCategories}
              className="border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500"
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
                <TableHead className="w-[80px] text-center text-stone-600">
                  상태
                </TableHead>
                <TableHead className="w-[40%] text-center text-stone-600">
                  카테고리 ID (영문)
                </TableHead>
                <TableHead className="text-center text-stone-600">
                  카테고리 이름 (한글)
                </TableHead>
                <TableHead className="w-[100px] text-center text-stone-600"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 1. 새 행 추가 버튼: 신규 데이터가 없을 때만 표시 */}
              {!categories.some((cat) => !cat.isSaved) && (
                <TableRow
                  className="cursor-pointer hover:bg-emerald-50 border-b-2 border-dashed group transition-colors"
                  onClick={handleAddRow}
                >
                  <TableCell
                    colSpan={4}
                    className="text-center text-stone-400 group-hover:text-emerald-600 font-medium py-4"
                  >
                    <Plus className="inline-block mr-2 h-5 w-5" /> 새 카테고리
                    추가
                  </TableCell>
                </TableRow>
              )}
              {categories.map((cat, index) => (
                <TableRow
                  key={index}
                  className={`transition-colors ${!cat.isSaved ? "bg-emerald-50/40" : "hover:bg-stone-50/50"}`}
                >
                  <TableCell className="text-center p-2">
                    {cat.isSaved ? (
                      <span className="text-stone-400 text-xs font-bold">
                        Y
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold">
                        신규
                      </span>
                    )}
                  </TableCell>

                  {/* 카테고리 ID 셀 - 테두리 추가 */}
                  <TableCell className="p-2">
                    <Input
                      readOnly={cat.isSaved}
                      value={cat.id}
                      onChange={(e) =>
                        handleInputChange(index, "id", e.target.value)
                      }
                      className={`h-9 text-center text-xs rounded-md border-stone-200 shadow-sm transition-all ${
                        cat.isSaved
                          ? "bg-stone-100 text-stone-500 cursor-not-allowed border-none shadow-none" // 저장된 상태: 회색 배경, 커서 금지
                          : "bg-white border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" // 신규 상태
                      }`}
                    />
                  </TableCell>

                  {/* 카테고리 이름 셀 - 테두리 추가 */}
                  <TableCell className="p-2">
                    <Input
                      readOnly={cat.isSaved}
                      value={cat.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                      className={`h-9 text-center text-sm rounded-md border-stone-200 shadow-sm transition-all ${
                        cat.isSaved
                          ? "bg-stone-100 text-stone-500 cursor-not-allowed border-none shadow-none" // 저장된 상태
                          : "bg-white border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" // 신규 상태
                      }`}
                    />
                  </TableCell>

                  <TableCell className="text-center p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(index, cat.id)}
                      className="text-stone-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
