import { Badge } from "@/components/ui/badge";

const tone = {
  blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
  sky: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200",
  pink: "bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200",
  rose: "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200",
  amber: "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200",
  violet: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200",
  teal: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200",
  slate: "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200",
  /* shift 전용 */
  day: "bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-300",
  night: "bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-300",
};

export default function EventChip({ event, onClick, rightSlot }) {
  const cls = tone[event.color] || tone.blue;
  const time = event.start && event.end ? `${event.start} - ${event.end}` : "";

  return (
    <button onClick={onClick} className="w-full text-left">
      <Badge
        className={[
          "w-full justify-start gap-2 rounded-md border px-2 py-1 text-[11px] font-medium",
          "transition-colors duration-150",
          cls,
        ].join(" ")}
      >
        <span className="truncate">{event.title}</span>
        {time ? (
          <span className="ml-auto opacity-70 text-[10px] shrink-0">
            {time}
          </span>
        ) : null}
        {rightSlot ? <span className="ml-2">{rightSlot}</span> : null}
      </Badge>
    </button>
  );
}
