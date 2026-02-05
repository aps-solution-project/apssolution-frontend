import { getProducts } from "@/api/product-api";
import {
  copyScenario,
  deleteScenario,
  getScenario,
  getScenarios,
  postScenario,
  simulateScenario,
} from "@/api/scenario-api";
import Information from "@/components/scenario/Information";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useToken } from "@/stores/account-store";
import { Calendar, Copy, Plus, Trash2, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ScenariosCreateForm() {
  useAuthGuard();
  const [scenarioData, setScenarioData] = useState([]);
  const [selectedId, setSelectedId] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(false);
  const { token } = useToken();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [products, setProducts] = useState([]);
  const [editScenario, setEditScenario] = useState(null);
  const scrollAreaRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    maxWorkerCount: "",
    scenarioProductList: [{ productId: "", quantity: "" }],
  });

  // API 데이터 로드
  useEffect(() => {
    if (!token) return;
    getScenarios(token).then((obj) => setScenarioData(obj.scenarios || []));
    getProducts(token).then((obj) => setProducts(obj.products || []));
  }, [token]);

  // 시뮬레이션 관련 Effect
  useEffect(() => {
    if (progress === 100 && selectedScenario?.status === "READY") {
      selectedScenario.status = "PENDING";
      simulateScenario(token, selectedScenario.id).then(() => {
        setRunning(false);
        setPending(true);
      });
    }
  }, [progress, selectedScenario, token]);

  useEffect(() => {
    if (!running) return;
    if (progress >= 100) {
      setRunning(false);
      setPending(true);
      return;
    }
    const t = setTimeout(() => setProgress((p) => p + 1), 10);
    return () => clearTimeout(t);
  }, [running, progress]);

  // 상세 데이터 로드
  useEffect(() => {
    if (!selectedId || !token) {
      setSelectedScenario(null);
      return;
    }
    getScenario(token, selectedId)
      .then((obj) => setSelectedScenario(obj.scenario || null))
      .catch(() => setSelectedScenario(null));
  }, [selectedId, token]);

  const handleStart = () => {
    setProgress(0);
    setPending(false);
    setRunning(true);
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

  const addItem = () =>
    setForm({
      ...form,
      scenarioProductList: [
        ...form.scenarioProductList,
        { productId: "", quantity: "" },
      ],
    });

  const removeItem = (i) =>
    setForm({
      ...form,
      scenarioProductList: form.scenarioProductList.filter(
        (_, idx) => idx !== i,
      ),
    });

  const updateItem = (i, key, value) => {
    const copy = [...form.scenarioProductList];
    copy[i][key] = value;
    setForm({ ...form, scenarioProductList: copy });
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      scrollToTop();
    }
  };

  const scrollToTop = () => {
    setTimeout(() => {
      document.getElementById("scroll-top-anchor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const validate = () => {
    const e = {};
    if (!form.title) e.title = "제목을 입력해주세요.";
    if (!form.date) e.date = "날짜를 선택해주세요.";
    if (!form.time) e.time = "시간을 선택해주세요.";
    if (!form.maxWorkerCount) e.maxWorkerCount = "인원을 입력해주세요.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSelectScenario = (id) => {
    if (
      editScenario &&
      !confirm("수정 중인 내용이 사라집니다. 이동하시겠습니까?")
    )
      return;

    const isSameId = String(selectedId) === String(id);
    const nextId = isSameId ? null : id;

    setSelectedId(nextId);
    setEditScenario(null);
    setScenarioData((prev) =>
      prev.map((s) =>
        String(s.id) === String(id) ? { ...s, isNew: false } : s,
      ),
    );

    if (nextId) {
      const clicked = scenarioData.find((s) => String(s.id) === String(id));
      if (clicked) setSelectedScenario(clicked);
    }
  };

  const handleAddScenario = () => {
    if (!validate()) return;

    const payload = {
      title: form.title,
      description: form.description,
      startAt: `${form.date}T${form.time}:00`,
      maxWorkerCount: Number(form.maxWorkerCount),
      scenarioProduct: form.scenarioProductList.map((p) => ({
        productId: p.productId,
        qty: Number(p.quantity),
      })),
    };

    postScenario(token, payload)
      .then((obj) => {
        const newScenario = { ...obj.scenario, isNew: true };
        setScenarioData((prev) => [newScenario, ...prev]);
        handleSelectScenario(newScenario.id);
        resetForm();
        scrollToTop();
      })
      .catch((err) => {
        console.error("생성 실패:", err);
        alert("시나리오 생성 중 오류가 발생했습니다.");
      });
  };

  const copyScenarioHandle = (id) => {
    copyScenario(token, id).then((obj) => {
      const newScenario = {
        ...obj.cloneScenario,
        status: "READY",
        makespan: null,
        isNew: true,
      };
      setScenarioData((prev) => [newScenario, ...prev]);
      scrollToTop();
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("삭제할까요?")) return;
    try {
      await deleteScenario(token, id);
      setScenarioData((prev) => prev.filter((s) => s.id !== id));
      setSelectedId(0);
      setSelectedScenario(null);
    } catch (e) {
      alert("삭제 실패");
    }
  };

  if (!token) return <div>Loading...</div>;

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
      <header className="h-16 bg-white border-b px-8 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <span className="font-bold text-xl tracking-tight text-slate-800">
          Scenario Engine
        </span>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 왼쪽 리스트 섹션 */}
        <section className="flex-[0.5] bg-white border-r flex flex-col h-full shadow-xl shrink-0 overflow-hidden">
          <div className="p-6 h-24 shrink-0 border-b bg-white z-20 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">시나리오 목록</h2>
            <button
              onClick={handleToggleForm}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                showForm
                  ? "bg-slate-100 text-slate-600"
                  : "bg-blue-600 text-white"
              }`}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "닫기" : "새 시나리오"}
            </button>
          </div>

          <div className="flex-1 min-h-0 relative">
            <ScrollArea
              ref={scrollAreaRef}
              className="h-full w-full bg-slate-50/30"
            >
              <div className="p-10">
                <div id="scroll-top-anchor" className="h-10 w-0" />

                {/* FORM AREA */}
                <div
                  className={`overflow-visible transition-all duration-500 ease-in-out ${showForm ? "max-h-[1200px] opacity-100 mb-8" : "max-h-0 opacity-0 mb-0"}`}
                >
                  <div className="bg-white border border-blue-100 rounded-[32px] p-8 shadow-xl ring-4 ring-blue-50/50 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                          Title
                        </label>
                        <input
                          className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="시나리오 제목"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                        />
                        {errors.title && (
                          <p className="text-xs text-red-500 ml-1">
                            {errors.title}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Date
                          </label>
                          <input
                            type="date"
                            className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                            value={form.date}
                            onChange={(e) =>
                              setForm({ ...form, date: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                            Time
                          </label>
                          <input
                            type="time"
                            className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                            value={form.time}
                            onChange={(e) =>
                              setForm({ ...form, time: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                          Workers
                        </label>
                        <div className="relative">
                          <Users
                            size={16}
                            className="absolute left-4 top-3.5 text-slate-400"
                          />
                          <input
                            type="number"
                            className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="인원"
                            value={form.maxWorkerCount}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                maxWorkerCount: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                          Production Items
                        </label>
                        {form.scenarioProductList.map((item, i) => (
                          <div key={i} className="flex gap-2 items-center">
                            <select
                              className="flex-1 bg-slate-50 border-none rounded-xl px-3 py-2.5 text-sm"
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
                              className="w-24 bg-slate-50 border-none rounded-xl px-3 py-2.5 text-sm"
                              placeholder="수량"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(i, "quantity", e.target.value)
                              }
                            />
                            {form.scenarioProductList.length > 1 && (
                              <button
                                onClick={() => removeItem(i)}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addItem}
                          className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 ml-1"
                        >
                          <Plus size={16} /> 품목 추가
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleAddScenario}
                        className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-blue-200"
                      >
                        시나리오 생성
                      </button>
                      <button
                        onClick={resetForm}
                        className="px-5 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-2xl text-sm"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>

                {/* LIST AREA */}
                <div className="grid grid-cols-1 gap-4">
                  {scenarioData.map((s) => {
                    const active = String(selectedId) === String(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectScenario(s.id)}
                        className={`group relative p-6 border-2 rounded-[28px] cursor-pointer transition-all duration-300 ${
                          active
                            ? "bg-white border-blue-500 shadow-2xl translate-x-2"
                            : "bg-white border-transparent hover:border-slate-200 shadow-sm"
                        }`}
                      >
                        {s.isNew && (
                          <span className="absolute -top-2 -right-1 bg-yellow-500 text-white text-[10px] px-2.5 py-1 rounded-full font-black animate-pulse z-30">
                            NEW COPY
                          </span>
                        )}
                        <div className="flex justify-between items-start">
                          <div className="space-y-3">
                            <h3
                              className={`font-bold text-base transition-colors ${active ? "text-blue-600" : "text-slate-700"}`}
                            >
                              {s.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                                <Calendar
                                  size={12}
                                  className="text-slate-500"
                                />
                                <span className="text-[11px] font-bold text-slate-500">
                                  {s.startAt?.slice(0, 10)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg">
                                <Users size={12} className="text-blue-500" />
                                <span className="text-[11px] font-bold text-blue-500">
                                  {s.maxWorkerCount}명
                                </span>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex flex-col gap-1 transition-all ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyScenarioHandle(s.id);
                              }}
                              className="p-2 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600"
                            >
                              <Copy size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(s.id);
                              }}
                              className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        {active && (
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </div>
        </section>

        {/* 오른쪽 상세 섹션 */}
        <section className="flex-[0.5] bg-slate-50 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <Information
              selectedScenario={selectedScenario}
              progress={progress}
              running={running}
              pending={pending}
              onStart={handleStart}
              onEdit={(scenario) => setEditScenario(scenario)}
              onCancelEdit={() => setEditScenario(null)}
              editScenario={editScenario}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
