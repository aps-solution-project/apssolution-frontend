import { useToken } from "@/stores/account-store";

const server = "http://192.168.0.20:8080";

async function request(url, options = {}) {
  const token = useToken.getState().token;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resp = await fetch(`${server}${url}`, {
    ...options,
    headers,
  });

  if (!resp.ok) {
    if (resp.status === 401) {
      console.warn("Unauthorized");
    }
    throw new Error(`API Error ${resp.status}`);
  }

  return resp.json();
}

/* ===== API functions ===== */

export const fetcher = {
  getProducts: () => request("/api/products"),
  getTasks: () => request("/api/tasks"),
  getAllTools: () => request("/api/tools"),
  getAllAccounts: () => request("/api/accounts"),

  postScenario: (data) =>
    request("/api/scenarios", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  simulateScenario: (id) =>
    request(`/api/scenarios/${id}/simulate`, { method: "POST" }),

  getScenarioResult: (id) => request(`/api/scenarios/${id}/result`),
};
