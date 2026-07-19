/**
 * PROJECT_BRIEF.md "Lecture types" table — three types, each with different
 * scheduling rules (regular: 1 period, any section; lab: 2-3 consecutive
 * periods, needs a second person + lab room; elective: cross-section,
 * basket-assigned, 3rd/4th year only). Those scheduling rules live in the
 * generator/constraint layer, not here — this is just the setup record shape.
 *
 * Field set is the exact one from the verified Figma build (Claude design
 * review V1.md's "Add Single Record `204:6063`" note): name, code, credits,
 * type, default faculty. No separate "duration" field — lab period-length is
 * a scheduling constant tied to type, not a per-subject input.
 */
export type SubjectType = "regular" | "lab" | "elective";

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  type: SubjectType;
  /** References a Faculty.id from useFacultyData — "Select (Default faculty)" in the build. */
  defaultFacultyId: string;
}
