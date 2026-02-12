// src/components/common/Badge.jsx
import { cn } from "@/lib/utils";

export default function Badge({ show, className }) {
  if (!show) return null;

  return (
    // 1. 부모는 inline-flex로 텍스트 흐름을 방해하지 않게 설정
    <span className={cn("inline-flex h-3 w-3 items-center justify-center relative top-[-1px] ml-1", className)}>
      
      {/* 2. 확산 애니메이션 (이게 안 나오면 animate-ping 대신 animate-pulse를 써보세요) */}
      <span className="absolute h-1.5 w-1.5 rounded-full bg-red-500 opacity-75 animate-ping"></span>
      
      {/* 3. 실제 중심점 (크기를 1.5로 줄여서 훨씬 세련되게) */}
      <span className="relative h-1.5 w-1.5 rounded-full bg-red-600 shadow-sm"></span>
      
    </span>
  );
}