export default function ScenarioResult({
  result,
  status,
  tools = [],
  accounts = [],
}) {
  if (status !== "OPTIMAL") return null;
  if (!result?.scenarioSchedules) return null;

  const schedules = result.scenarioSchedules;

  const findTool = (id) => tools.find((t) => t.id === id)?.name || id;
  const findWorker = (id) => accounts.find((a) => a.id === id)?.name || id;

  return (
    <div>
      <h2>시뮬레이션 결과</h2>

      {schedules.map((s) => (
        <div key={s.id} style={{ borderBottom: "1px solid #ddd", padding: 8 }}>
          <strong>{findTool(s.toolId)}</strong> |{findWorker(s.workerId)} <br />
          {new Date(s.startAt).toLocaleTimeString()}
          {" → "}
          {new Date(s.endAt).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}
