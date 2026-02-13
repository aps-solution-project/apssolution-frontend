import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getShiftType } from "@/lib/date";
import { useEffect, useMemo, useState } from "react";

export default function AddEventDialog({
  defaultDateKey,
  onAdd,
  trigger,
  editEvent,
}) {
  const [open, setOpen] = useState(false);

  const init = useMemo(
    () => ({
      title: "",
      date: defaultDateKey || "",
      startTime: "07:00",
      endTime: "22:00",
      location: "",
      color: "blue",
      shift: "day",
      description: "",
    }),
    [defaultDateKey],
  );

  const [form, setForm] = useState(init);

  // 수정 모드: editEvent가 있으면 폼에 채움
  useEffect(() => {
    if (editEvent && open) {
      setForm({
        title: editEvent.title || "",
        date: editEvent.date || defaultDateKey || "",
        startTime: editEvent.startTime || "10:00",
        endTime: editEvent.endTime || "11:00",
        location: editEvent.location || "",
        color: editEvent.color || "blue",
        shift: editEvent.shift || "day",
        description: editEvent.description || "",
      });
    }
  }, [editEvent, open, defaultDateKey]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // 시작 시간 변경 시 shift 자동 감지 및 색상 자동 설정
  useEffect(() => {
    const detectedShift = getShiftType(form.startTime);
    if (detectedShift) {
      setForm((p) => ({
        ...p,
        shift: detectedShift,
        color:
          detectedShift === "night"
            ? "night"
            : p.color === "night"
              ? "blue"
              : p.color,
      }));
    }
  }, [form.startTime]);

  const submit = async () => {
    if (!form.title.trim()) return;

    const eventData = {
      title: form.title.trim(),
      date: form.date || defaultDateKey,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location.trim(),
      color: form.color,
      shift: form.shift,
      description: form.description.trim(),
      todos: editEvent?.todos || [],
    };

    // 수정 모드면 id 포함
    if (editEvent?.id != null) {
      eventData.id = editEvent.id;
    }

    await onAdd(eventData);

    setOpen(false);
    setForm(init);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Add</Button>}</DialogTrigger>

      <DialogContent className="sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold">
            {editEvent ? "Edit event" : "Add event"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label className="text-slate-600 font-semibold text-xs">
              Title
            </Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Event title"
              className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-slate-600 font-semibold text-xs">
                Date (YYYY-MM-DD)
              </Label>
              <Input
                value={defaultDateKey || form.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="2026-02-10"
                className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-600 font-semibold text-xs">
                Color
              </Label>
              <Select value={form.color} onValueChange={(v) => set("color", v)}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="sky"> Sky</SelectItem>
                  <SelectItem value="violet">Violet</SelectItem>
                  <SelectItem value="pink"> Pink</SelectItem>
                  <SelectItem value="rose"> Rose</SelectItem>
                  <SelectItem value="amber"> Amber</SelectItem>
                  <SelectItem value="teal">Teal</SelectItem>
                  <SelectItem value="night"> Night (Blue)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label className="text-slate-600 font-semibold text-xs">
                Start
              </Label>
              <Input
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                placeholder="10:00"
                className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-600 font-semibold text-xs">
                End
              </Label>
              <Input
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                placeholder="11:00"
                className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-600 font-semibold text-xs">
                Shift
              </Label>
              <Select
                value={form.shift}
                onValueChange={(v) => {
                  // 1. Shift 상태 업데이트
                  set("shift", v);

                  // 2. Shift 선택에 따른 시작/종료 시간 자동 설정
                  if (v === "day") {
                    set("startTime", "07:00");
                    set("endTime", "19:00");
                  } else if (v === "night") {
                    set("startTime", "21:00");
                    set("endTime", "07:00"); // 익일 종료
                  }
                }}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="근무 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">☀ Day (07:00~)</SelectItem>
                  <SelectItem value="night">☾ Night (21:00~)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Shift indicator */}
          <div
            className={[
              "rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2",
              form.shift === "night"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-amber-50 text-amber-700 border border-amber-200",
            ].join(" ")}
          >
            {form.shift === "night" ? "☾" : "☀"}
            {form.shift === "night"
              ? "Night shift detected (21:00 ~ 06:59)"
              : "Day shift detected (07:00 ~ 20:59)"}
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-600 font-semibold text-xs">
              Location
            </Label>
            <Input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Where?"
              className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-600 font-semibold text-xs">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="일정 설명..."
              className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200"
            >
              {editEvent ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
