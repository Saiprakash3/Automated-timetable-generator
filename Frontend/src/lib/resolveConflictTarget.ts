import type { TimetableEntry, Section } from "@/types";

export interface ConflictTarget {
  id: string;
  section: string;
  day: string;
  periodStart: number;
}

/**
 * Work out which section the grid must switch to in order to show the entry a
 * conflict names.
 *
 * The non-obvious case is electives. An elective entry's `section` is its
 * *basket* label ("Basket A"), which matches no section in the picker — so
 * matching on `section` alone would silently fail on exactly the cross-section
 * collision this navigation exists for. The contributing `sections` are the
 * fallback.
 *
 * Extracted from the page so this can be tested directly: a "View" link that
 * quietly does nothing is worse than no link, and that failure is invisible to
 * the type checker.
 */
export function resolveConflictTarget(
  target: ConflictTarget,
  entries: TimetableEntry[],
  sections: Section[],
): { section: Section; entry: TimetableEntry | null } | null {
  const entry = entries.find((e) => e.id === target.id) ?? null;
  const candidateLabels = [target.section, ...(entry?.sections ?? [])];
  const section = sections.find((s) => candidateLabels.includes(`${s.year}${s.name}`));
  return section ? { section, entry } : null;
}
