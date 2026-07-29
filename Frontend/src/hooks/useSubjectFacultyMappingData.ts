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
  // --- Year 1 - Section A (SEC-1A) ---
  { id: "M-01", subjectId: "S-CS101", sectionId: "SEC-1A", facultyId: "F-SHARMA" }, // CS101 Programming & Problem Solving
  { id: "M-02", subjectId: "S-CS102", sectionId: "SEC-1A", facultyId: "F-REDDY" },  // CS102 Physics & Math
  { id: "M-03", subjectId: "S-CS103", sectionId: "SEC-1A", facultyId: "F-NAIR" },   // CS103 Basic Electronics
  { id: "M-04", subjectId: "S-CS104", sectionId: "SEC-1A", facultyId: "F-MEHTA" },  // CS104 Tech Communication
  { id: "M-05", subjectId: "S-CS105", sectionId: "SEC-1A", facultyId: "F-SHARMA" }, // CS105 Programming Lab
  { id: "M-06", subjectId: "S-CS106", sectionId: "SEC-1A", facultyId: "F-JOSHI" },  // CS106 Electronics Lab

  // --- Year 1 - Section B (SEC-1B) ---
  { id: "M-07", subjectId: "S-CS101", sectionId: "SEC-1B", facultyId: "F-SHARMA" },
  { id: "M-08", subjectId: "S-CS102", sectionId: "SEC-1B", facultyId: "F-REDDY" },
  { id: "M-09", subjectId: "S-CS103", sectionId: "SEC-1B", facultyId: "F-NAIR" },
  { id: "M-10", subjectId: "S-CS104", sectionId: "SEC-1B", facultyId: "F-MEHTA" },
  { id: "M-11", subjectId: "S-CS105", sectionId: "SEC-1B", facultyId: "F-SHARMA" },
  { id: "M-12", subjectId: "S-CS106", sectionId: "SEC-1B", facultyId: "F-JOSHI" },

  // --- Year 2 - Section A (SEC-2A) ---
  { id: "M-13", subjectId: "S-CS201", sectionId: "SEC-2A", facultyId: "F-SHARMA" }, // CS201 Data Structures
  { id: "M-14", subjectId: "S-CS202", sectionId: "SEC-2A", facultyId: "F-MEHTA" },  // CS202 Discrete Math
  { id: "M-15", subjectId: "S-CS203", sectionId: "SEC-2A", facultyId: "F-GUPTA" },  // CS203 DBMS
  { id: "M-16", subjectId: "S-CS204", sectionId: "SEC-2A", facultyId: "F-RAO" },    // CS204 Computer Arch
  { id: "M-17", subjectId: "S-CS205", sectionId: "SEC-2A", facultyId: "F-SHARMA" }, // CS205 DS Lab
  { id: "M-18", subjectId: "S-CS206", sectionId: "SEC-2A", facultyId: "F-GUPTA" },  // CS206 DBMS Lab

  // --- Year 3 - Section A (SEC-3A) ---
  { id: "M-19", subjectId: "S-CS301", sectionId: "SEC-3A", facultyId: "F-IYER" },   // CS301 Operating Systems
  { id: "M-20", subjectId: "S-CS302", sectionId: "SEC-3A", facultyId: "F-NAIR" },   // CS302 Computer Networks
  { id: "M-21", subjectId: "S-CS303", sectionId: "SEC-3A", facultyId: "F-IYER" },   // CS303 Theory of Computation
  { id: "M-22", subjectId: "S-CS304", sectionId: "SEC-3A", facultyId: "F-RAO" },    // CS304 Algorithms
  { id: "M-23", subjectId: "S-CS305", sectionId: "SEC-3A", facultyId: "F-NAIR" },   // CS305 Networks Lab
  { id: "M-24", subjectId: "S-CS306", sectionId: "SEC-3A", facultyId: "F-VERMA" },  // CS306 OS Lab

  // --- Year 3 - Section B (SEC-3B) ---
  { id: "M-25", subjectId: "S-CS301", sectionId: "SEC-3B", facultyId: "F-IYER" },
  { id: "M-26", subjectId: "S-CS302", sectionId: "SEC-3B", facultyId: "F-NAIR" },
  { id: "M-27", subjectId: "S-CS303", sectionId: "SEC-3B", facultyId: "F-IYER" },
  { id: "M-28", subjectId: "S-CS304", sectionId: "SEC-3B", facultyId: "F-RAO" },
  { id: "M-29", subjectId: "S-CS305", sectionId: "SEC-3B", facultyId: "F-NAIR" },

  // --- Year 4 - Section A (SEC-4A) ---
  { id: "M-30", subjectId: "S-CS401", sectionId: "SEC-4A", facultyId: "F-IYER" },   // CS401 Compiler Design
  { id: "M-31", subjectId: "S-CS402", sectionId: "SEC-4A", facultyId: "F-VERMA" },  // CS402 Cloud Computing
  { id: "M-32", subjectId: "S-CS403", sectionId: "SEC-4A", facultyId: "F-RAO" },    // CS403 Advanced Algorithms
  { id: "M-33", subjectId: "S-CS404", sectionId: "SEC-4A", facultyId: "F-PATEL" },  // CS404 Distributed Systems
  { id: "M-34", subjectId: "S-CS405", sectionId: "SEC-4A", facultyId: "F-VERMA" },  // CS405 Compiler & Cloud Lab
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
