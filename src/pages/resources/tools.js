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
import Link from "next/link";
import { useRouter } from "next/router";

export default function ToolCategoryPage() {
  const token = useToken((state) => state.token);
  const [categories, setCategories] = useState([]);

  const router = useRouter();

  const active = "text-indigo-400 font-semibold";
  const normal = "text-stone-500 hover:text-indigo-600 transition";

  useEffect(() => {
    if (token) loadCategories();
  }, [token]);

  const loadCategories = async () => {
    try {
      const data = await getToolCategories(token);
      const list = (data.categoryList || data || []).map((cat) => ({
        ...cat,
        isSaved: true,
      }));
      setCategories(list);
    } catch (err) {
      console.error("로드 실패:", err);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    updated[index].isSaved = false;
    setCategories(updated);
  };

  const handleAddRow = () => {
    setCategories([...categories, { id: "", name: "", isSaved: false }]);
  };

  const handleDelete = async (index, categoryId) => {
    if (!categoryId) {
      setCategories(categories.filter((_, i) => i !== index));
      return;
    }

    if (confirm(`[${categoryId}] 카테고리를 삭제하시겠습니까?`)) {
      try {
        await deleteToolCategory(categoryId, token);
        loadCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSaveAll = async () => {
    const targets = categories.filter((c) => !c.isSaved);
    if (targets.length === 0) return alert("수정된 내용이 없습니다.");

    try {
      for (const cat of targets) {
        await createToolCategory({ categoryId: cat.id, name: cat.name }, token);
      }
      loadCategories();
    } catch (err) {
      alert("저장 중 오류: " + err.message);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-2 text-lg">
        <Link
          href="/resources/products"
          className={
            router.pathname === "/resources/products" ? active : normal
          }
        >
          자료실
        </Link>
        <span className="text-stone-400">|</span>
        <Link
          href="/resources/tools"
          className={router.pathname === "/resources/tools" ? active : normal}
        >
          도구
        </Link>
      </div>

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

        {/* ===== TABLE ===== */}
        <div className="rounded-md border">
          <Table className="table-fixed w-full">
            <TableHeader className="bg-stone-50">
              <TableRow>
                <TableHead className="w-[80px] text-center text-stone-600">
                  상태
                </TableHead>
                <TableHead className="w-[40%] text-stone-600">
                  카테고리 ID
                </TableHead>
                <TableHead className="text-stone-600">카테고리 이름</TableHead>
                <TableHead className="w-[100px] text-center text-stone-600">
                  삭제
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.map((cat, index) => (
                <TableRow
                  key={index}
                  className={`transition-colors ${
                    !cat.isSaved ? "bg-emerald-50/40" : "hover:bg-stone-50/50"
                  }`}
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

                  <TableCell className="p-2">
                    <Input
                      value={cat.id}
                      onChange={(e) =>
                        handleInputChange(index, "id", e.target.value)
                      }
                      disabled={cat.isSaved}
                      className={`h-9 text-center text-xs font-mono rounded-md border-stone-200 bg-white shadow-sm ${
                        !cat.isSaved ? "border-emerald-300" : ""
                      }`}
                    />
                  </TableCell>

                  <TableCell className="p-2">
                    <Input
                      value={cat.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                      className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm ${
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
                className="cursor-pointer hover:bg-stone-50 border-t-2 border-dashed"
                onClick={handleAddRow}
              >
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-stone-400"
                >
                  <Plus className="inline-block mr-2 h-5 w-5" />새 카테고리 추가
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
