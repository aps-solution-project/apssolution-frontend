import { useMemo, useState } from "react";
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
      color: "violet",
      todosText: "",
    }),
    [defaultDateKey],
  );

  const [form, setForm] = useState(init);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.title.trim()) return;

    const todos = form.todosText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text) => ({ id: uid(), text, done: false }));

    onAdd({
      id: uid(),
      title: form.title.trim(),
      date: form.date || defaultDateKey,
      start: form.start,
      end: form.end,
      location: form.location.trim(),
      color: form.color,
      reminder: "2hr",
      participants: [],
      todos,
    });

    setOpen(false);
    setForm(init);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Add</Button>}</DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add event</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Event title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Date (YYYY-MM-DD)</Label>
              <Input
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="2026-02-10"
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <Select value={form.color} onValueChange={(v) => set("color", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="violet">violet</SelectItem>
                  <SelectItem value="pink">pink</SelectItem>
                  <SelectItem value="rose">rose</SelectItem>
                  <SelectItem value="amber">amber</SelectItem>
                  <SelectItem value="slate">slate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Start</Label>
              <Input
                value={form.start}
                onChange={(e) => set("start", e.target.value)}
                placeholder="10:00"
              />
            </div>
            <div className="grid gap-2">
              <Label>End</Label>
              <Input
                value={form.end}
                onChange={(e) => set("end", e.target.value)}
                placeholder="11:00"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Where?"
            />
          </div>

          <div className="grid gap-2">
            <Label>Todos (one per line)</Label>
            <Textarea
              value={form.todosText}
              onChange={(e) => set("todosText", e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
