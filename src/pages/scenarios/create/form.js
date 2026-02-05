import { getProducts } from "@/api/product-api";
import {
  copyScenario,
  deleteScenario,
  getScenario,
  getScenarios,
  postScenario,
  simulateScenario,
} from "@/api/scenario-api";
import Header from "@/components/layout/Header";
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

    getScenarios(token)
      .then((obj) => setScenarioData(obj.scenarios || []))
      .catch(() => setScenarioData([]));

    getProducts(token)
      .then((obj) => setProducts(obj.products || []))
      .catch(() => setProducts([]));
  }, [token]);

  // 시뮬레이션 관련
  useEffect(() => {
    if (progress === 100 && selectedScenario?.status === "READY") {
      selectedScenario.status = "PENDING";
      simulateScenario(token, selectedScenario.id)
        .then(() => {
          setRunning(false);
          setPending(true);
        })
        .catch(() => {
          setRunning(false);
          setPending(false);
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
    setForm((prev) => ({
      ...prev,
      scenarioProductList: [
        ...prev.scenarioProductList,
        { productId: "", quantity: "" },
      ],
    }));

  const removeItem = (i) =>
    setForm((prev) => ({
      ...prev,
      scenarioProductList: prev.scenarioProductList.filter(
        (_, idx) => idx !== i,
      ),
    }));

  const updateItem = (i, key, value) => {
    setForm((prev) => {
      const copy = [...prev.scenarioProductList];
      copy[i] = { ...copy[i], [key]: value };
      return { ...prev, scenarioProductList: copy };
    });
  };

  const scrollToTop = () => {
    // ScrollArea 안의 anchor로 이동 (안전)
    setTimeout(() => {
      document.getElementById("scroll-top-anchor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleToggleForm = () => {
    setShowForm((v) => !v);
    if (!showForm) scrollToTop();
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
    const nextId = isSameId ? 0 : id;

    setSelectedId(nextId);
    setEditScenario(null);

    setScenarioData((prev) =>
      (prev || []).map((s) =>
        String(s.id) === String(id) ? { ...s, isNew: false } : s,
      ),
    );

    if (nextId) {
      const clicked = (scenarioData || []).find(
        (s) => String(s.id) === String(id),
      );
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
        setScenarioData((prev) => [newScenario, ...(prev || [])]);
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
      setScenarioData((prev) => [newScenario, ...(prev || [])]);
      scrollToTop();
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("삭제할까요?")) return;
    try {
      await deleteScenario(token, id);
      setScenarioData((prev) => (prev || []).filter((s) => s.id !== id));
      setSelectedId(0);
      setSelectedScenario(null);
    } catch (e) {
      alert("삭제 실패");
    }
  };

  if (!token) return <div>Loading...</div>;

  return (
    // ✅ 전체 화면 고정 + 바깥 스크롤 제거
    <div className="h-[100dvh] w-full bg-slate-50 overflow-hidden flex flex-col">
      {/* 기존 헤더(사이드바/상단바) */}
      <div className="shrink-0">
        <Header />
      </div>

      {/* 페이지 타이틀바 */}
      <div className="shrink-0 h-16 px-8 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-2xl font-bold text-slate-800 mt-5">
            시나리오 설계
          </div>
        </div>
      </div>

      {/* ✅ 본문: 남은 영역만 사용 */}
      <div className="flex-1 min-h-0 overflow-hidden p-5">
        {/* ✅ 카드 프레임 */}
        <div className="h-full min-h-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="h-full min-h-0 flex overflow-hidden">
            {/* ===================== 왼쪽 ===================== */}
            <section className="w-[45%] min-h-0 border-r border-slate-100 bg-slate-200 flex flex-col overflow-hidden">
              {/* left header */}
              <div className="shrink-0 px-6 py-5  backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-800">
                      시나리오 목록
                    </h2>
                    <p className="text-[12px] text-slate-500 font-normal mt-1">
                      목록에서 선택하거나 새 시나리오를 생성하세요.
                    </p>
                  </div>

                  <button
                    onClick={handleToggleForm}
                    type="button"
                    className={[
                      "shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition",
                      showForm
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200/60",
                    ].join(" ")}
                  >
                    {showForm ? <X size={14} /> : <Plus size={14} />}
                    {showForm ? "닫기" : "새 시나리오"}
                  </button>
                </div>
              </div>
              {/* left scroll */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea ref={scrollAreaRef} className="h-full">
                  <div className="p-6">
                    <div id="scroll-top-anchor" className="h-2 w-0" />

                    {/* FORM */}
                    <div
                      className={[
                        "transition-all duration-500 ease-in-out overflow-hidden",
                        showForm
                          ? "max-h-[1200px] opacity-100 mb-6"
                          : "max-h-0 opacity-0 mb-0",
                      ].join(" ")}
                    >
                      <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm ring-4 ring-blue-50/60 space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-100 uppercase tracking-wider ml-1">
                            Title
                          </label>
                          <input
                            className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-blue-500"
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

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                              Date
                            </label>
                            <input
                              type="date"
                              className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-blue-500"
                              value={form.date}
                              onChange={(e) =>
                                setForm({ ...form, date: e.target.value })
                              }
                            />
                            {errors.date && (
                              <p className="text-xs text-red-500 ml-1">
                                {errors.date}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                              Time
                            </label>
                            <input
                              type="time"
                              className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-blue-500"
                              value={form.time}
                              onChange={(e) =>
                                setForm({ ...form, time: e.target.value })
                              }
                            />
                            {errors.time && (
                              <p className="text-xs text-red-500 ml-1">
                                {errors.time}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Workers
                          </label>
                          <div className="relative">
                            <Users
                              size={16}
                              className="absolute left-4 top-3.5 text-slate-400"
                            />
                            <input
                              type="number"
                              className="w-full bg-slate-50 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-blue-500"
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
                          {errors.maxWorkerCount && (
                            <p className="text-xs text-red-500 ml-1">
                              {errors.maxWorkerCount}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 pt-1">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
                            Production Items
                          </label>

                          <div className="space-y-2">
                            {form.scenarioProductList.map((item, i) => (
                              <div key={i} className="flex gap-2 items-center">
                                <select
                                  className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-blue-500"
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
                                  className="w-24 bg-slate-50 rounded-xl px-3 py-2.5 text-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-blue-500"
                                  placeholder="수량"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(i, "quantity", e.target.value)
                                  }
                                />

                                {form.scenarioProductList.length > 1 && (
                                  <button
                                    onClick={() => removeItem(i)}
                                    type="button"
                                    className="p-2 rounded-xl text-red-400 hover:bg-red-50"
                                    title="삭제"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={addItem}
                            type="button"
                            className="inline-flex items-center gap-1.5 text-sm font-black text-blue-600 hover:text-blue-700"
                          >
                            <Plus size={16} /> 품목 추가
                          </button>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleAddScenario}
                            type="button"
                            className="flex-1 bg-blue-600 text-white font-black py-3 rounded-2xl text-sm shadow-md shadow-blue-200/70 hover:bg-blue-700 active:scale-[0.99] transition"
                          >
                            시나리오 생성
                          </button>
                          <button
                            onClick={resetForm}
                            type="button"
                            className="px-5 py-3 bg-slate-100 text-slate-600 font-black rounded-2xl text-sm hover:bg-slate-200 active:scale-[0.99] transition"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LIST */}
                    <div className="grid grid-cols-1 gap-3">
                      {(scenarioData || []).map((s) => {
                        const active = String(selectedId) === String(s.id);

                        return (
                          <div
                            key={s.id}
                            onClick={() => handleSelectScenario(s.id)}
                            className={[
                              "group relative cursor-pointer rounded-[26px] border p-5 transition-all",
                              active
                                ? "bg-white border-blue-300 shadow-lg shadow-blue-100"
                                : "bg-white/70 border-slate-200 hover:bg-white hover:shadow-sm",
                            ].join(" ")}
                          >
                            {/* 선택 인디케이터 */}
                            <div
                              className={[
                                "absolute left-0 top-5 bottom-5 w-1.5 rounded-full transition",
                                active ? "bg-blue-600" : "bg-transparent",
                              ].join(" ")}
                            />

                            {s.isNew && (
                              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] px-2.5 py-1 rounded-full font-black animate-pulse">
                                NEW
                              </span>
                            )}

                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 space-y-2">
                                <h3
                                  className={[
                                    "truncate text-sm font-semibold",
                                    active ? "text-blue-700" : "text-slate-800",
                                  ].join(" ")}
                                >
                                  {s.title}
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                  <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
                                    <Calendar
                                      size={12}
                                      className="text-slate-500"
                                    />
                                    <span className="text-[11px] font-bold text-slate-600">
                                      {s.startAt?.slice(0, 10) || "-"}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1">
                                    <Users
                                      size={12}
                                      className="text-blue-600"
                                    />
                                    <span className="text-[11px] font-black text-blue-700">
                                      {s.maxWorkerCount ?? "-"}명
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={[
                                  "flex flex-col gap-1 transition-all",
                                  active
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100",
                                ].join(" ")}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyScenarioHandle(s.id);
                                  }}
                                  type="button"
                                  className="p-2 rounded-xl text-slate-400 hover:text-blue-700 hover:bg-blue-50"
                                  title="복사"
                                >
                                  <Copy size={18} />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(s.id);
                                  }}
                                  type="button"
                                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  title="삭제"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </section>

            {/* ===================== 오른쪽 ===================== */}
            <section className="w-[55%] min-h-0 bg-white flex flex-col overflow-hidden">
              {/* ✅ 오른쪽도 ScrollArea로 통일 */}
              <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/40">
                <ScrollArea className="h-full w-full">
                  <div className="p-3">
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
                </ScrollArea>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
