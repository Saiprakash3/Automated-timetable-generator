import { useSyncExternalStore } from "react";
import type { GeneratedTimetable, TimetableEntry } from "@/types";

/**
 * The one combined department-wide timetable (see GeneratedTimetable's
 * comment in types/timetable.ts). `null` until the first generation runs —
 * that's what drives the "No timetable yet" state, same as StatusPill's
 * "none" variant. Same useSyncExternalStore pattern as every other setup
 * hook; no persistence layer, resets on a full page reload.
 */
let timetable: GeneratedTimetable | null = null;

/**
 * PATTERNS.md §8.3 — past drafts HOD has already reviewed and rejected,
 * kept around "for comparison while working" and as an audit trail until
 * Admin explicitly deletes them. The live `timetable` above is never in
 * this list — only superseded versions land here.
 */
let archivedDrafts: GeneratedTimetable[] = [];

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

/**
 * Handles both the first-ever Generate and every Regenerate click.
 * §8.2's draft count only bumps on a genuine post-rejection regenerate —
 * detected by the live timetable still carrying a `changesRequestedReason`
 * (set by `requestTimetableChanges` below, and never present on a freshly
 * generated object) — not on repeated iteration before HOD has ever seen
 * a draft, which stays Draft 1.
 */
export function setGeneratedTimetable(result: Omit<GeneratedTimetable, "draftNumber">) {
  if (!timetable) {
    timetable = { ...result, draftNumber: 1 };
  } else if (timetable.changesRequestedReason) {
    archivedDrafts = [...archivedDrafts, timetable];
    timetable = { ...result, draftNumber: timetable.draftNumber + 1 };
  } else {
    timetable = { ...result, draftNumber: timetable.draftNumber };
  }
  notify();
}

/**
 * §8.3 — only archived (already-superseded) drafts can be deleted.
 * "Drafts are preserved as an audit trail during the active review cycle"
 * blocks this during Pending outright; Approved is also generally blocked
 * in the UI (standalone Manage Drafts is hidden then), EXCEPT the Publish
 * dialog's own bundled "clean up drafts" option, which deliberately calls
 * this same action from within Approved as part of finalizing — so only
 * Pending is guarded here, not Approved.
 */
export function deleteDraft(draftId: string) {
  if (timetable?.status === "pending") return;
  archivedDrafts = archivedDrafts.filter((d) => d.id !== draftId);
  notify();
}

export function useArchivedDrafts() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => archivedDrafts,
  );
}

/**
 * F-02 step 7 / INTERACTION_DECISIONS.md §11: confirming Send for Approval
 * IS the trigger — no external step, no round-trip. Moves Draft → Pending
 * HOD Approval and locks the timetable (Generate/Regenerate become
 * unavailable — enforced by the UI reading `status !== "draft"`, not a
 * separate lock flag, since status already carries that meaning).
 */
export function sendForApproval(note?: string) {
  if (!timetable) return;
  timetable = {
    ...timetable,
    status: "pending",
    note: note?.trim() || undefined,
    submittedAt: new Date().toISOString(),
  };
  notify();
}

/** F-04 step 6: HOD approves. Pending → Approved. */
export function approveTimetable(approvedBy: string) {
  if (!timetable) return;
  timetable = {
    ...timetable,
    status: "approved",
    approvedBy,
    approvedAt: new Date().toISOString(),
  };
  notify();
}

/**
 * F-04 step 4 / PATTERNS.md §6.2: HOD requests changes (labeled "Request
 * changes" throughout, not "Reject" — collaborative framing, same
 * underlying transition). Pending → Draft, reason stored so Admin's Draft
 * screen can show the Changes Requested Review Note (DOMAIN_COMPONENTS.md
 * §14) with HOD's exact text.
 */
export function requestTimetableChanges(reason: string, requestedBy: string) {
  if (!timetable) return;
  timetable = {
    ...timetable,
    status: "draft",
    changesRequestedReason: reason.trim(),
    changesRequestedBy: requestedBy,
    changesRequestedAt: new Date().toISOString(),
  };
  notify();
}

/**
 * F-05 step 3: Admin confirms Publish. Approved → Published, atomically
 * replacing "the currently published timetable" — trivial here since there's
 * only ever the one combined object, not a separate published-vs-draft copy.
 */
export function publishTimetable() {
  if (!timetable) return;
  timetable = {
    ...timetable,
    status: "published",
    publishedAt: new Date().toISOString(),
  };
  notify();
}

/**
 * F-03's Cell Edit Drawer: create-or-update one entry. Only meaningful while
 * Draft (PATTERNS.md §4.1 — the timetable locks the instant it's submitted
 * for approval), so the caller is expected to only reach this while
 * `status === "draft"`; guarded here too as a second line of defense.
 */
export function upsertTimetableEntry(entry: TimetableEntry) {
  if (!timetable || timetable.status !== "draft") return;
  const idx = timetable.entries.findIndex((e) => e.id === entry.id);
  const entries =
    idx === -1 ? [...timetable.entries, entry] : timetable.entries.map((e, i) => (i === idx ? entry : e));
  timetable = { ...timetable, entries };
  notify();
}

/** Clears a cell back to Free. */
export function deleteTimetableEntry(entryId: string) {
  if (!timetable || timetable.status !== "draft") return;
  timetable = { ...timetable, entries: timetable.entries.filter((e) => e.id !== entryId) };
  notify();
}

export function useTimetableData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => timetable,
  );
}
