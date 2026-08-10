import { getToken, logout } from "@/hooks/useSession";
import type { ApiErrorBody } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

/** One live reference blocking a delete (PATTERNS.md Pattern 9.3b). */
export interface Dependent {
  type: string;
  count: number;
  detail?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  /** Populated on 409 HAS_DEPENDENTS so the UI can list what's using a record. */
  dependents?: Dependent[];
  constructor(status: number, code: string, message: string, dependents?: Dependent[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.dependents = dependents;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  } catch {
    // fetch rejects (rather than resolving with !res.ok) when the request never
    // reached a server at all — API down, wrong port, DNS, offline. That used
    // to surface as a bare TypeError, which callers fell through to a generic
    // "Something went wrong. Please try again." — advice that can only fail
    // identically forever, and which reads as a credentials problem on the
    // Login screen. Normalising it to a typed ApiError lets every caller say
    // what is actually wrong.
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server.");
  }

  if (res.status === 401 && token) {
    // We HAD a session and the server just rejected it — mid-session expiry, not a
    // login-attempt failure (which never carries a token to begin with, so this
    // branch can't fire for a bad password/ROLE_MISMATCH on /auth/login).
    // Checklist §1: silent redirect + explanatory toast, not a scary error state.
    logout();
    window.location.assign("/login?reason=expired");
  }

  if (!res.ok) {
    // Two error shapes are live. API_CONTRACT.md documents `{error:{code,message}}`,
    // but FastAPI's HTTPException emits `{detail: ...}` — where detail is either a
    // plain string or, for our richer failures, an object. Only the first was
    // handled, so every real backend error collapsed to "Something went wrong",
    // discarding messages the server had gone to the trouble of writing.
    const body = (await res.json().catch(() => null)) as
      | (ApiErrorBody & { detail?: string | { code?: string; message?: string; dependents?: Dependent[] } })
      | null;

    const detail = body?.detail;
    if (detail && typeof detail === "object") {
      throw new ApiError(
        res.status,
        detail.code ?? "UNKNOWN_ERROR",
        detail.message ?? "Something went wrong.",
        detail.dependents,
      );
    }
    if (typeof detail === "string") {
      throw new ApiError(res.status, "UNKNOWN_ERROR", detail);
    }
    throw new ApiError(res.status, body?.error?.code ?? "UNKNOWN_ERROR", body?.error?.message ?? "Something went wrong.");
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
