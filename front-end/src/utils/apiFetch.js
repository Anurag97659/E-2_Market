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
    }
    catch {
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
