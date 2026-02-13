import { getProducts } from "@/api/product-api";
import {
  copyScenario,
  deleteScenario,
  getScenario,
  getScenarios,
  postScenario,
  simulateScenario,
} from "@/api/scenario-api";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useAccount, useToken } from "@/stores/account-store";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import ScenarioLeftPanel from "@/components/scenario/ScenarioLeftPanel";
import ScenarioRightPanel from "@/components/scenario/ScenarioRightPanel";
import { Button } from "@/components/ui/button";
import { useStomp } from "@/stores/stomp-store";
import { DraftingCompass, X } from "lucide-react";

export default function ScenariosCreateForm() {
  useAuthGuard();
  const { token } = useToken();
  const { stomp } = useStomp();
  const router = useRouter();
  const loginAccount = useAccount((state) => state.account);

  const [scenarioData, setScenarioData] = useState([]);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [editScenario, setEditScenario] = useState(null);

  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  const scrollAreaRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    maxWorkerCount: "",
    scenarioProductList: [{ productId: "", quantity: "" }],
  });

  /* ===================== Effect ===================== */

  useEffect(() => {
    if (!stomp || !stomp.connected || !selectedScenario) return;

    console.log("📡 시나리오 stomp 구독 시작:!!!!!!");

    const sub = stomp.subscribe(
      `/topic/scenario/${selectedScenario?.id}`,
      (frame) => {
        const body = JSON.parse(frame.body);
        if (body.message === "refresh") {
          setIsLoadingScenario(true);
          getScenario(token, selectedScenario?.id).then((obj) => {
            setSelectedScenario(obj.scenario);
            setIsLoadingScenario(false);
          });
        }
      },
    );

    return () => {
      console.log("❌ 시나리오 구독 해제");
      sub.unsubscribe();
    };
  }, [stomp, selectedScenario?.id, loginAccount?.role]);

  useEffect(() => {
    if (!token || loginAccount?.role === "WORKER") return;

    getScenarios(token).then((res) => setScenarioData(res.scenarios || []));
    getProducts(token).then((res) => setProducts(res.products || []));
  }, [token, loginAccount?.role]);

  useEffect(() => {
    if (!selectedId || !token || loginAccount?.role === "WORKER") {
      setSelectedScenario(null);
      setIsLoadingScenario(false);
      return;
    }
    setIsLoadingScenario(true);
    getScenario(token, selectedId).then((res) => {
      setSelectedScenario(res.scenario);
      setIsLoadingScenario(false);
    });
  }, [selectedId, token]);

  const handleStartSimulation = async () => {
    if (!selectedId) return alert("시나리오를 선택해주세요.");

    setRunning(true);
    setProgress(0);
    setPending(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          // 100% 도달 시점: 이제부터 서버 응답을 기다림 (Loader 표시 시점)
          setPending(true);

          simulateScenario(token, selectedId)
            .then(() => {
              // 서버 응답 완료 시
              setRunning(false);
              setPending(false);
              handleRefreshDetail(selectedId);
            })
            .catch((err) => {
              console.error(err);
              setRunning(false);
              setPending(false);
            });

          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const userRole = loginAccount.role;
  const isAdmin = userRole === "ADMIN";
  const isPlanner = userRole === "PLANNER";
  const isWorker = userRole === "WORKER";

  if (loginAccount?.role === "WORKER") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <X className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">접근 권한 제한</h2>
        <p className="text-slate-500 font-medium text-center">
          시나리오 페이지는 관리자(ADMIN) 및 플래너 전용 구역입니다.
          <br />
          권한이 필요하시다면 관리자에게 문의하세요.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-xl"
        >
          메인으로 돌아가기
        </Button>
      </div>
    );
  }

  /* ===================== Handler ===================== */

  const scrollToTop = () => {
    setTimeout(() => {
      document.getElementById("scroll-top-anchor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleSelectScenario = (id) => {
    if (editScenario && !confirm("수정 중인 내용이 사라집니다.")) return;

    const isSameId = String(selectedId) === String(id);
    const nextId = isSameId ? 0 : id;

    setSelectedId(nextId);
    setEditScenario(null);

    setScenarioData((prev) =>
      prev.map((s) =>
        String(s.id) === String(id) ? { ...s, isNew: false } : s,
      ),
    );

    if (nextId) {
      getScenario(token, nextId).then((res) => {
        setSelectedScenario(res.scenario);
      });
    } else {
      setSelectedScenario(null);
    }
  };

  const handleCopyScenario = (id) => {
    copyScenario(token, id).then((obj) => {
      const newScenario = {
        ...obj.cloneScenario,
        status: "READY",
        makespan: null,
        isNew: true, // 복사 직후 배지 활성화
      };

      setScenarioData((prev) => [newScenario, ...(prev || [])]);

      setShowForm(false);

      scrollToTop();
    });
  };

  const handleAddItem = () =>
    setForm((v) => ({
      ...v,
      scenarioProductList: [
        ...v.scenarioProductList,
        { productId: "", quantity: "" },
      ],
    }));

  const handleRemoveItem = (i) =>
    setForm((v) => ({
      ...v,
      scenarioProductList: v.scenarioProductList.filter((_, idx) => idx !== i),
    }));

  const handleUpdateItem = (i, key, value) => {
    const newList = [...form.scenarioProductList];
    newList[i] = { ...newList[i], [key]: value };
    setForm({ ...form, scenarioProductList: newList });
  };

  const handleAddScenario = () => {
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

    postScenario(token, payload).then((res) => {
      const newS = { ...res.scenario, isCreated: true };
      setScenarioData((prev) => [newS, ...(prev || [])]);
      setSelectedId(newS.id);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        maxWorkerCount: "",
        scenarioProductList: [{ productId: "", quantity: "" }],
      });
      scrollToTop();
    });
  };

  const onToggleForm = () => {
    if (!showForm) {
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        maxWorkerCount: "",
        scenarioProductList: [{ productId: "", quantity: "" }],
      });
      setShowForm(true);

      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector(
            "[data-radix-scroll-area-viewport]",
          );
          if (viewport) {
            viewport.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }, 50);
    } else {
      setShowForm(false);
    }
  };

  const handleDeleteScenario = async (id) => {
    if (!confirm("삭제할까요?")) return;
    await deleteScenario(token, id);
    setScenarioData((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(0);
  };

  // 목록과 상세 데이터를 모두 최신화하는 함수
  const handleRefreshDetail = (id) => {
    if (!id || !token) return;

    setIsLoadingScenario(true);

    // 1. 상세 데이터 다시 가져오기 (우측 패널용)
    getScenario(token, id).then((res) => {
      setSelectedScenario(res.scenario);
      setIsLoadingScenario(false);

      // 2. 목록 데이터도 부분 업데이트 (좌측 패널용)
      setScenarioData((prev) =>
        prev.map((item) =>
          String(item.id) === String(id) ? res.scenario : item,
        ),
      );
    });
  };

  if (!token) return null;

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <div className="flex justify-between items-end border-b border-slate-100 shrink-0">
        <div className="mb-3">
          <div className="flex items-center gap-2 text-indigo-600">
            <DraftingCompass size={20} />
            <span className="text-xs font-black uppercase tracking-widest">
              Management
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            시나리오 관리
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            생산 시뮬레이션을 위한 시나리오를 구성하고 분석합니다.
          </p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 mt-6 gap-6 overflow-hidden">
        <section className="w-[50%] flex flex-col min-h-0 border border-slate-200 rounded-[32px] bg-slate-50/30 overflow-hidden shadow-sm">
          <ScenarioLeftPanel
            scenarioData={scenarioData}
            selectedId={selectedId}
            showForm={showForm}
            form={form}
            errors={errors}
            products={products}
            scrollAreaRef={scrollAreaRef}
            setForm={setForm}
            onToggleForm={onToggleForm}
            onSelectScenario={handleSelectScenario}
            onAddScenario={handleAddScenario}
            onResetForm={() => setShowForm(false)}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onUpdateItem={handleUpdateItem}
            onCopyScenario={handleCopyScenario}
            onDeleteScenario={handleDeleteScenario}
          />
        </section>

        <section className="w-[50%] flex flex-col min-h-0 border border-slate-200 rounded-[32px] bg-white overflow-hidden shadow-sm">
          <ScenarioRightPanel
            selectedScenario={selectedScenario}
            isLoadingScenario={isLoadingScenario}
            onRefreshDetail={handleRefreshDetail}
            progress={progress}
            displayProgress={displayProgress}
            running={running}
            pending={pending}
            onStart={handleStartSimulation}
            editScenario={editScenario}
            onEdit={setEditScenario}
            onCancelEdit={() => setEditScenario(null)}
          />
        </section>
      </div>
    </div>
  );
}
