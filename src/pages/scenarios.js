export default function ScenariosPage() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div className="h-20 rounded bg-white shadow">시나리오 목록</div>
      ))}
    </div>
  );
}
