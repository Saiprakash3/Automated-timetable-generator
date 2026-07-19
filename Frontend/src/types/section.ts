/**
 * A year+letter cohort (e.g. "3rd Year — B") that timetables are generated
 * against — `TimetableMeta.year`/`.section` (types/timetable.ts) reference
 * this by year+name, not by this record's id (no such endpoint/join exists
 * in API_CONTRACT.md yet). `studentCount` is captured because
 * INTERACTION_DECISIONS.md's conflict #7 ("Lab capacity exceeded by
 * section/batch size") checks a section's size against a lab's capacity —
 * the field this project's single Lab capacity check actually needs.
 * No department field: PROJECT_BRIEF.md scopes this whole system to one
 * department (CSE at MVGR), same reasoning as Room/Lab omitting it.
 */
export interface Section {
  id: string;
  year: number;
  name: string;
  studentCount: number;
}
