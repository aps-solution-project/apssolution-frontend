import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "검색",
  width = "w-64",
}) {
  return (
    <div className={`relative ${width}`}>
      <Search
        className="
          absolute left-3 top-1/2 -translate-y-1/2
          h-4 w-4 text-slate-400
        "
      />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          pl-10 h-11
          rounded-lg
          bg-white
          border border-slate-300

          shadow-[0_1px_0_rgba(0,0,0,0.04)]

          focus:border-indigo-600
          focus:ring-2 focus:ring-indigo-600/30

          hover:border-slate-400
          transition-all duration-150

          text-sm font-medium
          placeholder:text-slate-400
        "
      />
    </div>
  );
}
