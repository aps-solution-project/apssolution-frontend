import { useState } from "react";
import { Bot, Loader2, Sparkles, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// --- 생략 (기존 컴포넌트 코드 위) ---

export function AIReportFloatingButton({ scenarioId, products, feedback }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const togglePopover = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) feedback;
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={togglePopover} // 🌟 클릭 시 토글
            className="relative group cursor-pointer outline-none"
          >
            {/* 핑 애니메이션 - 창이 닫혀있을 때만 표시하면 더 깔끔함 */}
            {!isOpen && (
              <span className="absolute inset-0 rounded-full bg-indigo-500/40 animate-ping" />
            )}

            {/* 2. 메인 로봇 버튼 */}
            <div
              className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 ${
                isOpen
                  ? "bg-slate-800 rotate-90 scale-90"
                  : "bg-indigo-600 hover:scale-110"
              }`}
            >
              {isOpen ? <X size={32} /> : <Bot size={32} />}
            </div>

            {/* 3. 돌아온 반짝이 배지 🌟 */}
            <div
              className={`absolute -top-1 -right-1 p-2 rounded-full shadow-lg transition-all duration-500 ${
                isOpen
                  ? "bg-indigo-400 scale-125 rotate-[15deg]"
                  : "bg-amber-400 group-hover:rotate-[20deg]"
              }`}
            >
              <Sparkles
                size={14}
                className={
                  isOpen
                    ? "text-white fill-white"
                    : "text-amber-900 fill-amber-900"
                }
              />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="left"
          align="end"
          sideOffset={20}
          // 🌟 바깥쪽 클릭이나 포커스 이탈로 닫히는 걸 방지
          onInteractOutside={(e) => e.preventDefault()}
          className="w-96 p-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden mb-4"
        >
          <div className="bg-slate-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-indigo-400" />
              <span className="font-bold text-sm tracking-tight">
                AI 분석 대시보드
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </Button>
          </div>

          <div className="p-0 bg-slate-50/50 max-h-[500px] overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-sm font-bold text-slate-400">
                  시뮬레이션 데이터를 분석 중...
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* 🌟 데이터를 문단별로 쪼개서 렌더링 */}
                {feedback.split(/(?=\d\.\s)/).map((section, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors"
                  >
                    {/* 섹션 제목과 내용을 분리하여 스타일링 */}
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {section.trim()}
                    </div>
                  </div>
                ))}

                {/* 하단 여백용 */}
                <div className="h-2" />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
