import { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getShiftType } from "@/lib/date";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function AddEventDialog({ defaultDateKey, onAdd, trigger }) {
  const [open, setOpen] = useState(false);

  const init = useMemo(
    () => ({
      title: "",
      date: defaultDateKey || "",
      start: "10:00",
      end: "11:00",
      location: "",
      color: "blue",
      shift: "day",
      todosText: "",
      participantsText: "",
    }),
    [defaultDateKey],
  );

  const [form, setForm] = useState(init);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // 시작 시간 변경 시 shift 자동 감지 및 색상 자동 설정
  useEffect(() => {
    const detectedShift = getShiftType(form.start);
    if (detectedShift) {
      setForm((p) => ({
        ...p,
        shift: detectedShift,
        color: detectedShift === "night" ? "night" : p.color === "night" ? "blue" : p.color,
      }));
    }
  }, [form.start]);

  const submit = () => {
    if (!form.title.trim()) return;

    const todos = form.todosText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text) => ({ id: uid(), text, done: false }));

    const participants = form.participantsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onAdd({
      id: uid(),
      title: form.title.trim(),
      date: form.date || defaultDateKey,
      start: form.start,
      end: form.end,
      location: form.location.trim(),
      color: form.color,
      shift: form.shift,
      reminder: "2hr",
      participants,
      todos,
    });

    setOpen(false);
    setForm(init);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Add</Button>}</DialogTrigger>

      <DialogContent className="sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-800 font-bold">
            Add event
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
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="2026-02-10"
                className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-600 font-semibold text-xs">
                Color
              </Label>
              <Select
                value={form.color}
                onValueChange={(v) => set("color", v)}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">🔵 Blue</SelectItem>
                  <SelectItem value="sky">🩵 Sky</SelectItem>
                  <SelectItem value="violet">🟣 Violet</SelectItem>
                  <SelectItem value="pink">🩷 Pink</SelectItem>
                  <SelectItem value="rose">🌹 Rose</SelectItem>
                  <SelectItem value="amber">🟡 Amber</SelectItem>
                  <SelectItem value="teal">🩶 Teal</SelectItem>
                  <SelectItem value="night">🌙 Night (Blue)</SelectItem>
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
                value={form.start}
                onChange={(e) => set("start", e.target.value)}
                placeholder="10:00"
                className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-600 font-semibold text-xs">
                End
              </Label>
              <Input
                value={form.end}
                onChange={(e) => set("end", e.target.value)}
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
                onValueChange={(v) => set("shift", v)}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue />
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
              Participants (comma separated)
            </Label>
            <Input
              value={form.participantsText}
              onChange={(e) => set("participantsText", e.target.value)}
              placeholder="Alex, Jordan, Sam"
              className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-600 font-semibold text-xs">
              Todos (one per line)
            </Label>
            <Textarea
              value={form.todosText}
              onChange={(e) => set("todosText", e.target.value)}
              rows={3}
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
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
