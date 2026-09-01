import type { AuthResponse } from './types';

// The backend authenticates with a server-side session cookie and never
// exposes a "who am I" endpoint, so the browser has no way to ask the
// server for the current seller on page load. Instead we cache the profile
// returned by /api/auth/login in localStorage purely for display (name in
// the sidebar, etc). It is NOT the source of truth for whether the session
// is valid — any dashboard request that comes back 401/403 means the real
// session has expired or was never there, and every dashboard page should
// clear this and bounce to /login when that happens, the same way the
// Sept 1 handoff's "stale cookie" gotcha describes.
const STORAGE_KEY = 'cloud-ims:seller';

export function getStoredSeller(): AuthResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function setStoredSeller(seller: AuthResponse) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seller));
}

export function clearStoredSeller() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isAuthError(status: number) {
  return status === 401 || status === 403;
}
