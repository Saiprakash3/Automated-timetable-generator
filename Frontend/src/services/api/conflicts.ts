import { api } from "./client";
import type { ConflictCheckResult, TimetableEntry } from "@/types";

export const conflictsApi = {
  /**
   * Runs the full conflict taxonomy against a proposed timetable state
   * (existing + pending edits). Call before/after any manual edit — the
   * PATCH /timetables/:id endpoint does not check conflicts itself.
   */
  check: (timetableId: string, proposedEntries: Partial<TimetableEntry>[]) =>
    api.post<ConflictCheckResult>("/conflicts/check", { timetableId, proposedEntries }),
};
