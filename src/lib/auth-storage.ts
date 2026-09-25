import type { UserRole } from "@/lib/roles";

const TOKEN_KEY = "paskatema_admin_token";
const USER_KEY = "paskatema_admin_user";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  bio?: string | null;
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** Dipakai useSyncExternalStore; event "storage" menyinkronkan antar-tab. */
export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Mengembalikan string mentah (bukan objek hasil parse) supaya snapshot
 * useSyncExternalStore stabil antar-render — objek baru tiap panggilan akan
 * memicu render berulang tanpa henti.
 */
export function getStoredUserRaw(): string | null {
  try {
    return window.localStorage.getItem(USER_KEY);
  } catch {
    return null;
  }
}

export function parseUser(raw: string | null | undefined): AuthUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage tidak tersedia (mode privat, dsb.) — abaikan.
  }
  notify();
}

export function clearAuth(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // abaikan
  }
  notify();
}
