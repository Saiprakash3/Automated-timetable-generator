import { useSyncExternalStore } from "react";
import type { Faculty } from "@/types";

/**
 * Placeholder Faculty store — no setup-data endpoints exist yet
 * (Backend/API_CONTRACT.md explicitly scopes these out). Same
 * useSyncExternalStore pattern as useSession.ts: a module-level array +
 * subscribers, so adding a record actually updates every consumer
 * immediately (a plain function returning a fresh array each call, like
 * lib/setupCategories.ts, wouldn't survive across renders once mutated).
 *
 * Sample data matches the rest of this project's established faculty
 * identities (Sharma/Iyer/Nair/Gupta/Rao) rather than inventing new ones —
 * these are the same five people referenced throughout the Figma prototype.
 */
let faculty: Faculty[] = [
  { id: "F-SHARMA", name: "Dr. A. Sharma", department: "Computer Science", canServeAsLabCoordinator: false },
  { id: "F-IYER", name: "Prof. R. Iyer", department: "Computer Science", canServeAsLabCoordinator: false },
  { id: "F-NAIR", name: "Dr. M. Nair", department: "Electronics", canServeAsLabCoordinator: true },
  { id: "F-GUPTA", name: "Dr. S. Gupta", department: "Mathematics", canServeAsLabCoordinator: false },
  { id: "F-RAO", name: "Prof. K. Rao", department: "Computer Science", canServeAsLabCoordinator: true },
];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function addFaculty(record: Omit<Faculty, "id">) {
  const newRecord: Faculty = { ...record, id: `F-${Date.now()}` };
  faculty = [...faculty, newRecord];
  notify();
  return newRecord;
}

export function useFacultyData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => faculty,
  );
}
