/**
 * Setup-side Faculty record — distinct from the auth `User` type. Per
 * USER_FLOWS.md F-01/F-07 backend requirements:
 * - NO per-person load-limit fields — those are college-wide constants.
 * - DOES need `canServeAsLabCoordinator` (~30% of faculty double as coordinators).
 *
 * No setup-data endpoints exist in Backend/API_CONTRACT.md yet ("Bulk Import
 * Stepper, Setup Wizard... not yet in scope"). This whole domain is
 * placeholder-data-driven for now, same as lib/setupCategories.ts.
 *
 * No `sectionsCount` field: that used to be a hardcoded number here, but
 * now that Subject–Faculty Mapping is built (useSubjectFacultyMappingData.ts),
 * it's a live join (distinct sectionIds per facultyId) computed in
 * Faculty.tsx instead of duplicated, stale, stored data.
 */
export interface Faculty {
  id: string;
  name: string;
  department: string;
  canServeAsLabCoordinator: boolean;
}
