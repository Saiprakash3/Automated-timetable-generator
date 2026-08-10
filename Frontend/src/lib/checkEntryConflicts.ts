import type { TimetableEntry, Room, Lab, Faculty, ElectiveBasket, LabCoordinator } from "@/types";

/** Matches INTERACTION_DECISIONS.md §1.3's three tiers. `informational` was
 *  defined by the taxonomy from the start but had no implementation until the
 *  2026-08-01 pass — checks that surface a setup gap rather than an edit
 *  mistake had nowhere to land, so they simply weren't written. */
export type ConflictSeverity = "blocking" | "warning" | "informational";

export interface Conflict {
  severity: ConflictSeverity;
  /** Taxonomy id (INTERACTION_DECISIONS.md §1.2) — carried so a message can be
   *  traced back to the rule it enforces, and so the backend and frontend can
   *  be compared check-for-check. */
  code: number;
  /** Matches DOMAIN_COMPONENTS.md §9's "name the severity in the message" rule. */
  message: string;
  /**
   * Where the colliding entry lives, when there is one. The grid shows a
   * single section at a time, so a cross-section collision names an entry the
   * user cannot currently see — "Prof. Iyer is already teaching CSE-B" with no
   * way to reach CSE-B is the same dead end as a delete that only says no.
   * PATTERNS.md Pattern 9.3b: the exit from a block is a route onward.
   */
  conflictingEntry?: { id: string; section: string; day: string; periodStart: number };
}

interface CheckInput {
  /** The entry being edited, in its candidate (not-yet-saved) form. */
  candidate: Pick<TimetableEntry, "id" | "day" | "periodStart" | "periodEnd" | "facultyId" | "facultyName" | "room"> & {
    /** The section this cell serves — needed for #11. */
    section?: string;
    /** Second person on a lab session — needed for #14/#15. */
    labCoordinatorId?: string;
    /** Basket label when this is an elective entry — needed for #12/#13. */
    basket?: string;
    /** Subject id (not name) — needed for #18. */
    subjectId?: string;
    /** Entry type — needed for #6/#10, which only apply to labs. */
    type?: TimetableEntry["type"];
  };
  /**
   * Every entry on the timetable, across **all sections** — not just the one
   * on screen. Passing only the visible section would hide exactly the
   * collisions this exists to catch.
   */
  allEntries: TimetableEntry[];
  /** So a room-capacity Warning can be computed — the section this cell serves. */
  sectionStudentCount?: number;
  rooms: Room[];
  labs: Lab[];
  /** For #18 — the qualification list lives on the Faculty record. */
  faculty?: Faculty[];
  /** For #12/#13 — a basket's year, period and elective list. */
  baskets?: ElectiveBasket[];
  /** For #15 — the pool a lab's second person is drawn from. */
  coordinators?: LabCoordinator[];
}

/**
 * College-wide load limits. Mirrors the backend's config defaults
 * (`app/config.py`: faculty_max_periods_per_day / faculty_max_days_per_week)
 * because INTERACTION_DECISIONS.md §8 fixes them as constants rather than
 * per-person Setup fields. If they ever become configurable these must come
 * from the API instead of being duplicated here.
 */
const FACULTY_MAX_PERIODS_PER_DAY = 6;
const FACULTY_MAX_DAYS_PER_WEEK = 5;

/** Lab blocks may not cross the 12:00–1:00 lunch (§8.2 / conflict #10). */
const PRE_LUNCH = [1, 2, 3];
const POST_LUNCH = [4, 5, 6];

function periodsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart <= bEnd && bStart <= aEnd;
}

/** The sections an entry occupies: electives serve several at once. */
function sectionsOf(entry: Pick<TimetableEntry, "section" | "sections">): string[] {
  if (entry.sections && entry.sections.length > 0) return entry.sections;
  return entry.section ? [entry.section] : [];
}

/**
 * Checks against the conflict taxonomy (INTERACTION_DECISIONS.md §1.2).
 *
 * Implemented here — everything derivable from the entries already on the
 * timetable plus Setup's own data:
 *   #1  Faculty double-booking .................. Blocking
 *   #3  Faculty overload ........................ Warning
 *   #4  Room double-booking ..................... Blocking
 *   #5  Lab double-booking ...................... Blocking
 *   #6  Lab under maintenance ................... Blocking
 *   #7  Capacity exceeded ....................... Warning
 *   #10 Lab block invalid / straddles lunch ..... Blocking
 *   #11 Section double-booked ................... Blocking
 *   #12 Elective basket slot collision .......... Blocking
 *   #13 Elective content overlap across baskets . Informational
 *   #14 Second person double-booked ............. Blocking
 *   #15 No second person available .............. Informational
 *   #18 Faculty not qualified ................... Warning
 *
 * Deliberately NOT here, because the data to decide them does not exist:
 *   #2  Faculty marked unavailable — there is no availability model at all.
 *   #8  Lab unsuitable for subject — `equipment` is free text, so any match
 *       would be string-guessing dressed up as a rule.
 *   #9  Batch double-booking — `batch` is a free-text label, not an entity.
 *   #16/#17 HOD rules — the HOD is not a Faculty record, so they cannot be
 *       assigned to anything and the checks would be unreachable code.
 */
