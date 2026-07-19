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
  { id: "S-CS201", name: "Data Structures", code: "CS201", credits: 4, type: "regular", defaultFacultyId: "F-SHARMA" },
  { id: "S-CS202", name: "Operating Systems", code: "CS202", credits: 4, type: "regular", defaultFacultyId: "F-IYER" },
  { id: "S-CS203", name: "DBMS", code: "CS203", credits: 4, type: "regular", defaultFacultyId: "F-GUPTA" },
  { id: "S-CS204", name: "Algorithms", code: "CS204", credits: 3, type: "regular", defaultFacultyId: "F-RAO" },
  { id: "S-CS205", name: "Data Structures Lab", code: "CS205", credits: 1, type: "lab", defaultFacultyId: "F-SHARMA" },
  { id: "S-CS206", name: "DBMS Lab", code: "CS206", credits: 1, type: "lab", defaultFacultyId: "F-GUPTA" },
  { id: "S-CS207", name: "Networks", code: "CS207", credits: 3, type: "regular", defaultFacultyId: "F-NAIR" },
  { id: "S-CS208", name: "Networks Lab", code: "CS208", credits: 1, type: "lab", defaultFacultyId: "F-NAIR" },
  { id: "S-CS209", name: "Machine Learning", code: "CS209", credits: 3, type: "elective", defaultFacultyId: "F-GUPTA" },
  { id: "S-CS210", name: "Compiler Design", code: "CS210", credits: 3, type: "regular", defaultFacultyId: "F-IYER" },
  { id: "S-CS211", name: "Advanced Algorithms", code: "CS211", credits: 3, type: "regular", defaultFacultyId: "F-RAO" },
  { id: "S-CS212", name: "Theory of Computation", code: "CS212", credits: 3, type: "regular", defaultFacultyId: "F-IYER" },
  // Second elective — Elective Baskets need more than one option to bundle.
  // Grounded in Dr. Iyer (HOD): `Claude design review V1.md` chose Iyer as HOD
  // specifically because he "teaches an elective, no labs," and its own
  // sample data names his second elective "NLP" opposite Dr. Gupta's ML.
  { id: "S-CS213", name: "Natural Language Processing", code: "CS213", credits: 3, type: "elective", defaultFacultyId: "F-IYER" },
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
