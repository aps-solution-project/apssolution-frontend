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

  // 3. 행 삽입 (추가)
  const handleAddRow = () => {
    setCategories([...categories, { id: "", name: "", isSaved: false }]);
  };

  // 4. 단건 삭제 (카테고리는 즉시 삭제 혹은 필터링 후 저장)
  // 여기서는 편의상 "전체 저장" 버튼 없이 즉시 삭제 API를 호출하거나,
  // 리스트에서만 빼고 나중에 한꺼번에 처리할 수 있습니다.
  // 카테고리 특성상 '단건 처리'가 안전하므로 삭제는 즉시 호출로 구현해 드립니다.
  const handleDelete = async (index, categoryId) => {
    if (!categoryId) {
      // 새로 추가한 빈 행인 경우 리스트에서만 제거
      setCategories(categories.filter((_, i) => i !== index));
      return;
    }

    if (
      confirm(
        `[${categoryId}] 카테고리를 삭제하시겠습니까?\n실제 삭제는 상단의 '저장' 버튼을 눌러야 반영됩니다.`,
      )
    ) {
      try {
        await deleteToolCategory(categoryId, token);
        alert("삭제되었습니다.");
        loadCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // 5. 저장 (수정되거나 새로 추가된 항목만 필터링해서 처리)
  const handleSaveAll = async () => {
    const targets = categories.filter((c) => !c.isSaved);
    if (targets.length === 0) return alert("수정된 내용이 없습니다.");

    try {
      // 카테고리는 벌크 업서트 API가 따로 없다면 반복문으로 처리하거나
      // 현재는 createToolCategory를 순회하며 호출합니다.
      for (const cat of targets) {
        await createToolCategory({ categoryId: cat.id, name: cat.name }, token);
      }
      alert("모든 변경사항이 저장되었습니다.");
      loadCategories();
    } catch (err) {
      alert("저장 중 오류: " + err.message);
    }
  };

  return (
    <div className="space-y-4 p-6">
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
              onClick={handleSaveAll}
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
                <TableHead className="w-[40%] text-stone-600">
                  카테고리 ID (영문)
                </TableHead>
                <TableHead className="text-stone-600">
                  카테고리 이름 (한글)
                </TableHead>
                <TableHead className="w-[100px] text-center text-stone-600">
                  삭제
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                      value={cat.id}
                      onChange={(e) =>
                        handleInputChange(index, "id", e.target.value)
                      }
                      disabled={cat.isSaved}
                      className={`h-9 text-center text-xs font-mono rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !cat.isSaved ? "border-emerald-300" : ""
                      }`}
                    />
                  </TableCell>

                  {/* 카테고리 이름 셀 - 테두리 추가 */}
                  <TableCell className="p-2">
                    <Input
                      value={cat.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                        !cat.isSaved ? "border-emerald-300" : ""
                      }`}
                    />
                  </TableCell>

                  <TableCell className="text-center p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(index, cat.id)}
                      className="text-stone-300 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                className="cursor-pointer hover:bg-stone-50 border-t-2 border-dashed group transition-colors"
                onClick={handleAddRow}
              >
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-stone-400 group-hover:text-emerald-600 font-medium"
                >
                  <Plus className="inline-block mr-2 h-5 w-5" /> 새 카테고리
                  추가
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
