/**
 * Smart resilient fetch helper for MedLens.
 * Tries the relative endpoint first (works with Vite dev proxy and direct backend hosting on :5000).
 * If the relative endpoint returns 404 or connection error (e.g. unproxied preview server or Live Server),
 * it seamlessly fails over to http://127.0.0.1:5000 directly.
 */
export async function apiFetch(path, options = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If already running directly on backend port 5000, keep relative
  if (typeof window !== "undefined" && window.location.port === "5000") {
    return fetch(cleanPath, options);
  }

  try {
    const res = await fetch(cleanPath, options);
    // If valid response (not a 404 from an unproxied static server), return it
    if (res.status !== 404) {
      return res;
    }
    console.warn(`[MedLens API] Relative fetch for ${cleanPath} returned 404. Failing over to direct backend on http://127.0.0.1:5000...`);
  } catch (err) {
    console.warn(`[MedLens API] Relative fetch network error for ${cleanPath}. Failing over to direct backend on http://127.0.0.1:5000...`, err);
  }

  // Direct backend fallback
  const fallbackUrl = `http://127.0.0.1:5000${cleanPath}`;
  return fetch(fallbackUrl, options);
}

export default apiFetch;
