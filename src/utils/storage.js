/**
 * Thin wrappers around localStorage for auth session persistence.
 * The stored object shape: { user: {...}, token: string }
 */

const AUTH_KEY = 'lmt_auth';

/**
 * Retrieve the stored auth session.
 * @returns {{ user: object, token: string } | null}
 */
export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persist the auth session.
 * @param {{ user: object, token: string }} authData
 */
export function setStoredAuth(authData) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/**
 * Clear the auth session (logout).
 */
export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY);
}
