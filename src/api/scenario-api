const serverAddr = "http://192.168.0.17:8080";

async function postScenario(token, data) {
  const resp = await fetch(`${serverAddr}/api/scenarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error("시나리오 등록에 실패했습니다.");
  }
  return resp.json();
}

async function getScenarios(token) {
  const resp = await fetch(`${serverAddr}/api/scenarios`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("시나리오 조회에 실패했습니다.");
  }
  return resp.json();
}

async function getScenario(token, scenarioId) {
  const resp = await fetch(`${serverAddr}/api/scenarios/${scenarioId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("시나리오 조회에 실패했습니다.");
  }
  return resp.json();
}

async function getScenarioResult(token, scenarioId) {
  const resp = await fetch(`${serverAddr}/api/scenarios/${scenarioId}/result`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("시나리오 결과 조회에 실패했습니다.");
  }
  return resp.json();
}

async function deleteScenario(token, scenarioId) {
  const resp = await fetch(`${serverAddr}/api/scenarios/${scenarioId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("시나리오 삭제에 실패했습니다.");
  }
}

async function editScenario(token, scenarioId, data) {
  const resp = await fetch(`${serverAddr}/api/scenarios/${scenarioId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    throw new Error("시나리오 수정에 실패했습니다.");
  }
  return resp.json();
}

async function copyScenario(token, scenarioId) {
  const resp = await fetch(`${serverAddr}/api/scenarios/${scenarioId}/clone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("시나리오 복사에 실패했습니다.");
  }
  return resp.json();
}

async function publishScenario(token, scenarioId) {
  const resp = await fetch(
    `${serverAddr}/api/scenarios/${scenarioId}/publish`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("시나리오 배포에 실패했습니다.");
  }
  return resp.json();
}

async function unpublishScenario(token, scenarioId) {
  const resp = await fetch(
    `${serverAddr}/api/scenarios/${scenarioId}/unpublish`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("시나리오 배포 해제에 실패했습니다.");
  }
  return resp.json();
}

async function editScenarioSchedule(token, scenarioScheduleId, data) {
  const resp = await fetch(
    `${serverAddr}/api/scenarios/schedules/${scenarioScheduleId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );
  if (!resp.ok) {
    throw new Error("시나리오 일정 수정에 실패했습니다.");
  }
  return resp.json();
}

async function simulateScenario(token, scenarioId) {
  const resp = await fetch(
    `${serverAddr}/api/scenarios/${scenarioId}/simulate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("시나리오 시뮬레이션에 실패했습니다.");
  }
  return resp.json();
}

export {
  copyScenario,
  deleteScenario,
  editScenario,
  editScenarioSchedule,
  getScenario,
  getScenarioResult,
  getScenarios,
  postScenario,
  publishScenario,
  simulateScenario,
  unpublishScenario,
};
