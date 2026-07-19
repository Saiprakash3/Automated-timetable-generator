import { useSyncExternalStore } from "react";
import type { Section } from "@/types";

/**
 * Same placeholder pattern as the other useXData hooks. Years 2/3/4 already
 * have a real timetable in db.json (2A published, 3A draft, 4A pending) —
 * kept those three as-is rather than inventing different letters. 1st year
 * and the two B-sections are the plain remainder needed to reach the "6
 * sections added" count already set in lib/setupCategories.ts. studentCount
 * values are a realistic single-department CSE intake range, not exact —
 * no source document states a real number.
 */
let sections: Section[] = [
  { id: "SEC-1A", year: 1, name: "A", studentCount: 68 },
  { id: "SEC-1B", year: 1, name: "B", studentCount: 65 },
  { id: "SEC-2A", year: 2, name: "A", studentCount: 62 },
  { id: "SEC-3A", year: 3, name: "A", studentCount: 60 },
  { id: "SEC-3B", year: 3, name: "B", studentCount: 58 },
  { id: "SEC-4A", year: 4, name: "A", studentCount: 55 },
];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function addSection(record: Omit<Section, "id">) {
  const newRecord: Section = { ...record, id: `SEC-${Date.now()}` };
  sections = [...sections, newRecord];
  notify();
  return newRecord;
}

export function useSectionData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => sections,
  );
}
