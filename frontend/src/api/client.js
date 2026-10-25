const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    // Network failure, CORS rejection, or timeout — fetch gives no useful detail here
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Surface backend validation errors (array) or a plain message
    const message =
      data.errors?.[0]?.message || data.message || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data;
}

export const submitFeedback = ({ name, email, comment }) =>
  request("/feedback", { method: "POST", body: { name, email, comment } });

export const getFeedback = () => request("/feedback");
