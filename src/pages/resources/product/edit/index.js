import {
  bulkUpsertProducts,
  getProducts,
  upLoadFiles,
} from "@/api/product-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { cn } from "@/lib/utils";
import { useToken } from "@/stores/account-store";
import {
  ArrowLeft,
  CheckCircle2,
  FileInput,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ProductManagementPage() {
  useAuthGuard();
  const router = useRouter();
  const token = useToken((state) => state.token);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // 🌟 Grid 너비 설정 (품목 관리 컬럼 비율)
  const gridLayout = "grid-cols-[80px_200px_200px_450px_80px_60px]";

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
      { id: "", name: "", description: "", active: true, isSaved: false },
      ...products,
    ]);
  };

  const handleDeleteRow = (index) => {
    if (confirm("이 항목을 목록에서 제외하시겠습니까?")) {
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
      const payload = products.map((p) => ({
        productId: p.id,
        name: p.name,
        description: p.description,
        active: p.active,
      }));
      await bulkUpsertProducts(payload, token);
      alert("성공적으로 저장되었습니다.");
      router.push("/resources/products");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "h-8 w-full bg-transparent border-none shadow-none focus-visible:ring-1 focus-visible:ring-indigo-500/20 hover:bg-slate-100/50 transition-all rounded-sm px-2 text-xs text-slate-700 text-left placeholder:text-slate-300";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 1. 상단 헤더 영역 */}
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Wrench size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Resources
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            품목 데이터 수정
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/resources/product")}
            className="border-slate-200 text-slate-500 font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="size-4 mr-2" /> 목록으로
          </Button>
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="border-blue-100 text-blue-600 font-bold rounded-xl transition-all"
          >
            <RefreshCw
              className={cn("size-4 mr-2", loading && "animate-spin")}
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
                accept=".xls,.xlsx"
                className="hidden"
                onChange={handleExcelUpload}
              />
              <FileInput className="size-4 mr-2" /> 엑셀 추가
            </label>
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl shadow-emerald-100 transition-all"
          >
            <Save className="size-4 mr-2" /> 변경사항 저장
          </Button>
        </div>
      </div>

      {/* 2. 테이블 컨테이너 */}
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
            { label: "품목 ID", align: "text-left px-3" },
            { label: "품목명", align: "text-left px-3" },
            { label: "품목 설명", align: "text-left px-3" },
            { label: "가동여부", align: "text-center" },
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

        {/* 스크롤 본문 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          {!isAdding && (
            <div
              onClick={handleAddRow}
              className="w-full py-4 text-center text-slate-400 hover:text-indigo-600 text-xs font-bold border-b border-dashed bg-slate-50/30 cursor-pointer transition-all"
            >
              <Plus className="inline size-4 mr-1" /> 품목 라인 추가
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {products.map((p, i) => (
              <div
                key={i}
                className={cn(
                  "grid w-full group transition-colors",
                  gridLayout,
                  !p.isSaved ? "bg-indigo-50/20" : "hover:bg-slate-50/50",
                )}
              >
                {/* 상태 Dot */}
                <div className="flex items-center justify-center py-2">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      !p.isSaved
                        ? "bg-indigo-500 animate-pulse"
                        : "bg-slate-200",
                    )}
                  />
                </div>
                {/* 입력 필드들 */}
                <div className="flex items-center px-1">
                  <Input
                    value={p.id}
                    onChange={(e) => handleInputChange(i, "id", e.target.value)}
                    className={inputStyle}
                    placeholder="ID 입력"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    value={p.name}
                    onChange={(e) =>
                      handleInputChange(i, "name", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="품목명 입력"
                  />
                </div>
                <div className="flex items-center px-1">
                  <Input
                    value={p.description || ""}
                    onChange={(e) =>
                      handleInputChange(i, "description", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="설명 입력"
                  />
                </div>
                {/* 가동 여부 토글 */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => handleInputChange(i, "active", !p.active)}
                    className={cn(
                      "transition-all p-1 rounded-full",
                      p.active
                        ? "text-emerald-500 hover:bg-emerald-50"
                        : "text-rose-400 hover:bg-rose-50",
                    )}
                  >
                    {p.active ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <XCircle className="size-5" />
                    )}
                  </button>
                </div>
                {/* 삭제 버튼 */}
                <div className="flex items-center justify-center px-1">
                  <button
                    onClick={() => handleDeleteRow(i)}
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
        <span>총 {products.length}개의 항목</span>
      </div>
    </div>
  );
}
