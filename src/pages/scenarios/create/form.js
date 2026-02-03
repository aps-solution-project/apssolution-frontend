import ScenariosInformation from "@/components/scenario/ScenarioInfomation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  Copy,
  Plus,
  Trash2,
  Calendar,
  Users,
  Package,
  Clock,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const initialScenarios = [
  {
    id: 1,
    title: "2월 4일자 제품 생산",
    description: "당일 생산 수량 및 품질 점검 요약",
    startAt: "2026-02-04T09:00",
    maxWorkerCount: 5,
    scenarioProductList: [{ productId: "제품 A", quantity: 100 }],
  },
  {
    id: 2,
    title: "2월 3일자 제품 생산",
    description: "전일 생산 결과 및 이슈 정리",
    startAt: "2026-02-03T10:00",
    maxWorkerCount: 4,
    scenarioProductList: [{ productId: "제품 B", quantity: 80 }],
  },
];

export default function ScenariosCreate() {
  const [scenarioData, setScenarioData] = useState(initialScenarios);
  const [selectedId, setSelectedId] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    maxWorkerCount: "",
    scenarioProductList: [{ productId: "", quantity: "" }],
  });

  const selectedScenario = scenarioData.find((s) => s.id === selectedId);

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

  const handleStart = () => {
    setProgress(0);
    setCompleted(false);
    setRunning(true);
  };

  const handleDelete = (id) => {
    if (!confirm("삭제할까요?")) return;
    setScenarioData((prev) => prev.filter((s) => s.id !== id));
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
      id: Date.now(),
      title: form.title,
      description: form.description,
      startAt: `${form.date}T${form.time}`,
      maxWorkerCount: Number(form.maxWorkerCount),
      scenarioProductList: form.scenarioProductList.map((p) => ({
        productId: p.productId,
        quantity: Number(p.quantity),
      })),
    };
    setScenarioData([payload, ...scenarioData]);
    resetForm();
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden font-sans">
      {/* 고퀄리티 헤더 */}
      <header className="h-16 bg-white border-b px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-gray-800 text-lg tracking-tight">
            Scenario Builder
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-[1px] bg-gray-200 mx-2" />
          <button className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            Documentation
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT SECTION: List & Form */}
        <section className="w-[450px] bg-white border-r flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-0">
          <div className="p-6 border-b bg-gray-50/50">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-xl font-bold text-gray-900">시나리오 목록</h2>
              <button
                onClick={() => setShowForm((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  showForm
                    ? "bg-gray-800 text-white hover:bg-gray-900"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200"
                }`}
              >
                {showForm ? <X size={16} /> : <Plus size={16} />}
                {showForm ? "닫기" : "새 시나리오"}
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Manage your production workflow
            </p>
          </div>

          <ScrollArea className="flex-1 bg-gray-50/30">
            <div className="p-6 space-y-6">
              {/* FORM AREA */}
              <div
                className={`transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  showForm
                    ? "scale-100 opacity-100 mb-8"
                    : "scale-95 opacity-0 hidden"
                }`}
              >
                <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xl ring-4 ring-indigo-50/50 space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Title
                      </label>
                      <input
                        placeholder="시나리오 제목을 입력하세요"
                        className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Date
                        </label>
                        <input
                          type="date"
                          className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={form.date}
                          onChange={(e) =>
                            setForm({ ...form, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Time
                        </label>
                        <input
                          type="time"
                          className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          value={form.time}
                          onChange={(e) =>
                            setForm({ ...form, time: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                        Products
                      </label>
                      {form.scenarioProductList.map((item, i) => (
                        <div
                          key={i}
                          className="flex gap-2 group animate-in slide-in-from-left-2"
                        >
                          <select
                            className="flex-1 bg-gray-50 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                            value={item.productId}
                            onChange={(e) =>
                              updateItem(i, "productId", e.target.value)
                            }
                          >
                            <option value="">품목</option>
                            <option>제품 A</option>
                            <option>제품 B</option>
                          </select>
                          <input
                            type="number"
                            className="w-24 bg-gray-50 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(i, "quantity", e.target.value)
                            }
                          />
                          <button
                            onClick={() => removeItem(i)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addItem}
                        className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 hover:text-indigo-800 transition-colors py-1"
                      >
                        <Plus size={14} className="bg-indigo-50 rounded" /> 품목
                        추가하기
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleAddScenario}
                      className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                    >
                      시나리오 저장
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-all"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>

              {/* LIST AREA */}
              <div className="space-y-4">
                {scenarioData.map((s) => {
                  const active = selectedId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={`group relative p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                        active
                          ? "bg-white border-indigo-500 shadow-xl shadow-indigo-100 translate-x-1"
                          : "bg-white border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3
                            className={`font-bold transition-colors ${active ? "text-indigo-600" : "text-gray-800"}`}
                          >
                            {s.title}
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                              <Calendar size={12} /> {s.startAt.slice(0, 10)}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                              <Clock size={12} /> {s.startAt.slice(11, 16)}
                            </span>
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 bg-indigo-50/50 px-2 py-1 rounded-md">
                              <Users size={12} /> {s.maxWorkerCount}명
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex flex-col gap-2 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); /* 복사 로직 */
                            }}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(s.id);
                            }}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-500 rounded-r-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </section>

        {/* RIGHT SECTION: Information Display */}
        <section className="flex-1 bg-[#F8FAFC] relative">
          <ScrollArea className="h-full w-full">
            <div className="max-w-4xl mx-auto p-12">
              {selectedScenario ? (
                <ScenariosInformation
                  selectedScenario={{
                    ...selectedScenario,
                    date: selectedScenario.startAt.split("T")[0],
                    time: selectedScenario.startAt.split("T")[1],
                  }}
                  progress={progress}
                  running={running}
                  completed={completed}
                  onStart={handleStart}
                />
              ) : (
                <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-300">
                    <Package size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      시나리오를 선택하세요
                    </h3>
                    <p className="text-gray-500">
                      생성된 시나리오를 선택하여 상세 정보와
                      <br />
                      생산 프로세스를 확인하고 실행할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </section>
      </div>
    </div>
  );
}
