import type { TimetableEntry, Room, Lab } from "@/types";

export type ConflictSeverity = "blocking" | "warning";

export interface Conflict {
  severity: ConflictSeverity;
  /** Matches DOMAIN_COMPONENTS.md §9's "name the severity in the message" rule. */
  message: string;
}

interface CheckInput {
  /** The entry being edited, in its candidate (not-yet-saved) form. */
  candidate: Pick<TimetableEntry, "id" | "day" | "periodStart" | "periodEnd" | "facultyId" | "facultyName" | "room">;
  /** Every other entry currently on the timetable (candidate's own prior version excluded by the caller). */
  allEntries: TimetableEntry[];
  /** So a room-capacity Warning can be computed — the section this cell serves. */
  sectionStudentCount?: number;
  rooms: Room[];
  labs: Lab[];
}

function periodsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart <= bEnd && bStart <= aEnd;
}

/**
 * Real checks against the conflict taxonomy (INTERACTION_DECISIONS.md §1.2),
 * not a fabricated list — only what's genuinely derivable from the entries
 * already on the timetable and Setup's own Room/Lab capacity data:
 * - #1 Faculty double-booking — Blocking
 * - #4 Room double-booking — Blocking (a "room" here also covers lab rooms,
 *   since both draw from the same shared physical-space pool)
 * - #7 Lab/room capacity exceeded by section size — Warning
 */
export function checkEntryConflicts({ candidate, allEntries, sectionStudentCount, rooms, labs }: CheckInput): Conflict[] {
  const conflicts: Conflict[] = [];
  const others = allEntries.filter((e) => e.id !== candidate.id);

  for (const other of others) {
    if (other.day !== candidate.day) continue;
    if (!periodsOverlap(candidate.periodStart, candidate.periodEnd, other.periodStart, other.periodEnd)) continue;

    if (candidate.facultyId && other.facultyId === candidate.facultyId) {
      conflicts.push({
        severity: "blocking",
        message: `Cannot save: ${candidate.facultyName ?? "this faculty"} is already teaching ${other.subject} (${other.section}) at this time`,
      });
    }
    if (candidate.room && other.room === candidate.room) {
      conflicts.push({
        severity: "blocking",
        message: `Cannot save: ${candidate.room} is already booked for ${other.subject} (${other.section}) at this time`,
      });
    }
  }

  if (sectionStudentCount != null && candidate.room) {
    const capacity =
      rooms.find((r) => r.number === candidate.room)?.capacity ?? labs.find((l) => l.room === candidate.room)?.capacity;
    if (capacity != null && capacity < sectionStudentCount) {
      conflicts.push({
        severity: "warning",
        message: `Warning: ${candidate.room}'s capacity (${capacity}) is below this section's size (${sectionStudentCount})`,
      });
    }
  }

  return conflicts;
}
