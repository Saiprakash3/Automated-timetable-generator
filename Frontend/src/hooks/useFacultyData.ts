import { useSyncExternalStore, useEffect } from "react";
import type { Faculty } from "@/types";
import { setupApi } from "@/services/api/setup";

let faculty: Faculty[] = [
  { id: "F-SHARMA", name: "Dr. A. Sharma", department: "Computer Science", canServeAsLabCoordinator: false },
  { id: "F-IYER", name: "Prof. R. Iyer", department: "Computer Science", canServeAsLabCoordinator: false },
  { id: "F-NAIR", name: "Dr. M. Nair", department: "Electronics", canServeAsLabCoordinator: true },
  { id: "F-GUPTA", name: "Dr. S. Gupta", department: "Mathematics", canServeAsLabCoordinator: false },
  { id: "F-RAO", name: "Prof. K. Rao", department: "Computer Science", canServeAsLabCoordinator: true },
  { id: "F-VERMA", name: "Dr. P. Verma", department: "Computer Science", canServeAsLabCoordinator: true },
  { id: "F-REDDY", name: "Prof. N. Reddy", department: "Computer Science", canServeAsLabCoordinator: false },
  { id: "F-JOSHI", name: "Dr. K. Joshi", department: "Electronics", canServeAsLabCoordinator: true },
  { id: "F-MEHTA", name: "Prof. S. Mehta", department: "Mathematics", canServeAsLabCoordinator: false },
  { id: "F-PATEL", name: "Dr. R. Patel", department: "Computer Science", canServeAsLabCoordinator: false },
];
const listeners = new Set<() => void>();
let initialized = false;

function notify() {
  for (const listener of listeners) listener();
}

function loadFacultyFromApi() {
  if (initialized) return;
  initialized = true;
  setupApi
    .getFaculty()
    .then((data) => {
      if (data && data.length > 0) {
        faculty = data;
        notify();
      }
    })
    .catch(() => {
      // Fallback to default sample data if backend not reachable
    });
}

export function addFaculty(record: Omit<Faculty, "id">) {
  const newRecord: Faculty = { ...record, id: `F-${Date.now()}` };
  faculty = [...faculty, newRecord];
  notify();
  setupApi.createFaculty(newRecord).catch(() => {});
  return newRecord;
}

export function useFacultyData() {
  useEffect(() => {
    loadFacultyFromApi();
  }, []);

  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => faculty,
  );
}
