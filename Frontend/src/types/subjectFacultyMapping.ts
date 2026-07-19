/**
 * The actual per-section teaching assignment the generator needs — distinct
 * from Subjects' `defaultFacultyId` (a suggested default, not a binding
 * assignment). One row = "this Faculty teaches this Subject for this
 * Section." Faculty.tsx's "Sections" column is derived by counting distinct
 * `sectionId`s per `facultyId` here, not stored on the Faculty record.
 * Electives are intentionally out of scope for this screen — PROJECT_BRIEF.md
 * describes them as cross-section, basket-assigned (3rd/4th year only),
 * which is Elective Baskets' job, not a per-section mapping.
 */
export interface SubjectFacultyMapping {
  id: string;
  subjectId: string;
  sectionId: string;
  facultyId: string;
}
