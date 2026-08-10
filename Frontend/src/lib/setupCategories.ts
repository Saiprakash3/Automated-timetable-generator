import type { SetupCategoryState } from "@/components/domain/SetupChecklistRow";
import { useFacultyData, useFacultyLoading } from "@/hooks/useFacultyData";
import { useLabCoordinatorData, useLabCoordinatorsLoading } from "@/hooks/useLabCoordinatorData";
import { useSubjectData, useSubjectsLoading } from "@/hooks/useSubjectData";
import { useRoomData, useRoomsLoading } from "@/hooks/useRoomData";
import { useSectionData, useSectionsLoading } from "@/hooks/useSectionData";
import { useLabData, useLabsLoading } from "@/hooks/useLabData";
import { useSubjectFacultyMappingData, useMappingsLoading } from "@/hooks/useSubjectFacultyMappingData";
import { useElectiveBasketData, useElectiveBasketsLoading } from "@/hooks/useElectiveBasketData";

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

  // Each store fetches independently, so on first paint every list is []. Read
  // literally that meant "0 of 9 complete · No faculty added yet" on every page
  // load, snapping to the real state a moment later — indistinguishable from
  // having lost the data. A category is "loading", not "empty", until its own
  // fetch settles.
  const loading = {
    faculty: useFacultyLoading(),
    coordinators: useLabCoordinatorsLoading(),
    subjects: useSubjectsLoading(),
    rooms: useRoomsLoading(),
    sections: useSectionsLoading(),
    labs: useLabsLoading(),
    mappings: useMappingsLoading(),
    baskets: useElectiveBasketsLoading(),
  };

  const basketYears = new Set(baskets.map((b) => b.year));
  const basketsComplete = ELECTIVE_YEARS.every((y) => basketYears.has(y));

  /** Empty-but-still-fetching must not be reported as empty. */
  const stateOf = (isLoading: boolean, count: number): SetupCategoryState =>
    isLoading && count === 0 ? "loading" : count === 0 ? "empty" : "complete";
  const describe = (isLoading: boolean, count: number, empty: string, filled: string) =>
    isLoading && count === 0 ? "Loading…" : count === 0 ? empty : filled;

  return [
    {
      key: "faculty",
      name: "Faculty",
      path: "/setup/faculty",
      state: stateOf(loading.faculty, faculty.length),
      description: describe(loading.faculty, faculty.length, "No faculty added yet", `${faculty.length} faculty added`),
    },
    {
      key: "lab-coordinators",
      name: "Lab Coordinators",
      path: "/setup/lab-coordinators",
      state: stateOf(loading.coordinators, coordinators.length),
      description: describe(
        loading.coordinators,
        coordinators.length,
        "No coordinators added yet",
        `${coordinators.length} coordinators added`,
      ),
    },
    {
      key: "subjects",
      name: "Subjects",
      path: "/setup/subjects",
      state: stateOf(loading.subjects, subjects.length),
      description: describe(
        loading.subjects,
        subjects.length,
        "No subjects added yet",
        `${subjects.length} subjects added`,
      ),
    },
    {
      key: "rooms",
      name: "Rooms",
      path: "/setup/rooms",
      state: stateOf(loading.rooms, rooms.length),
      description: describe(loading.rooms, rooms.length, "No rooms added yet", `${rooms.length} rooms added`),
    },
    {
      key: "sections",
      name: "Sections",
      path: "/setup/sections",
      state: stateOf(loading.sections, sections.length),
      description: describe(
        loading.sections,
        sections.length,
        "No sections added yet",
        `${sections.length} sections added`,
      ),
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
      state: stateOf(loading.labs, labs.length),
      description: describe(loading.labs, labs.length, "No labs added yet", `${labs.length} labs added`),
    },
    {
      key: "subject-faculty-mapping",
      name: "Subject–Faculty Mapping",
      path: "/setup/subject-faculty-mapping",
      state: stateOf(loading.mappings, mappings.length),
      description: describe(
        loading.mappings,
        mappings.length,
        "No mappings configured yet",
        `${mappings.length} mappings added`,
      ),
    },
    {
      key: "elective-baskets",
      name: "Elective Baskets",
      path: "/setup/elective-baskets",
      state: loading.baskets && baskets.length === 0
        ? "loading"
        : baskets.length === 0
          ? "empty"
          : basketsComplete
            ? "complete"
            : "partial",
      description:
        loading.baskets && baskets.length === 0
          ? "Loading…"
          : baskets.length === 0
            ? "No baskets configured yet"
            : `${basketYears.size} of ${ELECTIVE_YEARS.length} years configured`,
      hint: baskets.length === 0 || basketsComplete ? undefined : "Click to continue",
    },
  ];
}

export function getSetupSummary(categories: SetupCategory[]) {
  const completed = categories.filter((c) => c.state === "complete").length;
  // While any category is still fetching, "N of 9 complete" is a claim we
  // can't yet support — and "Generate" is gated on it, so a premature count
  // would disable the button for a fully-configured install.
  const loading = categories.some((c) => c.state === "loading");
  const nextIncomplete = categories.find(
    (c) => c.state !== "complete" && c.state !== "blocked" && c.state !== "loading",
  );
  return { completed, total: categories.length, nextIncomplete, loading };
}
