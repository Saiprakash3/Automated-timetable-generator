import { useSyncExternalStore } from "react";
import type { LabCoordinator } from "@/types";

/**
 * Same placeholder pattern as the other useXData hooks. Mr. K. Rao is not
 * an invented name — `Claude design review V1.md`'s Lab Coordinator screen
 * review explicitly used him ("Setup › Lab Coordinators lists him ...
 * coordinates Networks Lab + DS Lab") *because* he already existed as
 * Prof. K. Rao in useFacultyData.ts (canServeAsLabCoordinator: true) — this
 * is the ~30% Faculty/Coordinator overlap case from PROJECT_BRIEF.md made
 * concrete, kept exactly as the review left it (same two labs). K. Srinivas
 * and Anitha Rao mirror the mock backend's LC004/LC005 login accounts
 * (db.json) — LC005 is that same overlap case at the auth layer. The 5th
 * (S. Bhat) is a plain addition to reach the "5 coordinators added" count
 * already set in lib/setupCategories.ts, deliberately with no lab assigned
 * yet to demonstrate that a coordinator can exist before being assigned.
 */
let coordinators: LabCoordinator[] = [
  { id: "LC-RAO", name: "Mr. K. Rao", department: "Computer Science", labIds: ["L-DS", "L-NET"] },
  { id: "LC-SRINIVAS", name: "K. Srinivas", department: "Computer Science", labIds: ["L-DBMS"] },
  { id: "LC-ARAO", name: "Dr. Anitha Rao", department: "Computer Science", labIds: ["L-NET"] },
  { id: "LC-BHAT", name: "S. Bhat", department: "Computer Science", labIds: ["L-DS"] },
  { id: "LC-REDDY", name: "T. Reddy", department: "Computer Science", labIds: [] },
];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function addLabCoordinator(record: Omit<LabCoordinator, "id">) {
  const newRecord: LabCoordinator = { ...record, id: `LC-${Date.now()}` };
  coordinators = [...coordinators, newRecord];
  notify();
  return newRecord;
}

export function useLabCoordinatorData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => coordinators,
  );
}
