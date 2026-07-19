import { useSyncExternalStore } from "react";
import type { Lab } from "@/types";

/**
 * Same placeholder pattern as the other useXData hooks. These 3 match the
 * 3 lab-type Subjects already built (CS205 Data Structures Lab, CS206 DBMS
 * Lab, CS208 Networks Lab) — same names, same domain the rest of this
 * project's sample data describes. DBMS Lab is deliberately `available:
 * false` so the maintenance state (conflict #6) is demonstrated, not just
 * declared as a field that's always true.
 */
let labs: Lab[] = [
  { id: "L-DS", name: "Data Structures Lab", room: "Lab 205", capacity: 30, equipment: "Desktop workstations", available: true },
  { id: "L-DBMS", name: "DBMS Lab", room: "Lab 206", capacity: 30, equipment: "Desktop workstations", available: false },
  { id: "L-NET", name: "Networks Lab", room: "Lab 204", capacity: 25, equipment: "Networking hardware, switches", available: true },
];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function addLab(record: Omit<Lab, "id">) {
  const newRecord: Lab = { ...record, id: `L-${Date.now()}` };
  labs = [...labs, newRecord];
  notify();
  return newRecord;
}

export function useLabData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => labs,
  );
}
