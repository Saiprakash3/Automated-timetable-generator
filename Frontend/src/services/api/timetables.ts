import { api } from "./client";
import type { Timetable, TimetableMeta, MyTimetable, TimetableEntry } from "@/types";

export interface TimetableListParams {
  department?: string;
  year?: number;
  section?: string;
  state?: string;
}

function toQuery<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params) as [string, unknown][]) {
    if (value !== undefined) search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

interface SendForApprovalResponse {
  id: string;
  state: string;
  note: string | null;
  submittedBy: string;
  submittedAt: string;
}
interface ApproveResponse {
  id: string;
  state: string;
  approvedBy: string;
  approvedAt: string;
}
interface RequestChangesResponse {
  id: string;
  state: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
}
interface PublishResponse {
  id: string;
  state: string;
  publishedBy: string;
  publishedAt: string;
}

export const timetablesApi = {
  list: (params: TimetableListParams = {}) => api.get<{ timetables: TimetableMeta[] }>(`/timetables${toQuery(params)}`),
  get: (id: string) => api.get<Timetable>(`/timetables/${id}`),
  /** Resolved read-only schedule for the logged-in user (Faculty/Student/Lab Coordinator/HOD-on-mobile). */
  me: () => api.get<MyTimetable>("/timetables/me"),
  /** Admin only. Creates a new draft timetable, entries: []. */
  create: (body: { department: string; year: number; section: string }) => api.post<Timetable>("/timetables", body),
  /**
   * Admin only. Does NOT auto-check conflicts — call conflictsApi.check separately
   * before/after edits, per the safe-editing pattern (PS-02).
   */
  patch: (id: string, body: { entries: Partial<TimetableEntry>[] }) => api.patch<Timetable>(`/timetables/${id}`, body),
  /** Admin only. No email is sent — submitting in-app is the whole action (INTERACTION_DECISIONS.md §11). */
  sendForApproval: (id: string, body: { note?: string } = {}) =>
    api.post<SendForApprovalResponse>(`/timetables/${id}/send-for-approval`, body),
  /** HOD only. Does not publish — approval and publish are separate steps. */
  approve: (id: string) => api.post<ApproveResponse>(`/timetables/${id}/approve`),
  /** HOD only — the renamed "Reject" (PATTERNS.md: UI label is "Request changes"). Reason required. */
  requestChanges: (id: string, body: { reason: string }) =>
    api.post<RequestChangesResponse>(`/timetables/${id}/request-changes`, body),
  /** Admin only, and only valid when state is "approved". */
  publish: (id: string) => api.post<PublishResponse>(`/timetables/${id}/publish`),
};
