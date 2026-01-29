import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

export default function TaskColumnFilter({
  label,
  options,
  selected,
  onChange,
}) {
  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="
            flex gap-1 text-xs font-semibold px-2 py-1
            rounded-lg
            hover:bg-slate-100
            transition
          "
        >
          {label}
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="
          w-60
          p-2
          max-h-72
          overflow-auto
          rounded-xl
          border border-slate-200
          shadow-lg
          bg-white
        "
      >
        {options.map((opt) => {
          const active = selected.includes(opt);

          return (
            <div
              key={opt}
              onClick={() => toggle(opt)}
              className={`
                flex items-start gap-3 px-3 py-2 rounded-lg cursor-pointer
                transition
                ${
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "hover:bg-slate-100"
                }
              `}
            >
              <Checkbox checked={active} className="mt-1" />

              <span className="text-sm break-all whitespace-normal leading-snug">
                {opt}
              </span>
            </div>
          );
        })}

        {options.length === 0 && (
          <div className="py-4 text-sm text-center text-slate-400">
            데이터 없음
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
