async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, { headers: { "Content-Type": "application/json" }, ...options });
  } catch {
    throw new Error("Cannot reach the backend. Start it with npm start in the backend folder.");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  generate: (bugDescription, targetUrl) =>
    request("/generate", { method: "POST", body: JSON.stringify({ bugDescription, targetUrl, framework: "playwright" }) }),
  reports: () => request("/reports"),
  report: (id) => request(`/reports/${id}`),
  remove: (id) => request(`/reports/${id}`, { method: "DELETE" }),
  run: (id) => request(`/reports/${id}/run`, { method: "POST" }),
  regenerate: (id) => request(`/reports/${id}/regenerate`, { method: "POST" }),
  analytics: () => request("/analytics"),
  evaluation: () => request("/evaluation"),
  health: () => request("/health"),
};
