import { useSyncExternalStore } from "react";
import type { SubjectFacultyMapping } from "@/types";

/**
 * Same placeholder pattern as the other useXData hooks. Seeded so each
 * faculty's distinct-section count matches the numbers that used to be
 * hardcoded in useFacultyData.ts's now-removed `sectionsCount` field
 * (Sharma 3, Iyer 2, Nair 4, Gupta 2, Rao 3) — Faculty.tsx now derives that
 * count live from this data instead of storing it twice. Subject/faculty
 * pairings reuse each subject's own `defaultFacultyId` from useSubjectData.ts
 * rather than inventing different pairings, and a lecture's paired lab
 * (CS207/CS208, CS203/CS206) is taught by the same person in the same
 * section, as it would be in practice.
 */
let mappings: SubjectFacultyMapping[] = [
  { id: "M-01", subjectId: "S-CS201", sectionId: "SEC-1A", facultyId: "F-SHARMA" },
  { id: "M-02", subjectId: "S-CS201", sectionId: "SEC-1B", facultyId: "F-SHARMA" },
  { id: "M-03", subjectId: "S-CS201", sectionId: "SEC-2A", facultyId: "F-SHARMA" },

  { id: "M-04", subjectId: "S-CS202", sectionId: "SEC-3A", facultyId: "F-IYER" },
  { id: "M-05", subjectId: "S-CS212", sectionId: "SEC-3A", facultyId: "F-IYER" },
  { id: "M-06", subjectId: "S-CS210", sectionId: "SEC-3B", facultyId: "F-IYER" },

  { id: "M-07", subjectId: "S-CS207", sectionId: "SEC-1A", facultyId: "F-NAIR" },
  { id: "M-08", subjectId: "S-CS208", sectionId: "SEC-1A", facultyId: "F-NAIR" },
  { id: "M-09", subjectId: "S-CS207", sectionId: "SEC-1B", facultyId: "F-NAIR" },
  { id: "M-10", subjectId: "S-CS208", sectionId: "SEC-1B", facultyId: "F-NAIR" },
  { id: "M-11", subjectId: "S-CS207", sectionId: "SEC-2A", facultyId: "F-NAIR" },
  { id: "M-12", subjectId: "S-CS207", sectionId: "SEC-4A", facultyId: "F-NAIR" },

  { id: "M-13", subjectId: "S-CS203", sectionId: "SEC-3A", facultyId: "F-GUPTA" },
  { id: "M-14", subjectId: "S-CS206", sectionId: "SEC-3A", facultyId: "F-GUPTA" },
  { id: "M-15", subjectId: "S-CS203", sectionId: "SEC-4A", facultyId: "F-GUPTA" },

  { id: "M-16", subjectId: "S-CS204", sectionId: "SEC-1B", facultyId: "F-RAO" },
  { id: "M-17", subjectId: "S-CS211", sectionId: "SEC-2A", facultyId: "F-RAO" },
  { id: "M-18", subjectId: "S-CS204", sectionId: "SEC-3B", facultyId: "F-RAO" },
];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function addMapping(record: Omit<SubjectFacultyMapping, "id">) {
  const newRecord: SubjectFacultyMapping = { ...record, id: `M-${Date.now()}` };
  mappings = [...mappings, newRecord];
  notify();
  return newRecord;
}

export function useSubjectFacultyMappingData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => mappings,
  );
}
