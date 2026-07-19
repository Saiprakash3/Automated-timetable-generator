/**
 * The dedicated Lab Coordinator pool — F-07's "primary pool" for the lab
 * session's second-person picker, distinct from Faculty's own
 * `canServeAsLabCoordinator` flag (a Faculty member acting as coordinator).
 * `labIds` (Lab.id references) is the reciprocal of Subjects' Default
 * Faculty join: `Claude design review V1.md`'s Lab Coordinator screen
 * grounds "Mr. K. Rao ... coordinates Networks Lab + DS Lab" as a real
 * setup-time fact, not a per-timetable-entry one, so it's captured here.
 * No per-person "max days/week" field — that's a college-wide constant
 * (INTERACTION_DECISIONS.md §8), same reasoning as Faculty's omitted
 * load-limit fields.
 */
export interface LabCoordinator {
  id: string;
  name: string;
  department: string;
  labIds: string[];
}
