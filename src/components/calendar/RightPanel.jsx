import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Bell,
  X,
  Sparkles,
  CalendarDays,
  Sun,
  Moon,
  Trash2,
  Pencil,
  FileText,
} from "lucide-react";
import { formatDateLabel } from "@/lib/date";
import AddEventDialog from "./AddEventDialog";

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

export default function RightPanel({ event, onClose, onDelete, onUpdate }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <CalendarDays className="h-10 w-10 text-slate-300" />
        <span className="text-sm">Select an event from the calendar</span>
      </div>
    );
  }

  const dateStr = formatDateLabel(event.date);
  const badgeCls = colorBadge[event.color] || colorBadge.blue;

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete?.(event.id);
    setConfirmDelete(false);
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
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
                {event.startTime && event.endTime ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="font-semibold">
                      {event.startTime} - {event.endTime}
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

                {event.description ? (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="truncate">{event.description}</span>
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
            <AddEventDialog
              defaultDateKey={event.date}
              editEvent={event}
              onAdd={onUpdate}
              trigger={
                <Button className="h-10 rounded-xl w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200 font-bold">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              }
            />

            <Button
              variant={confirmDelete ? "destructive" : "secondary"}
              className={[
                "h-10 rounded-xl w-full font-bold",
                confirmDelete ? "" : "border-slate-200",
              ].join(" ")}
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {confirmDelete ? "Confirm Delete" : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="font-bold text-sm text-slate-800">
                Description
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">
              {event.description
                ? `${event.description.length} chars`
                : "empty"}
            </span>
          </div>

          {event.description ? (
            <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          ) : (
            <div className="text-sm text-slate-400 text-center py-6">
              No description
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
