import { useSyncExternalStore } from "react";
import type { Subject } from "@/types";

/**
 * Same placeholder pattern as useFacultyData.ts — no setup-data endpoints
 * exist yet. Sample data matches subject names/codes already used
 * throughout this project's Figma prototype (the published III-CSE-A grid
 * and the HOD's teaching schedule) rather than inventing new ones, and
 * `defaultFacultyId` references the real ids from useFacultyData.ts.
 */
let subjects: Subject[] = [
  // --- 1st Year Subjects (CS1xx) ---
  { id: "S-CS101", name: "Programming & Problem Solving", code: "CS101", credits: 4, type: "regular", defaultFacultyId: "F-SHARMA" },
  { id: "S-CS102", name: "Engineering Physics & Math", code: "CS102", credits: 4, type: "regular", defaultFacultyId: "F-REDDY" },
  { id: "S-CS103", name: "Basic Electronics", code: "CS103", credits: 3, type: "regular", defaultFacultyId: "F-NAIR" },
  { id: "S-CS104", name: "Technical Communication", code: "CS104", credits: 3, type: "regular", defaultFacultyId: "F-MEHTA" },
  { id: "S-CS105", name: "Programming Lab", code: "CS105", credits: 1, type: "lab", defaultFacultyId: "F-SHARMA" },
  { id: "S-CS106", name: "Basic Electronics Lab", code: "CS106", credits: 1, type: "lab", defaultFacultyId: "F-JOSHI" },

  // --- 2nd Year Subjects (CS2xx) ---
  { id: "S-CS201", name: "Data Structures", code: "CS201", credits: 4, type: "regular", defaultFacultyId: "F-SHARMA" },
  { id: "S-CS202", name: "Discrete Mathematics", code: "CS202", credits: 4, type: "regular", defaultFacultyId: "F-MEHTA" },
  { id: "S-CS203", name: "DBMS", code: "CS203", credits: 4, type: "regular", defaultFacultyId: "F-GUPTA" },
  { id: "S-CS204", name: "Computer Architecture", code: "CS204", credits: 3, type: "regular", defaultFacultyId: "F-RAO" },
  { id: "S-CS205", name: "Data Structures Lab", code: "CS205", credits: 1, type: "lab", defaultFacultyId: "F-SHARMA" },
  { id: "S-CS206", name: "DBMS Lab", code: "CS206", credits: 1, type: "lab", defaultFacultyId: "F-GUPTA" },

  // --- 3rd Year Subjects (CS3xx) ---
  { id: "S-CS301", name: "Operating Systems", code: "CS301", credits: 4, type: "regular", defaultFacultyId: "F-IYER" },
  { id: "S-CS302", name: "Computer Networks", code: "CS302", credits: 3, type: "regular", defaultFacultyId: "F-NAIR" },
  { id: "S-CS303", name: "Theory of Computation", code: "CS303", credits: 3, type: "regular", defaultFacultyId: "F-IYER" },
  { id: "S-CS304", name: "Design & Analysis of Algorithms", code: "CS304", credits: 3, type: "regular", defaultFacultyId: "F-RAO" },
  { id: "S-CS305", name: "Networks Lab", code: "CS305", credits: 1, type: "lab", defaultFacultyId: "F-NAIR" },
  { id: "S-CS306", name: "OS Lab", code: "CS306", credits: 1, type: "lab", defaultFacultyId: "F-VERMA" },
  { id: "S-CS307", name: "Machine Learning", code: "CS307", credits: 3, type: "elective", defaultFacultyId: "F-GUPTA" },
  { id: "S-CS308", name: "Natural Language Processing", code: "CS308", credits: 3, type: "elective", defaultFacultyId: "F-IYER" },

  // --- 4th Year Subjects (CS4xx) ---
  { id: "S-CS401", name: "Compiler Design", code: "CS401", credits: 3, type: "regular", defaultFacultyId: "F-IYER" },
  { id: "S-CS402", name: "Cloud Computing", code: "CS402", credits: 3, type: "regular", defaultFacultyId: "F-VERMA" },
  { id: "S-CS403", name: "Advanced Algorithms", code: "CS403", credits: 3, type: "regular", defaultFacultyId: "F-RAO" },
  { id: "S-CS404", name: "Distributed Systems", code: "CS404", credits: 3, type: "regular", defaultFacultyId: "F-PATEL" },
  { id: "S-CS405", name: "Compiler & Cloud Lab", code: "CS405", credits: 1, type: "lab", defaultFacultyId: "F-VERMA" },
];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function addSubject(record: Omit<Subject, "id">) {
  const newRecord: Subject = { ...record, id: `S-${Date.now()}` };
  subjects = [...subjects, newRecord];
  notify();
  return newRecord;
}

export function useSubjectData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => subjects,
  );
}
