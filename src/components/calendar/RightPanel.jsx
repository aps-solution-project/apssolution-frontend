import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import {
  Clock,
  MapPin,
  Bell,
  Users,
  X,
  Sparkles,
  CalendarDays,
  Plus,
  Sun,
  Moon,
} from "lucide-react";
import { formatDateLabel } from "@/lib/date";

/* ── avatar colors ── */
const avatarColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-sky-500",
];

function ParticipantAvatar({ name, index = 0 }) {
  const bg = avatarColors[index % avatarColors.length];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      title={name}
      className={[
        "w-9 h-9",
        bg,
        "rounded-full flex items-center justify-center",
        "text-white font-bold text-xs",
        "border-2 border-white shadow-sm shrink-0",
      ].join(" ")}
    >
      {initials}
    </div>
  );
}

/* ── color badge map ── */
const colorBadge = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  sky: "bg-sky-100 text-sky-700 border-sky-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  day: "bg-amber-100 text-amber-700 border-amber-300",
  night: "bg-blue-100 text-blue-700 border-blue-300",
};

export default function RightPanel({ event, onClose, onToggleTodo }) {
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <CalendarDays className="h-10 w-10 text-slate-300" />
        <span className="text-sm">Select an event from the calendar</span>
      </div>
    );
  }

  const dateStr = formatDateLabel(event.date);
  const doneCount = (event.todos || []).filter((t) => t.done).length;
  const totalTodos = (event.todos || []).length;
  const progress = totalTodos > 0 ? (doneCount / totalTodos) * 100 : 0;
  const badgeCls = colorBadge[event.color] || colorBadge.blue;

  return (
    <div className="space-y-4">
      {/* ── Header Card ── */}
      <Card className="rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* tags */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={[
                    "inline-block px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide",
                    badgeCls,
                  ].join(" ")}
                >
                  {event.color}
                </span>
                {event.shift && (
                  <span
                    className={[
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase",
                      event.shift === "night"
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : "bg-amber-100 text-amber-700 border-amber-300",
                    ].join(" ")}
                  >
                    {event.shift === "night" ? (
                      <Moon className="h-3 w-3" />
                    ) : (
                      <Sun className="h-3 w-3" />
                    )}
                    {event.shift === "night" ? "Night" : "Day"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="font-bold text-slate-800 truncate text-lg">
                  {event.title}
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                {event.start && event.end ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="font-semibold">
                      {event.start} - {event.end}
                    </span>
                    {event.reminder ? (
                      <Badge
                        variant="secondary"
                        className="ml-1 rounded-full bg-blue-100 text-blue-600 border-blue-200 text-[10px] font-bold"
                      >
                        {event.reminder}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>{dateStr}</span>
                </div>

                {event.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Reminder</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-white/60 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <Separator className="bg-slate-100" />
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-10 rounded-xl w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 font-bold">
              Reschedule
            </Button>
            <Button
              variant="secondary"
              className="h-10 rounded-xl w-full border-slate-200 font-bold"
            >
              Finish
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Todo Card ── */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-bold text-sm text-slate-800">To Do List</div>
              {totalTodos > 0 && (
                <span className="text-[11px] text-slate-400 font-semibold">
                  {doneCount}/{totalTodos}
                </span>
              )}
            </div>
            <button
              className="rounded-lg p-1.5 hover:bg-blue-50 transition-colors border border-slate-200"
              aria-label="Add todo"
            >
              <Plus className="h-4 w-4 text-slate-500" />
            </button>
          </div>

          {totalTodos > 0 && (
            <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="mt-3">
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-2">
                {(event.todos || []).map((t) => (
                  <label
                    key={t.id}
                    className={[
                      "flex items-center gap-3 text-sm rounded-xl px-3 py-2.5 transition-colors cursor-pointer",
                      t.done
                        ? "bg-slate-50 border border-slate-100"
                        : "bg-white border border-blue-50 hover:bg-blue-50/50",
                    ].join(" ")}
                  >
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={() => onToggleTodo(t.id)}
                      className="border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <span
                      className={
                        t.done
                          ? "line-through text-slate-400"
                          : "text-slate-700 font-medium"
                      }
                    >
                      {t.text}
                    </span>
                  </label>
                ))}

                {!event.todos?.length ? (
                  <div className="text-sm text-slate-400 text-center py-6">
                    No todos yet
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* ── Participant Card ── */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-sm text-slate-800">
                Participant
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              {(event.participants || []).length} people
            </span>
          </div>

          {(event.participants || []).length > 0 ? (
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {event.participants.map((name, i) => (
                  <ParticipantAvatar key={name + i} name={name} index={i} />
                ))}
              </div>
              {event.participants.length > 5 && (
                <span className="ml-3 text-xs text-slate-400 font-semibold">
                  +{event.participants.length - 5} more
                </span>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-400">No participants</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
