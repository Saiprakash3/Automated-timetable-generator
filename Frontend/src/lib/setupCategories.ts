import type { SetupCategoryState } from "@/components/domain/SetupChecklistRow";
import { useFacultyData } from "@/hooks/useFacultyData";
import { useLabCoordinatorData } from "@/hooks/useLabCoordinatorData";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useRoomData } from "@/hooks/useRoomData";
import { useSectionData } from "@/hooks/useSectionData";
import { useLabData } from "@/hooks/useLabData";
import { useSubjectFacultyMappingData } from "@/hooks/useSubjectFacultyMappingData";
import { useElectiveBasketData } from "@/hooks/useElectiveBasketData";

export interface SetupCategory {
  key: string;
  name: string;
  path: string;
  state: SetupCategoryState;
  /** Description when actionable, or the dependency reason when blocked. */
  description: string;
  hint?: string;
}

const ELECTIVE_YEARS = [3, 4];

/**
 * Live-derived from the 8 real setup data hooks, now that all 9 setup
 * category pages are built — no setup-progress endpoint exists in
 * Backend/API_CONTRACT.md ("Bulk Import Stepper, Setup Wizard... not yet in
 * scope"), but unlike the earlier placeholder version of this function,
 * there's real client-side data to read instead of hand-maintained
 * hardcoded counts. This is the "replace with a real fetch once that
 * endpoint exists" swap this function's docstring used to promise — except
 * the replacement is live hooks, not a fetch, since that's what actually
 * exists. Kept as a hook (not a plain function) because it must call other
 * hooks; every call site (SetupOverview, AdminShell's sidebar) is a
 * component, so this is fine.
 *
 * A category is "complete" once it has any records — none of the 8 define
 * a real target count to check against (Faculty/Subjects/Rooms/Sections/
 * Labs/Lab Coordinators/Subject–Faculty Mapping all just need *some* data,
 * not an exact quota). Time Slot Grid has no hook and no empty state — it's
 * a fixed constant (INTERACTION_DECISIONS.md §8.1), always complete.
 * Elective Baskets is the one genuine exception: PROJECT_BRIEF.md scopes
 * electives to 3rd and 4th year only, so "complete" here means a basket
 * exists for both years, not just one — this is the only category where a
 * real, well-defined target exists to check against.
 */
export function useSetupCategories(): SetupCategory[] {
  const faculty = useFacultyData();
  const coordinators = useLabCoordinatorData();
  const subjects = useSubjectData();
  const rooms = useRoomData();
  const sections = useSectionData();
  const labs = useLabData();
  const mappings = useSubjectFacultyMappingData();
  const baskets = useElectiveBasketData();

  const basketYears = new Set(baskets.map((b) => b.year));
  const basketsComplete = ELECTIVE_YEARS.every((y) => basketYears.has(y));

  return [
    {
      key: "faculty",
      name: "Faculty",
      path: "/setup/faculty",
      state: faculty.length === 0 ? "empty" : "complete",
      description: faculty.length === 0 ? "No faculty added yet" : `${faculty.length} faculty added`,
    },
    {
      key: "lab-coordinators",
      name: "Lab Coordinators",
      path: "/setup/lab-coordinators",
      state: coordinators.length === 0 ? "empty" : "complete",
      description:
        coordinators.length === 0 ? "No coordinators added yet" : `${coordinators.length} coordinators added`,
    },
    {
      key: "subjects",
      name: "Subjects",
      path: "/setup/subjects",
      state: subjects.length === 0 ? "empty" : "complete",
      description: subjects.length === 0 ? "No subjects added yet" : `${subjects.length} subjects added`,
    },
    {
      key: "rooms",
      name: "Rooms",
      path: "/setup/rooms",
      state: rooms.length === 0 ? "empty" : "complete",
      description: rooms.length === 0 ? "No rooms added yet" : `${rooms.length} rooms added`,
    },
    {
      key: "sections",
      name: "Sections",
      path: "/setup/sections",
      state: sections.length === 0 ? "empty" : "complete",
      description: sections.length === 0 ? "No sections added yet" : `${sections.length} sections added`,
    },
    {
      key: "time-slots",
      name: "Time Slot Grid",
      path: "/setup/time-slots",
      state: "complete",
      description: "Configured · 6 periods/day",
    },
    {
      key: "labs",
      name: "Labs",
      path: "/setup/labs",
      state: labs.length === 0 ? "empty" : "complete",
      description: labs.length === 0 ? "No labs added yet" : `${labs.length} labs added`,
    },
    {
      key: "subject-faculty-mapping",
      name: "Subject–Faculty Mapping",
      path: "/setup/subject-faculty-mapping",
      state: mappings.length === 0 ? "empty" : "complete",
      description: mappings.length === 0 ? "No mappings configured yet" : `${mappings.length} mappings added`,
    },
    {
      key: "elective-baskets",
      name: "Elective Baskets",
      path: "/setup/elective-baskets",
      state: baskets.length === 0 ? "empty" : basketsComplete ? "complete" : "partial",
      description:
        baskets.length === 0
          ? "No baskets configured yet"
          : `${basketYears.size} of ${ELECTIVE_YEARS.length} years configured`,
      hint: baskets.length === 0 || basketsComplete ? undefined : "Click to continue",
    },
  ];
}

export function getSetupSummary(categories: SetupCategory[]) {
  const completed = categories.filter((c) => c.state === "complete").length;
  const nextIncomplete = categories.find((c) => c.state !== "complete" && c.state !== "blocked");
  return { completed, total: categories.length, nextIncomplete };
}
