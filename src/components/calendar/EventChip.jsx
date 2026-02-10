import { Badge } from "@/components/ui/badge";

const tone = {
  pink: "bg-pink-100 text-pink-700 hover:bg-pink-100 border-pink-200",
  rose: "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200",
  amber: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
  violet: "bg-violet-100 text-violet-700 hover:bg-violet-100 border-violet-200",
  slate: "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200",
};

export default function EventChip({ event, onClick, rightSlot }) {
  const cls = tone[event.color] || tone.slate;
  const time = event.start && event.end ? `${event.start} - ${event.end}` : "";

  return (
    <button onClick={onClick} className="w-full text-left">
      <Badge
        className={[
          "w-full justify-start gap-2 rounded-md border px-2 py-1 text-[11px] font-medium",
          cls,
        ].join(" ")}
      >
        <span className="truncate">{event.title}</span>
        {time ? <span className="ml-auto opacity-80">{time}</span> : null}
        {rightSlot ? <span className="ml-2">{rightSlot}</span> : null}
      </Badge>
    </button>
  );
}
