import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

import { Clock, MapPin, Bell, Users, X, Sparkles } from "lucide-react";

export default function RightPanel({ event, onClose, onToggleTodo }) {
  if (!event) {
    return (
      <div className="text-sm text-muted-foreground">
        Select an event from the calendar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-violet-100 via-pink-100 to-rose-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-700" />
                <div className="font-semibold truncate">{event.title}</div>
              </div>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {event.start && event.end ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {event.start} - {event.end}
                    </span>
                    {event.reminder ? (
                      <Badge variant="secondary" className="ml-2 rounded-full">
                        {event.reminder}
                      </Badge>
                    ) : null}
                  </div>
                ) : null}

                {event.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Reminder</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-white/60"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </div>
            <span className="text-xs">—</span>
          </div>

          <Separator />

          {/* 버튼은 2열 고정 정렬 */}
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-10 rounded-xl w-full">Reschedule</Button>
            <Button variant="secondary" className="h-10 rounded-xl w-full">
              Finish
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Todo Card */}
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">To Do List</div>
            <button
              className="rounded-full p-2 hover:bg-muted"
              aria-label="Add todo"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>

          <div className="mt-3">
            <ScrollArea className="h-[320px] pr-3">
              <div className="space-y-3">
                {(event.todos || []).map((t) => (
                  <label key={t.id} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={t.done}
                      onCheckedChange={() => onToggleTodo(t.id)}
                    />
                    <span
                      className={
                        t.done ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {t.text}
                    </span>
                  </label>
                ))}

                {!event.todos?.length ? (
                  <div className="text-sm text-muted-foreground">
                    할 일이 없어요.
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
