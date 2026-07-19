import { useSyncExternalStore } from "react";
import type { Room } from "@/types";

/**
 * Same placeholder pattern as useFacultyData.ts / useSubjectData.ts.
 * Room 301/305/210/212 are the ones already established in the published
 * III-CSE-A grid and HOD schedule elsewhere in this project; the rest are
 * a plain sequential range (real room numbers don't carry meaningful
 * "content" to ground the way faculty names or subject codes do). Count
 * matches the "14 rooms added" already set in lib/setupCategories.ts.
 */
let rooms: Room[] = [
  { id: "R-301", number: "Room 301", capacity: 70 },
  { id: "R-302", number: "Room 302", capacity: 70 },
  { id: "R-303", number: "Room 303", capacity: 60 },
  { id: "R-304", number: "Room 304", capacity: 60 },
  { id: "R-305", number: "Room 305", capacity: 80 },
  { id: "R-306", number: "Room 306", capacity: 60 },
  { id: "R-307", number: "Room 307", capacity: 60 },
  { id: "R-308", number: "Room 308", capacity: 70 },
  { id: "R-309", number: "Room 309", capacity: 60 },
  { id: "R-210", number: "Room 210", capacity: 40 },
  { id: "R-211", number: "Room 211", capacity: 40 },
  { id: "R-212", number: "Room 212", capacity: 40 },
  { id: "R-213", number: "Room 213", capacity: 40 },
  { id: "R-214", number: "Room 214", capacity: 40 },
];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function addRoom(record: Omit<Room, "id">) {
  const newRecord: Room = { ...record, id: `R-${Date.now()}` };
  rooms = [...rooms, newRecord];
  notify();
  return newRecord;
}

export function useRoomData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => rooms,
  );
}
