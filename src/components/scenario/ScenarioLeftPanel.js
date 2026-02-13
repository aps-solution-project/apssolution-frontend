import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Copy, Plus, Trash2, Users, X } from "lucide-react";
import { Spinner } from "../ui/spinner";

export default function ScenarioLeftPanel({
  scenarioData,
  selectedId,
  showForm,
  form,
  errors,
  products,
  scrollAreaRef,

  onToggleForm,
  onSelectScenario,
  onAddScenario,
  onResetForm,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onCopyScenario,
  onDeleteScenario,
  setForm,
}) {
  return (
    <section className="h-full w-full min-h-0 flex flex-col border-r border-slate-100 bg-slate-100 overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 px-6 py-5">
        <div className="flex justify-between items-start">
          <button
            onClick={onToggleForm}
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

      {/* SCROLL */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
        <div className="p-6 relative">
          <div
            id="scroll-top-anchor"
            className="absolute top-0 left-0 h-1 w-1"
          />

          {/* FORM */}
          {showForm && (
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 mb-6 shadow-sm ring-1 ring-slate-100 space-y-6">
              {/* 1. Title 섹션 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em] ml-1">
                  Scenario Title
                </label>
                <input
                  className="w-full rounded-2xl px-4 py-3.5 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 text-sm font-bold"
                  placeholder="시나리오 제목을 입력하세요"
                  value={form.title}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, title: e.target.value }))
                  }
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 ml-1 font-bold">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em] ml-1">
                  Scenario Description
                </label>
                <input
                  className="w-full rounded-2xl px-4 py-3.5 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300 text-sm font-bold"
                  placeholder="시나리오 설명을 입력하세요"
                  value={form.description}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, description: e.target.value }))
                  }
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 ml-1 font-bold">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* 2. Start Schedule 섹션 (날짜 & 시간) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em] ml-1">
                  Start Schedule
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="rounded-2xl px-4 py-3 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-slate-700"
                    value={form.date}
                    onChange={(e) => {
                      setForm((v) => ({ ...v, date: e.target.value }));
                    }}
                  />
                  <input
                    type="time"
                    className="rounded-2xl px-4 py-3 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-slate-700"
                    value={form.time}
                    onChange={(e) => {
                      setForm((v) => ({ ...v, time: e.target.value }));
                    }}
                  />
                </div>
              </div>

              {/* 3. Workers 섹션 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em] ml-1">
                  Max Workforce
                </label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="number"
                    placeholder="최대 작업 인원"
                    className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                    value={form.maxWorkerCount}
                    onChange={(e) =>
                      setForm((v) => ({ ...v, maxWorkerCount: e.target.value }))
                    }
                  />
                </div>
                {errors.maxWorkerCount && (
                  <p className="text-[11px] text-rose-500 ml-1 font-bold">
                    {errors.maxWorkerCount}
                  </p>
                )}
              </div>

              {/* 4. Products 섹션 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em]">
                    Production Items
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    Total: {form.scenarioProductList.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {form.scenarioProductList.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2 items-center group animate-in fade-in slide-in-from-top-1"
                    >
                      <select
                        className="flex-1 rounded-xl px-4 py-3 bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-slate-700 appearance-none"
                        value={item.productId}
                        onChange={(e) =>
                          onUpdateItem(i, "productId", e.target.value)
                        }
                      >
                        <option value="">품목 선택</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <div className="relative w-28">
                        <input
                          type="number"
                          min="1"
                          placeholder="수량"
                          className="w-full rounded-xl px-4 py-3 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-100 text-sm font-bold text-right pr-10"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== "" && Number(val) < 1) return;
                            onUpdateItem(i, "quantity", val);
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">
                          QTY
                        </span>
                      </div>

                      {form.scenarioProductList.length > 1 && (
                        <button
                          onClick={() => onRemoveItem(i)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={onAddItem}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-slate-100 text-slate-400 text-xs font-bold hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all mt-2"
                >
                  + 품목 추가하기
                </button>
              </div>

              {/* 5. Action 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onAddScenario}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                >
                  시나리오 생성 완료
                </button>
                <button
                  onClick={onResetForm}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* LIST */}
          <div className="space-y-4">
            {scenarioData.map((s) => {
              const active = String(s.id) === String(selectedId);
              const cardStyle = active
                ? "bg-white border-blue-500 shadow-xl translate-x-2 ring-4 ring-blue-50"
                : s.isNew
                  ? "bg-white border-yellow-500 shadow-lg ring-4 ring-yellow-50"
                  : s.isCreated
                    ? "bg-white border-blue-400 shadow-lg ring-4 ring-blue-50"
                    : "bg-white border-transparent hover:border-slate-200 shadow-sm";

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectScenario(s.id)}
                  className={`group relative p-6 border-2 rounded-[28px] cursor-pointer transition-all duration-300 ${cardStyle}`}
                >
                  {/* 배지: New Copy */}
                  {s.isNew && !active && (
                    <span className="absolute -top-2.5 -right-1 bg-yellow-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg animate-bounce z-10">
                      New Copy
                    </span>
                  )}
                  {s.isCreated && !active && (
                    <span className="absolute -top-2.5 -right-1 bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg animate-bounce z-10">
                      New
                    </span>
                  )}

                  {active && (
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                  )}
                  {s.isNew && !active && (
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-10 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                  )}
                  {s.isCreated && !active && (
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-10 bg-blue-400 rounded-full" />
                  )}

                  <h3
                    className={`font-bold transition-colors ${s.isNew && !active ? "text-yellow-700" : "text-slate-800"}`}
                  >
                    {s.title}
                  </h3>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex gap-2 text-xs text-slate-500 items-center">
                      <Calendar size={12} />
                      {s.startAt?.slice(0, 10)}
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyScenario(s.id);
                        }}
                        className="text-slate-400 hover:text-blue-600"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScenario(s.id);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </section>
  );
}
