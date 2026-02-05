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
import {
  Check,
  Copy,
  Plus,
  Trash2,
  Calendar,
  Users,
  Clock,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

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

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    maxWorkerCount: "",
    scenarioProductList: [{ productId: "", quantity: "" }],
  });

  useEffect(() => {
    if (progress === 100 && selectedScenario?.status === "READY") {
      selectedScenario.status = "PENDING";
      simulateScenario(token, selectedScenario.id).then(() => {
        setRunning(false);
        setPending(true);
      });
    }
  }, [progress]);

  useEffect(() => {
    if (!token) return;
    getScenarios(token).then((obj) => setScenarioData(obj.scenarios));
    getProducts(token).then((obj) => setProducts(obj.products || []));
  }, [token]);

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
    postScenario(token, payload).then((obj) =>
      setScenarioData((prev) => [obj.scenario, ...prev]),
    );
    resetForm();
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
  const copyScenarioHandle = (id) =>
    copyScenario(token, id).then((obj) =>
      setScenarioData((prev) => [obj.cloneScenario, ...prev]),
    );

  if (!token) return <div>Loading...</div>;

  const handleSelectScenario = (id) => {
    // 만약 현재 수정 중인 내용이 있다면 물어보기 (선택 사항)
    if (
      editScenario &&
      !confirm("수정 중인 내용이 사라집니다. 이동하시겠습니까?")
    ) {
      return;
    }

    const isSameId = String(selectedId) === String(id);
    // 1. 같은 걸 누르면 해제(null), 다른 걸 누르면 해당 ID 설정
    setSelectedId(isSameId ? null : id);

    // 2. 다른 시나리오를 선택할 때 수정 폼을 항상 닫아줌
    setEditScenario(null);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden text-slate-900">
      {/* HEADER */}
      <header className="h-16 bg-white border-b px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm" />
          </div> */}
          <span className="font-bold text-xl tracking-tight text-slate-800">
            Scenario Engine
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT SECTION: 목록 및 생성 폼 */}
        <section className="w-[480px] bg-white border-r flex flex-col h-full shadow-xl shrink-0 overflow-hidden">
          {/* 1. 상단 헤더: 고정 (shrink-0) */}
          <div className="p-3 shrink-0 border-b bg-white z-20">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                시나리오 목록
              </h2>
              <button
                onClick={() => setShowForm((v) => !v)}
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
          </div>

          {/* 2. 스크롤 영역: flex-1과 min-h-0으로 남은 높이 강제 할당 */}
          <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full w-full bg-slate-50/30">
              {/* 3. 실제 컨텐츠가 담기는 컨테이너: 여기에 패딩을 줍니다 */}
              <div className="p-5 space-y-2">
                {/* FORM AREA (애니메이션 폼) */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    showForm
                      ? "max-h-[1200px] opacity-100 mb-8"
                      : "max-h-0 opacity-0 mb-0"
                  }`}
                >
                  <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-xl ring-4 ring-blue-50/50 space-y-2">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                          Title
                        </label>
                        <input
                          className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                          placeholder="시나리오 제목을 입력하세요"
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                        />
                        {errors.title && (
                          <p className="text-xs text-red-500 font-medium ml-1">
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
                            className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                            className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                            className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="투입 인원"
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
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleAddScenario}
                        className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                      >
                        시나리오 생성
                      </button>
                      <button
                        onClick={resetForm}
                        className="px-5 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-2xl text-sm hover:bg-slate-200 transition-all"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>

                {/* LIST AREA */}
                <div className="space-y-4">
                  {scenarioData?.filter(Boolean).map((s) => {
                    const active = String(selectedId) === String(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectScenario(s.id)}
                        className={`group relative p-5 border-2 rounded-[24px] cursor-pointer transition-all duration-300 ${
                          active
                            ? "bg-white border-blue-500 shadow-2xl shadow-blue-100 translate-x-2"
                            : "bg-white border-transparent hover:border-slate-200 shadow-md hover:shadow-lg"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-3">
                            <h3
                              className={`font-bold text-base leading-tight transition-colors ${active ? "text-blue-600" : "text-slate-700"}`}
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
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock size={12} />
                                <span className="text-[11px] font-medium">
                                  {s.startAt?.slice(11, 16)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`flex flex-col gap-1 transition-all duration-200 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyScenarioHandle(s.id);
                              }}
                              className="p-2 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <Copy size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(s.id);
                              }}
                              className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
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

        {/* RIGHT SECTION: 상세 정보 */}
        <section className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
          <div className="flex-1 flex flex-col p-8 min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
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
          </div>
        </section>
      </div>
    </div>
  );
}
