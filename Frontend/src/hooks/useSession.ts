import { useSyncExternalStore } from "react";
import type { User } from "@/types";

/**
 * Session state without Context, Zustand, or Redux — FRONTEND_DOCUMENTATION_CHECKLIST.md's
 * "plain React hooks only" decision, taken literally. A module-level store notifies
 * subscribers on change; useSyncExternalStore (a React built-in) is the only thing
 * outside plain useState this relies on. See Frontend/FRONTEND_STRUCTURE.md §2.
 *
 * Storage: sessionStorage, not localStorage (no "remember me" — checklist §1) and not
 * pure in-memory (an accidental refresh shouldn't silently log someone out mid Setup
 * wizard or mid Bulk Import).
 */

interface Session {
  user: User | null;
  token: string | null;
}

const STORAGE_KEY = "session";
const EMPTY_SESSION: Session = { user: null, token: null };

function readStoredSession(): Session {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : EMPTY_SESSION;
  } catch {
    return EMPTY_SESSION;
  }
}

let session: Session = readStoredSession();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function login(user: User, token: string) {
  session = { user, token };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  notify();
}

/** Also called by the API client on a 401 from an authenticated request (session expired). */
export function logout() {
  session = EMPTY_SESSION;
  sessionStorage.removeItem(STORAGE_KEY);
  notify();
}

/** Non-reactive read for use outside components (e.g. services/api/client.ts, which can't call hooks). */
export function getToken() {
  return session.token;
}

export function useSession() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => session,
  );
}
