import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL;

// Deliberately NOT wrapped in useCallback — callers only ever invoke
// this immediately inside an effect, never store it as a dependency
// that would re-trigger that effect every render.
export function useApi() {
  const { getToken } = useAuth();

  return async function apiFetch(path, options = {}) {
    let token = null;
    try {
      token = await getToken();
    } catch {
      // No active session — proceed as an anonymous request.
    }

    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const error = new Error(data?.error || `Request failed with ${res.status}`);
      error.status = res.status; // so callers can branch on 403 vs other failures without string-matching messages
      throw error;
    }
    return data;
  };
}