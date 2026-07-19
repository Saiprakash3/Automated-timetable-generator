import type { Role } from "./user";

export type WorkflowState = "draft" | "pending" | "approved" | "rejected" | "published";
export type EntryType = "regular" | "lab" | "elective";

export interface TimetableEntry {
  id: string;
  day: string;
  periodStart: number;
  periodEnd: number;
  type: EntryType;
  subject: string;
  facultyId?: string;
  facultyName?: string;
  room: string;
  /**
   * Which section this entry serves — closes a documented gap
   * (`Claude design review V1.md` §3.12: "Section is still missing" from the
   * Cell Edit Drawer's field list). For elective entries (cross-section,
   * `basket` is set) this is the basket's label rather than a single section,
   * since a basket serves multiple contributing sections at once.
   */
  section: string;
  /** DOMAIN_COMPONENTS.md §10's "second person" — either a dedicated Lab
   *  Coordinator (LabCoordinator.id) or a Faculty member acting as one
   *  (Faculty.id, when `canServeAsLabCoordinator`). Lab entries only. */
  labCoordinatorId?: string;
  /**
   * Free-text batch identifier (e.g. "Batch 1") for a lab session split
   * across sub-groups of a section — no dedicated Batch entity/Setup
   * category exists, so this is descriptive metadata Admin types in, not a
   * managed record. Lab entries only.
   */
  batch?: string;
  /** Elective entries only. */
  basket?: string;
  applicableYears?: number[];
  /**
   * Elective entries only — every contributing section's label (e.g.
   * ["3A", "3B"]), not just the basket's year. A basket's `sectionIds`
   * aren't guaranteed to be every section in that year (F-06: Admin flags
   * which sections contribute), so filtering a per-section grid by
   * `applicableYears` alone would be wrong in general, even though it
   * happens to match in this project's current sample data.
   */
  sections?: string[];
}

/** Real counts from a generation run — no invented placeholder numbers. */
export interface GenerationSummary {
  totalNeeded: number;
  placed: number;
  gaps: number;
  adjustedByRepair: number;
}

/**
 * Client-only — the ONE combined department-wide timetable. PROJECT_BRIEF.md:
 * "Approval is granted once per whole timetable (not per section or basket)" —
 * confirmed 2026-07-18 as the model to build the Generate page around, over
 * Backend/API_CONTRACT.md's literal per-(department,year,section) `POST
 * /timetables` shape (its 3 sample records are demo/seed data for that
 * contract, not evidence the real product creates one timetable per section).
 * That contract stays untouched — `Timetable`/`TimetableMeta` above still
 * mirror it exactly for whenever a real backend is built against it. This
 * type is separate because no generation endpoint exists in the contract at
 * all ("Backend and timetable-generation logic are not complete" —
 * PROJECT_BRIEF.md) — generated and stored entirely client-side, same
 * placeholder-data pattern as every Setup category.
 */
export interface GeneratedTimetable {
  id: string;
  status: WorkflowState;
  generatedAt: string;
  entries: TimetableEntry[];
  summary: GenerationSummary;
  /**
   * PATTERNS.md §8.2 — which draft this is in the current cycle (1 = the
   * original; 2+ = a revision generated after HOD requested changes on the
   * previous one). Only bumps on a genuine post-rejection regenerate, not
   * every Regenerate click — iterating before HOD has ever seen it is still
   * Draft 1.
   */
  draftNumber: number;
  /** Optional note Admin leaves for HOD on Send for Approval — shown to HOD
   *  alongside the timetable (F-04 step 3, PATTERNS.md §6.1). */
  note?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  /** Set when HOD requests changes — drives the Changes Requested Review
   *  Note (DOMAIN_COMPONENTS.md §14) on Admin's Draft screen, showing HOD's
   *  exact reason text. */
  changesRequestedReason?: string;
  changesRequestedBy?: string;
  changesRequestedAt?: string;
  /** F-05 step 3: "A 'Published on [date/time]' label is added persistently." */
  publishedAt?: string;
}

/** Shape returned by GET /timetables (list view) — entries stripped. */
export interface TimetableMeta {
  id: string;
  department: string;
  year: number;
  section: string;
  state: WorkflowState;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  publishedAt: string | null;
}

/** Shape returned by GET /timetables/:id (full detail). */
export interface Timetable extends TimetableMeta {
  entries: TimetableEntry[];
}

/** Shape returned by GET /timetables/me — resolved read-only view for the logged-in user. */
export interface MyTimetable {
  role: Role;
  entries: TimetableEntry[];
}
