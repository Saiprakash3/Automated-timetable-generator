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
  // --- Section 1A (Year 1 - A) ---
  { id: "M-01", subjectId: "S-CS201", sectionId: "SEC-1A", facultyId: "F-SHARMA" }, // Data Structures (4)
  { id: "M-02", subjectId: "S-CS202", sectionId: "SEC-1A", facultyId: "F-IYER" },   // Operating Systems (4)
  { id: "M-03", subjectId: "S-CS207", sectionId: "SEC-1A", facultyId: "F-NAIR" },   // Networks (3)
  { id: "M-04", subjectId: "S-CS203", sectionId: "SEC-1A", facultyId: "F-GUPTA" },  // DBMS (4)
  { id: "M-05", subjectId: "S-CS205", sectionId: "SEC-1A", facultyId: "F-SHARMA" }, // DS Lab
  { id: "M-06", subjectId: "S-CS208", sectionId: "SEC-1A", facultyId: "F-NAIR" },   // Networks Lab

  // --- Section 1B (Year 1 - B) ---
  { id: "M-07", subjectId: "S-CS201", sectionId: "SEC-1B", facultyId: "F-SHARMA" },
  { id: "M-08", subjectId: "S-CS204", sectionId: "SEC-1B", facultyId: "F-RAO" },
  { id: "M-09", subjectId: "S-CS207", sectionId: "SEC-1B", facultyId: "F-NAIR" },
  { id: "M-10", subjectId: "S-CS202", sectionId: "SEC-1B", facultyId: "F-IYER" },
  { id: "M-11", subjectId: "S-CS208", sectionId: "SEC-1B", facultyId: "F-NAIR" },
  { id: "M-12", subjectId: "S-CS206", sectionId: "SEC-1B", facultyId: "F-GUPTA" },

  // --- Section 2A (Year 2 - A) ---
  { id: "M-13", subjectId: "S-CS201", sectionId: "SEC-2A", facultyId: "F-SHARMA" },
  { id: "M-14", subjectId: "S-CS207", sectionId: "SEC-2A", facultyId: "F-NAIR" },
  { id: "M-15", subjectId: "S-CS211", sectionId: "SEC-2A", facultyId: "F-RAO" },
  { id: "M-16", subjectId: "S-CS203", sectionId: "SEC-2A", facultyId: "F-GUPTA" },
  { id: "M-17", subjectId: "S-CS206", sectionId: "SEC-2A", facultyId: "F-GUPTA" },
  { id: "M-18", subjectId: "S-CS205", sectionId: "SEC-2A", facultyId: "F-SHARMA" },

  // --- Section 3A (Year 3 - A) ---
  { id: "M-19", subjectId: "S-CS202", sectionId: "SEC-3A", facultyId: "F-IYER" },
  { id: "M-20", subjectId: "S-CS212", sectionId: "SEC-3A", facultyId: "F-IYER" },
  { id: "M-21", subjectId: "S-CS203", sectionId: "SEC-3A", facultyId: "F-GUPTA" },
  { id: "M-22", subjectId: "S-CS204", sectionId: "SEC-3A", facultyId: "F-RAO" },
  { id: "M-23", subjectId: "S-CS206", sectionId: "SEC-3A", facultyId: "F-GUPTA" },

  // --- Section 3B (Year 3 - B) ---
  { id: "M-24", subjectId: "S-CS210", sectionId: "SEC-3B", facultyId: "F-IYER" },
  { id: "M-25", subjectId: "S-CS204", sectionId: "SEC-3B", facultyId: "F-RAO" },
  { id: "M-26", subjectId: "S-CS203", sectionId: "SEC-3B", facultyId: "F-GUPTA" },
  { id: "M-27", subjectId: "S-CS207", sectionId: "SEC-3B", facultyId: "F-NAIR" },
  { id: "M-28", subjectId: "S-CS208", sectionId: "SEC-3B", facultyId: "F-NAIR" },

  // --- Section 4A (Year 4 - A) ---
  { id: "M-29", subjectId: "S-CS207", sectionId: "SEC-4A", facultyId: "F-NAIR" },
  { id: "M-30", subjectId: "S-CS203", sectionId: "SEC-4A", facultyId: "F-GUPTA" },
  { id: "M-31", subjectId: "S-CS202", sectionId: "SEC-4A", facultyId: "F-IYER" },
  { id: "M-32", subjectId: "S-CS210", sectionId: "SEC-4A", facultyId: "F-IYER" },
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