export function checkEntryConflicts({
  candidate,
  allEntries,
  sectionStudentCount,
  rooms,
  labs,
  faculty = [],
  baskets = [],
  coordinators = [],
}: CheckInput): Conflict[] {
  const conflicts: Conflict[] = [];
  const others = allEntries.filter((e) => e.id !== candidate.id);
  const candidateSections = sectionsOf({ section: candidate.section ?? "", sections: undefined });
  const isLab = candidate.type === "lab";

  const where = (e: TimetableEntry) => ({
    id: e.id,
    section: e.section,
    day: e.day,
    periodStart: e.periodStart,
  });

  for (const other of others) {
    if (other.day !== candidate.day) continue;
    if (!periodsOverlap(candidate.periodStart, candidate.periodEnd, other.periodStart, other.periodEnd)) continue;

    // #1 — Faculty double-booking
    if (candidate.facultyId && other.facultyId === candidate.facultyId) {
      conflicts.push({
        severity: "blocking",
        code: 1,
        message: `Cannot save: ${candidate.facultyName ?? "this faculty"} is already teaching ${other.subject} (${other.section}) at this time`,
        conflictingEntry: where(other),
      });
    }

    // #4 / #5 — Room and Lab double-booking. Same physical-space pool, but
    // reported under distinct codes so "the lab is taken" doesn't read as a
    // generic room clash.
    if (candidate.room && other.room === candidate.room) {
      const clashIsLab = isLab || other.type === "lab";
      conflicts.push({
        severity: "blocking",
        code: clashIsLab ? 5 : 4,
        message: `Cannot save: ${candidate.room} is already booked for ${other.subject} (${other.section}) at this time`,
        conflictingEntry: where(other),
      });
    }

    // #14 — Second person double-booked. The coordinator can collide with
    // another lab's coordinator OR with someone teaching a class, since a
    // person cannot be in two rooms whichever hat they are wearing.
    if (candidate.labCoordinatorId) {
      const clashes =
        other.labCoordinatorId === candidate.labCoordinatorId || other.facultyId === candidate.labCoordinatorId;
      if (clashes) {
        const name =
          coordinators.find((c) => c.id === candidate.labCoordinatorId)?.name ??
          faculty.find((f) => f.id === candidate.labCoordinatorId)?.name ??
          "This second person";
        conflicts.push({
          severity: "blocking",
          code: 14,
          message: `Cannot save: ${name} is already assigned to ${other.subject} (${other.section}) at this time`,
          conflictingEntry: where(other),
        });
      }
    }

    // #11 — Section double-booked. An elective serves several sections at
    // once, so this compares section *sets*, not single labels — the whole
    // point is a basket colliding with a contributing section's regular class.
    const otherSections = sectionsOf(other);
    const shared = candidateSections.filter((s) => otherSections.includes(s));
    if (shared.length > 0) {
      // A same-section clash the user can already see in the cell they are
      // editing isn't worth a second message when faculty/room already fired.
      const alreadyReported = conflicts.some((c) => c.conflictingEntry?.id === other.id);
      if (!alreadyReported) {
        conflicts.push({
          severity: "blocking",
          code: 11,
          message: `Cannot save: ${shared.join(", ")} already has ${other.subject} at this time`,
          conflictingEntry: where(other),
        });
      }
    }

    // #12 — Two elective baskets for the same year in the same period
    if (candidate.basket && other.basket && other.basket !== candidate.basket) {
      const a = baskets.find((b) => b.name === candidate.basket);
      const b = baskets.find((x) => x.name === other.basket);
      if (a && b && a.year === b.year) {
        conflicts.push({
          severity: "blocking",
          code: 12,
          message: `Cannot save: ${other.basket} already occupies this period for year ${b.year}`,
          conflictingEntry: where(other),
        });
      }
    }
  }

  // --- Lab-specific structural rules ------------------------------------

  if (isLab && candidate.room) {
    // #6 — Lab under maintenance. `available` is a real Setup field, so this
    // is a hard fact rather than an inference.
    const lab = labs.find((l) => l.room === candidate.room || l.name === candidate.room);
    if (lab && lab.available === false) {
      conflicts.push({
        severity: "blocking",
        code: 6,
        message: `Cannot save: ${lab.name} is marked unavailable in Setup`,
      });
    }
  }

  if (isLab) {
    // #10 — A lab is two consecutive periods inside one half-day. Enforced by
    // the generator at placement time, but a *manual* edit could still produce
    // a single-period lab or one straddling lunch, which is the case this
    // catches.
    const span = candidate.periodEnd - candidate.periodStart + 1;
    const withinOneHalf =
      PRE_LUNCH.includes(candidate.periodStart) && PRE_LUNCH.includes(candidate.periodEnd)
        ? true
        : POST_LUNCH.includes(candidate.periodStart) && POST_LUNCH.includes(candidate.periodEnd);
    if (span !== 2) {
      conflicts.push({
        severity: "blocking",
        code: 10,
        message: `Cannot save: a lab runs for two consecutive periods (this one is ${span})`,
      });
    } else if (!withinOneHalf) {
      conflicts.push({
        severity: "blocking",
        code: 10,
        message: "Cannot save: a lab can't run across the lunch break",
      });
    }

    // #15 — No second person available. Informational: it reports a Setup
    // shortfall, not a mistake in this edit, so it never gates the save.
    if (!candidate.labCoordinatorId && coordinators.length > 0) {
      const busy = new Set(
        others
          .filter(
            (e) =>
              e.day === candidate.day &&
              periodsOverlap(candidate.periodStart, candidate.periodEnd, e.periodStart, e.periodEnd),
          )
          .flatMap((e) => [e.labCoordinatorId, e.facultyId].filter(Boolean) as string[]),
      );
      const anyFree = coordinators.some((c) => !busy.has(c.id));
      if (!anyFree) {
        conflicts.push({
          severity: "informational",
          code: 15,
          message: "No lab coordinator is free in this slot — this lab has no second person",
        });
      }
    }
  }

  // #7 — Capacity
  if (sectionStudentCount != null && candidate.room) {
    const capacity =
      rooms.find((r) => r.number === candidate.room)?.capacity ?? labs.find((l) => l.room === candidate.room)?.capacity;
    if (capacity != null && capacity < sectionStudentCount) {
      conflicts.push({
        severity: "warning",
        code: 7,
        message: `Warning: ${candidate.room}'s capacity (${capacity}) is below this section's size (${sectionStudentCount})`,
      });
    }
  }

  // #3 — Faculty overload. Counts this candidate alongside what's already
  // scheduled, so the limit is checked against the state the save would create.
  if (candidate.facultyId) {
    const theirs = others.filter((e) => e.facultyId === candidate.facultyId);
    const periodsToday =
      theirs
        .filter((e) => e.day === candidate.day)
        .reduce((sum, e) => sum + (e.periodEnd - e.periodStart + 1), 0) +
      (candidate.periodEnd - candidate.periodStart + 1);
    if (periodsToday > FACULTY_MAX_PERIODS_PER_DAY) {
      conflicts.push({
        severity: "warning",
        code: 3,
        message: `Warning: this puts ${candidate.facultyName ?? "this faculty"} at ${periodsToday} periods on ${candidate.day} (limit ${FACULTY_MAX_PERIODS_PER_DAY})`,
      });
    }
    const daysUsed = new Set(theirs.map((e) => e.day));
    daysUsed.add(candidate.day);
    if (daysUsed.size > FACULTY_MAX_DAYS_PER_WEEK) {
      conflicts.push({
        severity: "warning",
        code: 3,
        message: `Warning: this puts ${candidate.facultyName ?? "this faculty"} on ${daysUsed.size} teaching days (limit ${FACULTY_MAX_DAYS_PER_WEEK})`,
      });
    }
  }

  // #13 — The same elective subject appearing in more than one basket. A
  // business-rule overlap, not a physical clash, so it's Informational: shown,
  // never gated (§1.3).
  if (candidate.basket && candidate.subjectId) {
    const elsewhere = baskets.filter(
      (b) => b.name !== candidate.basket && b.electives.some((e) => e.subjectId === candidate.subjectId),
    );
    if (elsewhere.length > 0) {
      conflicts.push({
        severity: "informational",
        code: 13,
        message: `This subject also appears in ${elsewhere.map((b) => b.name).join(", ")}`,
      });
    }
  }

  // #18 — Faculty not qualified for this subject. An empty list is
  // "unrestricted", not "teaches nothing" (INTERACTION_DECISIONS.md §13) —
  // otherwise this would fire on every entry the day it shipped.
  if (candidate.facultyId && candidate.subjectId) {
    const person = faculty.find((f) => f.id === candidate.facultyId);
    const qualified = person?.canTeachSubjectIds ?? [];
    if (qualified.length > 0 && !qualified.includes(candidate.subjectId)) {
      conflicts.push({
        severity: "warning",
        code: 18,
        message: `Warning: ${person?.name ?? "This faculty member"} isn't listed as able to teach this subject`,
      });
    }
  }

  return conflicts;
}
