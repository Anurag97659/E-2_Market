/**
 * Shared fetch wrapper that returns structured errors:
 * - Network/connection failure   → "Network error. Check your connection."
 * - 5xx server errors            → "Server error. Please try again later."
 * - 4xx user/validation errors   → actual data.message from backend
 */
const apiFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);

    let data = {};
    try {
      data = await res.json();
    } catch {
      // response body wasn't JSON (e.g., HTML error page from proxy)
      if (res.status >= 500) {
        return { ok: false, message: "Server error. Please try again later." };
      }
      return { ok: false, message: "Unexpected response from server." };
    }

    if (!res.ok) {
      if (res.status >= 500) {
        return { ok: false, message: "Server error. Please try again later." };
      }
      // 4xx – return the actual backend message
      return { ok: false, message: data.message || "Something went wrong." };
    }

    return { ok: true, data: data.data !== undefined ? data.data : data };
  } catch (err) {
    // fetch() itself threw – no network, DNS failure, CORS preflight blocked, etc.
    return { ok: false, message: "Network error. Please check your connection." };
  }
};

export default apiFetch;
