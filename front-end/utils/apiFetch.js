/**
 * Shared fetch wrapper that returns structured errors:
 * - Network/connection failure   → "Network error. Check your connection."
 * - 5xx server errors            → "Server error. Please try again later."
 * - 4xx user/validation errors   → actual data.message from backend
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/e-2market/v1";

const apiFetch = async (url, options = {}) => {
  // Replace any hardcoded localhost URLs with env-configured base
  if (typeof url === "string" && url.includes("http://localhost:8000/e-2market/v1")) {
    url = url.replace("http://localhost:8000/e-2market/v1", API_BASE);
  }
  try {
    const res = await fetch(url, options);

    let data = {};
    try {
      data = await res.json();
    } catch {
      if (res.status >= 500) {
        return { ok: false, message: "Server error. Please try again later." };
      }
      return { ok: false, message: "Unexpected response from server." };
    }

    if (!res.ok) {
      if (res.status >= 500) {
        return { ok: false, message: "Server error. Please try again later." };
      }
      return { ok: false, message: data.message || "Something went wrong." };
    }

    return { ok: true, data: data.data !== undefined ? data.data : data };
  } catch (err) {
    return { ok: false, message: "Network error. Please check your connection." };
  }
};

export default apiFetch;
export { API_BASE };
