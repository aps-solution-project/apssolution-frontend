import { getProducts } from "@/api/product-api";
import { editScenario } from "@/api/scenario-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToken } from "@/stores/account-store";
import {
  Calendar,
  Clock,
  Package,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function EditScenarioForm({
  scenario,
  onCancel,
  onRefreshDetail,
}) {
  const { token } = useToken();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!token) return;
    getProducts(token).then((obj) =>
      setProducts(obj.products.filter((p) => p.active) || []),
    );
  }, [token]);

  const [form, setForm] = useState({
    title: scenario.title || "",
    description: scenario.description || "",
    date: scenario.startAt?.slice(0, 10) || "",
    time: scenario.startAt?.slice(11, 16) || "",
    maxWorkerCount: scenario.maxWorkerCount || "",
    scenarioProductList:
      scenario.products?.map((p) => ({
        productId: p.product.id,
        quantity: p.qty,
      })) || [],
  });

  const updateItem = (i, key, value) => {
    const copy = [...form.scenarioProductList];
    copy[i][key] = value;
    setForm({ ...form, scenarioProductList: copy });
  };

  const addItem = () => {
    setForm({
      ...form,
      scenarioProductList: [
        ...form.scenarioProductList,
        { productId: "", quantity: "" },
      ],
    });
  };

  const removeItem = (i) => {
    setForm({
      ...form,
      scenarioProductList: form.scenarioProductList.filter(
        (_, idx) => idx !== i,
      ),
    });
  };

  const handleSave = () => {
    const payload = {
      title: form.title,
      description: form.description,
      startAt: `${form.date}T${form.time}`,
      maxWorkerCount: Number(form.maxWorkerCount),
      scenarioProducts: form.scenarioProductList.map((p) => ({
        productId: p.productId,
        qty: Number(p.quantity),
      })),
    };

    editScenario(token, scenario.id, payload).then(() => {
      window.alert("시나리오가 수정되었습니다.");
      if (onRefreshDetail) {
        onRefreshDetail(scenario.id); // 부모의 데이터를 최신화함
      }
      onCancel(); // 수정 창을 닫고 정보 화면으로 돌아감
    });
  };

  return (
    <section className="w-full h-full flex flex-col overflow-hidden">
      <div className="bg-white border-none rounded-[32px] h-full flex flex-col shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100 overflow-hidden text-slate-800">
        {/* 1. 헤더: 고정 */}
        <div className="p-8 pb-4 shrink-0 border-b border-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-600 rounded uppercase tracking-wider">
                  Edit Mode
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{scenario.id}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                시나리오 수정
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 2. 입력 영역: 스크롤 가능 */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full w-full">
            <div className="p-5">
              {/* 기본 정보 카드 */}
              <div className="">
                <div className="">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
                    Title
                  </label>
                  <input
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="제목을 입력하세요"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
                    Description
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="설명을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
                      Schedule
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Calendar
                          size={14}
                          className="absolute left-3 top-3 text-slate-400"
                        />
                        <input
                          type="date"
                          className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          value={form.date}
                          onChange={(e) =>
                            setForm({ ...form, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="relative flex-1">
                        <Clock
                          size={14}
                          className="absolute left-3 top-3 text-slate-400"
                        />
                        <input
                          type="time"
                          className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          value={form.time}
                          onChange={(e) =>
                            setForm({ ...form, time: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">
                      Workforce
                    </label>
                    <div className="relative">
                      <Users
                        size={14}
                        className="absolute left-3 top-3 text-slate-400"
                      />
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-none rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.maxWorkerCount}
                        onChange={(e) =>
                          setForm({ ...form, maxWorkerCount: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 품목 리스트 영역 */}
              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      Production Items
                    </span>
                  </div>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-4 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-colors"
                  >
                    <Plus size={12} /> 품목 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {form.scenarioProductList.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl group transition-all"
                    >
                      <select
                        className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(i, "productId", e.target.value)
                        }
                      >
                        <option value="">품목 선택</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="w-24 bg-white border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(i, "quantity", e.target.value)
                        }
                      />
                      <button
                        onClick={() => removeItem(i)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* 3. 푸터: 고정 */}
        <div className="p-8 pt-4 border-t border-slate-50 shrink-0 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> 수정 내용 저장
          </button>
          <button
            onClick={onCancel}
            className="px-8 bg-slate-100 text-slate-500 py-4 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </section>
  );
}
