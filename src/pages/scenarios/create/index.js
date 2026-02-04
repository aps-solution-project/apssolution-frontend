import { getProducts } from "@/api/product-api";
import {
  copyScenario,
  deleteScenario,
  getScenario,
  getScenarios,
  postScenario,
} from "@/api/scenario-api";
import ScenariosInformation from "@/components/scenario/ScenarioInfomation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useToken } from "@/stores/account-store";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScenariosCreate() {
  useAuthGuard(); // 인증 체크
  const [scenarioData, setScenarioData] = useState([]);
  const [selectedId, setSelectedId] = useState(0);
  const [showForm, setShowForm] = useState(false); // 폼 보임/숨김 상태

  const [errors, setErrors] = useState({});

  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const { token } = useToken();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [products, setProducts] = useState([]);
  const [editScenario, setEditScenario] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    maxWorkerCount: "",
    scenarioProductList: [{ productId: "", quantity: "" }],
  });

  useEffect(() => {
    if (!token) return;
    getScenarios(token).then((obj) => {
      setScenarioData(obj.scenarios);
    });
    getProducts(token).then((obj) => {
      setProducts(obj.products || []);
    });
  }, [token]);

  useEffect(() => {
    if (!running) return;
    if (progress >= 100) {
      setRunning(false);
      setCompleted(true);
      return;
    }
    const t = setTimeout(() => setProgress((p) => p + 10), 350);
    return () => clearTimeout(t);
  }, [running, progress]);

  useEffect(() => {
    if (!selectedId || !token) {
      // 🔥 token도 같이 체크
      setSelectedScenario(null);
      return;
    }

    getScenario(token, selectedId)
      .then((obj) => {
        setSelectedScenario(obj.scenario || null);
      })
      .catch(() => {
        setSelectedScenario(null); // 🔥 삭제 직후 404 방지
      });
  }, [selectedId, token]);

  const handleStart = () => {
    setProgress(0);
    setCompleted(false);
    setRunning(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("삭제할까요?")) return;

    try {
      await deleteScenario(token, id); // ✅ 서버 응답 기다림

      setScenarioData((prev) => prev.filter((s) => s.id !== id));

      // ✅ 삭제한 게 현재 선택된 시나리오면 오른쪽 패널도 초기화
      setSelectedId((prev) => (String(prev) === String(id) ? null : prev));
      setSelectedScenario(null);
    } catch (e) {
      alert("삭제에 실패했습니다.");
      console.error(e);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      maxWorkerCount: "",
      scenarioProductList: [{ productId: "", quantity: "" }],
    });
    setErrors({});
    setShowForm(false);
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

  const updateItem = (i, key, value) => {
    const copy = [...form.scenarioProductList];
    copy[i][key] = value;
    setForm({ ...form, scenarioProductList: copy });
  };

  const validate = () => {
    const e = {};

    if (!form.title) e.title = "제목을 입력해주세요.";
    if (!form.date) e.date = "날짜를 선택해주세요.";
    if (!form.time) e.time = "시간을 선택해주세요.";
    if (!form.maxWorkerCount) e.maxWorkerCount = "인원을 입력해주세요.";

    if (
      form.scenarioProductList.length === 0 ||
      !form.scenarioProductList.some((p) => p.productId && p.quantity)
    ) {
      e.products = "최소 1개 품목과 수량을 입력해야 합니다.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddScenario = () => {
    if (!validate()) return;

    const payload = {
      title: form.title,
      description: form.description,
      startAt: `${form.date}T${form.time}`,
      maxWorkerCount: Number(form.maxWorkerCount),
      scenarioProduct: form.scenarioProductList.map((p) => ({
        productId: p.productId,
        qty: Number(p.quantity),
      })),
    };
    postScenario(token, payload).then((obj) => {
      setScenarioData((prev) => [obj.scenario, ...prev]);
    });
    resetForm();
  };

  function copyScenarioHandle(scenarioId) {
    copyScenario(token, scenarioId).then((obj) => {
      setScenarioData((prev) => [obj.cloneScenario, ...prev]);
    });
  }

  if (!token) return <div>Loading...</div>;

  return (
    <div className="h-200 w-full flex flex-col bg-gray-100 overflow-hidden">
      <header className="h-14 bg-white border-b px-6 flex items-center shrink-0">
        <span className="font-semibold text-blue-600">Scenario</span>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <section className="w-1/2 bg-white border-r px-6 py-4 h-full min-h-0">
          <ScrollArea className="h-full w-full">
            <div className=" flex justify-between mb-4">
              <h2 className="font-medium">시나리오 생성</h2>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="border px-2 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} /> 시나리오 추가
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showForm
                  ? "max-h-250 opacity-100 mb-6"
                  : "max-h-0 opacity-0 mb-0"
              }`}
            >
              <div className="border rounded-xl p-5 space-y-4 bg-white shadow-sm">
                {/* 제목 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    시나리오 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>

                {/* 설명 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    설명<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                {/* 날짜 + 시간 */}
                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium">
                      날짜 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                    />
                    {errors.date && (
                      <p className="text-xs text-red-500">{errors.date}</p>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium">
                      시간 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={form.time}
                      onChange={(e) =>
                        setForm({ ...form, time: e.target.value })
                      }
                    />
                    {errors.time && (
                      <p className="text-xs text-red-500">{errors.time}</p>
                    )}
                  </div>
                </div>

                {/* 인원 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    인원 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="작업에 투입될 인원 수"
                    value={form.maxWorkerCount}
                    onChange={(e) =>
                      setForm({ ...form, maxWorkerCount: e.target.value })
                    }
                  />
                  {errors.maxWorkerCount && (
                    <p className="text-xs text-red-500">
                      {errors.maxWorkerCount}
                    </p>
                  )}
                </div>

                {/* 생산 품목 */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    생산 품목 <span className="text-red-500">*</span>
                  </label>

                  {form.scenarioProductList.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        className="border rounded px-2 py-2 text-sm w-1/2"
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(i, "productId", e.target.value)
                        }
                      >
                        <option value="">품목 선택</option>
                        {products.map((p) => {
                          return (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          );
                        })}
                      </select>

                      <input
                        type="number"
                        className="border rounded px-2 py-2 text-sm w-1/2"
                        placeholder="수량"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(i, "quantity", e.target.value)
                        }
                      />

                      <button
                        onClick={() => removeItem(i)}
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {errors.products && (
                    <p className="text-xs text-red-500">{errors.products}</p>
                  )}

                  <button
                    onClick={addItem}
                    className="text-sm text-blue-600 flex items-center gap-1"
                  >
                    <Plus size={14} /> 품목 추가
                  </button>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={handleAddScenario}
                    className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    추가하기
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 border py-2 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>

            {/* LIST */}
            <div className="space-y-3">
              {scenarioData?.filter(Boolean).map((s) => {
                const active = String(selectedId) === String(s.id);

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedId(active ? null : s.id)}
                    className={`p-4 border rounded-lg cursor-pointer flex justify-between items-center transition-colors
          ${
            active ? "bg-blue-50 border-blue-400" : "bg-white hover:bg-gray-50"
          }`}
                  >
                    <div className="text-sm font-medium text-blue-700">
                      {s.title}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {s.startAt.slice(11, 16)}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyScenarioHandle(s.id);
                        }}
                        className="p-1 rounded hover:bg-blue-100 transition"
                        title="복사"
                      >
                        <Copy size={16} className="text-blue-600" />
                      </button>

                      {active && <Check size={16} className="text-blue-600" />}

                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1 rounded hover:bg-red-100 transition"
                        title="삭제"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </section>

        {/* RIGHT */}
        <ScenariosInformation
          selectedScenario={selectedScenario}
          progress={progress}
          running={running}
          completed={completed}
          onStart={handleStart}
          onEdit={(scenario) => setEditScenario(scenario)}
          onCancelEdit={() => setEditScenario(null)}
          editScenario={editScenario}
        />
      </div>
    </div>
  );
}
