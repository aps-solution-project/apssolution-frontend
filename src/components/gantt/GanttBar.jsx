import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createContext, useContext, useState } from "react";

export const SimulationContext = createContext({ published: false });

export default function GanttBar({
  row,
  minuteWidth,
  rowHeight,
  scenarioStart,
  totalMinutes,
  dayOffset = 0,
  workers = [],
  tools = [],
  onBarSave,
  openPopoverKey,
  setOpenPopoverKey,
}) {
  const [localOpenBarId, setLocalOpenBarId] = useState(null);
  const { published } = useContext(SimulationContext);

  const isControlled =
    typeof openPopoverKey !== "undefined" && !!setOpenPopoverKey;
  const openId = isControlled ? openPopoverKey : localOpenBarId;
  const setOpenId = isControlled ? setOpenPopoverKey : setLocalOpenBarId;

  const [draftWorkerId, setDraftWorkerId] = useState("");
  const [draftToolId, setDraftToolId] = useState("");
  const [saving, setSaving] = useState(false);

  if (!row || row.type !== "task" || !Array.isArray(row.bars)) {
    return null;
  }

  const barHeight = 32;
  const top = row.row * rowHeight + (rowHeight - barHeight) / 2;

  // worker 목록 정규화: id/name 필드명이 다를 수 있으므로 여러 가지 대응
  const normalizedWorkers = workers
    .filter((w) => w.role === "WORKER")
    .map((w) => ({
      id: String(w?.id ?? w?.accountId ?? w?.workerId ?? ""),
      name: w?.name ?? w?.accountName ?? w?.workerName ?? "",
    }))
    .filter((w) => w.id !== "");

  const handleOpenPopover = (bar) => {
    if (published) return;
    setOpenId(bar.id);
    // 현재 값으로 초기화 (raw 데이터에서 가져옴)
    setDraftWorkerId(bar.raw?.worker?.id ? String(bar.raw.worker.id) : "");
    setDraftToolId(bar.raw?.toolId ? String(bar.raw.toolId) : "");
  };

  const handleSave = async (bar) => {
    if (!onBarSave) {
      setOpenId(null);
      return;
    }

    // 항상 두 필드 모두 전송 (서버가 null 허용 안 함)
    const payload = {};
    if (draftWorkerId) payload.workerId = draftWorkerId;
    if (draftToolId) payload.toolId = draftToolId;

    // 아무것도 없으면 닫기
    if (!payload.workerId && !payload.toolId) {
      setOpenId(null);
      return;
    }

    setSaving(true);
    try {
      await onBarSave(bar.id, payload);
      setOpenId(null);
    } catch (err) {
      alert("저장 실패: " + (err?.message || "알 수 없는 오류"));
    } finally {
      setSaving(false);
      setDraftWorkerId("");
      setDraftToolId("");
    }
  };

  return (
    <>
      {row.bars.map((bar) => {
        const taskStart = bar.start || 0;
        const taskDuration = bar.duration || 0;
        const taskEnd = taskStart + taskDuration;

        const dayStart = dayOffset;
        const dayEnd = dayOffset + totalMinutes;

        if (taskEnd <= dayStart || taskStart >= dayEnd) {
          return null;
        }

        const visibleStart = Math.max(taskStart, dayStart);
        const visibleEnd = Math.min(taskEnd, dayEnd);
        const visibleDuration = visibleEnd - visibleStart;

        const relativeStart = visibleStart - dayStart;

        const left = clamp(
          relativeStart * minuteWidth,
          0,
          totalMinutes * minuteWidth,
        );
        const width = Math.max(2, visibleDuration * minuteWidth);

        const { bg, text, border } = toolColor(
          bar.toolId ?? row.toolId,
          row.taskName,
        );

        const startLabel = formatFromScenario(scenarioStart, visibleStart);

        const continuesFromPrev = taskStart < dayStart;
        const continuesToNext = taskEnd > dayEnd;

        const showText = width >= 90;

        const displayWorkerName = bar.workerName || row.workerName || "미배정";
        const displayToolId = bar.toolId ?? row.toolId ?? "미지정";

        const barContent = (
          <div
            className="h-full w-full flex items-center overflow-hidden border"
            style={{
              backgroundColor: bg,
              borderColor: border,
              borderWidth: 1,
              borderRadius: continuesFromPrev
                ? continuesToNext
                  ? 0
                  : "0 6px 6px 0"
                : continuesToNext
                  ? "6px 0 0 6px"
                  : 6,
              borderLeftWidth: continuesFromPrev ? 0 : 1,
              borderRightWidth: continuesToNext ? 0 : 1,
            }}
          >
            <div
              style={{
                width: continuesFromPrev ? 0 : 8,
                height: "100%",
                backgroundColor: border,
                flexShrink: 0,
              }}
            />

            <div className="flex items-center gap-2 px-2 min-w-0">
              <span
                className={`text-[12px] font-mono font-semibold tracking-tight opacity-70 shrink-0 ${text}`}
              >
                {startLabel}
              </span>

              {showText ? (
                <span
                  className={`text-[12px] font-medium opacity-60 truncate ${text}`}
                >
                  {displayWorkerName}
                </span>
              ) : (
                <span
                  className={`text-[12px] font-medium opacity-60 truncate ${text}`}
                >
                  {row.workerName?.charAt(0)}
                </span>
              )}
            </div>

            {continuesToNext && (
              <div
                className="absolute right-0 top-0 bottom-0 w-1"
                style={{
                  background: `linear-gradient(to right, transparent, ${border})`,
                }}
              />
            )}
          </div>
        );

        return (
          <Popover
            key={bar.id}
            open={openId === bar.id}
            onOpenChange={(v) => {
              if (published) return;
              if (v) handleOpenPopover(bar);
              else if (!saving) setOpenId(null);
            }}
          >
            <PopoverTrigger asChild>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div
                    className={`absolute ${published ? "cursor-default" : "cursor-pointer"}`}
                    style={{ left, top, width, height: barHeight }}
                    title={undefined}
                    onPointerDown={(e) => e.stopPropagation()}
                    onContextMenu={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        className="h-full w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPopover(bar);
                        }}
                      >
                        {barContent}
                      </div>
                    </PopoverTrigger>
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-72">
                  <ContextMenuLabel className="text-[12px] font-semibold">
                    {row.productName || "품목 없음"}
                  </ContextMenuLabel>

                  <div className="px-2 pb-2">
                    <div className="text-[12px] text-slate-700">
                      {row.taskName || "공정 없음"}
                    </div>
                    <div className="mt-1 text-[12px] text-slate-600">
                      {displayWorkerName}{" "}
                      <span className="text-slate-400">|</span> {displayToolId}
                    </div>
                  </div>

                  <ContextMenuSeparator />
                </ContextMenuContent>
              </ContextMenu>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="bottom"
              className="w-72 p-3"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="text-sm font-semibold text-slate-800">
                작업 정보 변경
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {row.productName || ""} · {row.taskName || ""}
              </div>

              <div className="mt-3 space-y-3">
                {/* 작업자 Select */}
                {bar.raw.scheduleTask?.requiredWorkerCount > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-medium text-slate-600">
                      작업자
                      <span className="ml-1 text-slate-400 font-normal">
                        현재: {displayWorkerName}
                      </span>
                    </div>

                    {normalizedWorkers.length > 0 ? (
                      <Select
                        value={draftWorkerId}
                        onValueChange={setDraftWorkerId}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="작업자 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {normalizedWorkers.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name || w.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-[11px] text-red-500 py-2">
                        재직 사원 목록을 불러올 수 없습니다
                      </div>
                    )}
                  </div>
                )}

                {/* 도구 Select */}
                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-slate-600">
                    도구
                    <span className="ml-1 text-slate-400 font-normal">
                      현재: {displayToolId}
                    </span>
                  </div>
                  <Select value={draftToolId} onValueChange={setDraftToolId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="도구 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {tools
                        .filter((t) => t?.id != null && String(t.id) !== "")
                        .filter((t) => {
                          if (bar.raw.categoryId == null) return true;
                          return (
                            String(t.category?.id ?? "") ===
                            String(bar.raw.categoryId ?? "")
                          );
                        })
                        .map((t) => (
                          <SelectItem key={String(t.id)} value={String(t.id)}>
                            {t.name || String(t.id)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    onClick={() => setOpenId(null)}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    disabled={saving}
                    onClick={() => handleSave(bar)}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        저장 중
                      </>
                    ) : (
                      "저장"
                    )}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </>
  );
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function formatFromScenario(startAt, offsetMinutes) {
  if (!startAt) {
    return `${pad2(Math.floor(offsetMinutes / 60))}:${pad2(
      Math.floor(offsetMinutes % 60),
    )}`;
  }
  const d = new Date(startAt);
  const t = new Date(d.getTime() + offsetMinutes * 60000);
  return `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

const BASE = {
  NEUTRAL: { bg: "#ECFDF5", border: "#10B981", text: "text-emerald-900" },
  MIX: { bg: "#FFF1F2", border: "#FB7185", text: "text-yellow-900" },
  FORM: { bg: "#F5F3FF", border: "#A78BFA", text: "text-blue-900" },
  COOL: { bg: "#ECFEFF", border: "#22D3EE", text: "text-cyan-900" },
  HEAT: { bg: "#FFF7ED", border: "#FB923C", text: "text-rose-900" },
};

const TASK_TONE = {
  굽기: { bg: "#FFF7ED", border: "#F97316", text: "text-orange-900" },
  "스팀 굽기": { bg: "#FFEDD5", border: "#EA580C", text: "text-orange-900" },
  튀기기: { bg: "#FEF3C7", border: "#F59E0B", text: "text-amber-900" },
  "냉장 휴지": { bg: "#ECFEFF", border: "#06B6D4", text: "text-cyan-900" },
  "저온 휴지": { bg: "#E0F2FE", border: "#0EA5E9", text: "text-sky-900" },
  냉각: { bg: "#ECFEFF", border: "#22D3EE", text: "text-cyan-900" },
  "1차 냉각": { bg: "#ECFEFF", border: "#22D3EE", text: "text-cyan-900" },
  "최종 냉각": { bg: "#ECFEFF", border: "#06B6D4", text: "text-cyan-900" },
};

function categoryFromToolId(toolId = "") {
  const k = String(toolId).split("-")[1]?.toUpperCase();
  if (k === "MIX") return "MIX";
  if (k === "OVN" || k === "OVEN") return "HEAT";
  if (k === "FRY") return "HEAT";
  if (k === "DEP" || k === "TNK" || k === "PRF") return "FORM";
  return "NEUTRAL";
}

function toolColor(toolId = "", taskName = "") {
  if (TASK_TONE[taskName]) return TASK_TONE[taskName];
  const base = categoryFromToolId(toolId);
  return BASE[base] || BASE.NEUTRAL;
}
