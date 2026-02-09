import {
  bulkUpsertProducts,
  getProducts,
  upLoadFiles,
} from "@/api/product-api";
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
import { useToken } from "@/stores/account-store";
import {
  CheckCircle2,
  FileInput,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function ProductManagementPage() {
  useAuthGuard();
  const token = useToken((state) => state.token);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getProducts(token);
      const list = (data.products || data || []).map((p) => ({
        ...p,
        isSaved: true,
      }));
      setProducts(list);
    } catch (e) {
      alert("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setIsAdding(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleInputChange = (index, field, value) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
        isSaved: false,
      };
      return next;
    });
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await upLoadFiles(file, token);

      const newItems = (data.products || []).map((item) => ({
        id: item.id,

        // ⭐ 프론트 표준 구조로 변환
        name: item.name || "",
        description: item.description || "",
        active: item.active || false,
        isSaved: false,
      }));

      setProducts((prev) => [...prev, ...newItems]);

      alert(
        `${newItems.length}건의 데이터를 불러왔습니다. '전체 저장'을 눌러 확정하세요.`,
      );

      e.target.value = "";
    } catch (err) {
      alert("엑셀 파싱 실패: " + err.message);
    }
  };

  const handleAddRow = () => {
    setIsAdding(true);
    setProducts([
      {
        id: "", // UI에서 입력받는 productId
        name: "",
        description: "",
        active: true, // 기본 상태: 가동
        isSaved: false,
      },
      ...products,
    ]);
  };

  const handleDeleteRow = (index) => {
    if (
      confirm(
        "이 항목을 목록에서 제외하시겠습니까?\n저장하기를 눌러야 반영됩니다.",
      )
    ) {
      const target = products[index];
      if (!target.isSaved) setIsAdding(false);
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const handleSaveAll = async () => {
    if (products.some((p) => !p.id || !p.name)) {
      return alert("품목 ID와 품목명은 필수 입력 사항입니다.");
    }

    try {
      setLoading(true);
      // 백엔드 DTO 구조(UpsertProductRequest)에 맞게 매핑
      const payload = products.map((p) => ({
        productId: p.id,
        name: p.name,
        description: p.description,
        active: p.active,
      }));

      await bulkUpsertProducts(payload, token);
      alert("성공적으로 저장되었습니다.");
      loadData();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 영역 생략 (기존과 동일) */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">품목 관리</h1>
          <p className="text-sm text-stone-400">
            품목 정보를 일괄 수정하거나 추가할 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className="size-4 mr-2" />
            새로고침
          </Button>
          {/* 엑셀 추가 버튼 */}
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
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <Save className="size-4" />
            저장
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table className="table-fixed">
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[60px] text-center text-xs">
                상태
              </TableHead>
              <TableHead className="w-[20%] text-xs">품목 ID</TableHead>
              <TableHead className="w-[25%] text-xs">품목명</TableHead>
              <TableHead className="w-[100px] text-center text-xs">
                가동여부
              </TableHead>
              <TableHead className="text-xs">품목 설명</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isAdding && (
              <TableRow
                onClick={handleAddRow}
                className="cursor-pointer hover:bg-slate-50 border-b-2 border-dashed bg-stone-50/50"
              >
                <TableCell
                  colSpan={6}
                  className="text-center py-4 text-stone-400 group-hover:text-indigo-600 font-medium text-sm"
                >
                  <Plus className="inline mr-2 size-4" /> 새로운 품목 추가
                </TableCell>
              </TableRow>
            )}

            {products.map((p, i) => (
              <TableRow
                key={i}
                className={`transition-colors ${!p.isSaved ? "bg-emerald-50/40" : "hover:bg-stone-50/50"}`}
              >
                <TableCell className="text-center p-2">
                  {!p.isSaved ? (
                    <span className="text-emerald-600 text-[10px] font-bold">
                      NEW
                    </span>
                  ) : (
                    <span className="text-stone-400 text-[10px] font-bold">
                      Y
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    value={p.id}
                    onChange={(e) => handleInputChange(i, "id", e.target.value)}
                    className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                      !p.isSaved ? "border-emerald-300" : ""
                    }`}
                    placeholder="ID 입력"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={p.name}
                    onChange={(e) =>
                      handleInputChange(i, "name", e.target.value)
                    }
                    className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                      !p.isSaved ? "border-emerald-300" : ""
                    }`}
                    placeholder="품목명 입력"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInputChange(i, "active", !p.active)}
                    className={p.active ? "text-emerald-600" : "text-rose-400"}
                  >
                    {p.active ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <XCircle className="size-5" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Input
                    value={p.description || ""}
                    onChange={(e) =>
                      handleInputChange(i, "description", e.target.value)
                    }
                    className={`h-9 text-center text-sm rounded-md border-stone-200 bg-white shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${
                      !p.isSaved ? "border-emerald-300" : ""
                    }`}
                    placeholder="설명 입력"
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
  );
}
