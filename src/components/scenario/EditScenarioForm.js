import { getProducts } from "@/api/product-api";
import { editScenario } from "@/api/scenario-api";
import { useToken } from "@/stores/account-store";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

function EditScenarioForm({ scenario, onCancel }) {
  const { token } = useToken();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!token) return;
    getProducts(token).then((obj) => {
      setProducts(obj.products || []);
    });
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

    editScenario(token, scenario.id, payload).then((obj) => {
      window.alert("시나리오가 수정되었습니다.");
      onCancel();
      window.location.reload();
    });
  };

  return (
    <section className="w-1/2 p-6 bg-gray-100">
      <div className="bg-white border p-6 h-full flex flex-col rounded-xl shadow-sm overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-700">시나리오 수정</h2>
          <span className="text-xs text-gray-400">ID: {scenario.id}</span>
        </div>

        {/* 제목 */}
        <div className="space-y-1 mb-4">
          <label className="text-sm font-medium">시나리오 제목 *</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* 설명 */}
        <div className="space-y-1 mb-4">
          <label className="text-sm font-medium">설명 *</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* 날짜 + 시간 */}
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            className="flex-1 border rounded px-3 py-2 text-sm"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            type="time"
            className="flex-1 border rounded px-3 py-2 text-sm"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>

        {/* 인원 */}
        <div className="space-y-1 mb-6">
          <label className="text-sm font-medium">작업 인원 *</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.maxWorkerCount}
            onChange={(e) =>
              setForm({ ...form, maxWorkerCount: e.target.value })
            }
          />
        </div>

        {/* 생산 품목 */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium">생산 품목 *</label>

          {form.scenarioProductList.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                className="border rounded px-2 py-2 text-sm w-1/2"
                value={item.productId}
                onChange={(e) => updateItem(i, "productId", e.target.value)}
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
                className="border rounded px-2 py-2 text-sm w-1/2"
                placeholder="수량"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
              />

              <button onClick={() => removeItem(i)} className="text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            onClick={addItem}
            className="text-sm text-blue-600 flex items-center gap-1"
          >
            <Plus size={14} /> 품목 추가
          </button>
        </div>

        {/* 버튼 */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
          >
            수정 저장
          </button>

          <button
            className="flex-1 border py-2 rounded text-sm hover:bg-gray-50"
            onClick={onCancel}
          >
            취소
          </button>
        </div>
      </div>
    </section>
  );
}

export default EditScenarioForm;
