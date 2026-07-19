export interface TimeSlotRow {
  period: number | null;
  label: string;
  start: string;
  end: string;
  type: "class" | "lunch";
}

/**
 * Fixed college-wide constant, confirmed not configurable by Admin
 * (INTERACTION_DECISIONS.md §8.1) — a plain exported constant, not a
 * useSyncExternalStore hook like the other setup categories, since there is
 * nothing here that ever mutates. 6 teaching periods + the lunch break,
 * Monday–Friday.
 */
export const TIME_SLOTS: TimeSlotRow[] = [
  { period: 1, label: "Period 1", start: "9:00", end: "10:00", type: "class" },
  { period: 2, label: "Period 2", start: "10:00", end: "11:00", type: "class" },
  { period: 3, label: "Period 3", start: "11:00", end: "12:00", type: "class" },
  { period: null, label: "Lunch break", start: "12:00", end: "1:00", type: "lunch" },
  { period: 4, label: "Period 4", start: "1:00", end: "2:00", type: "class" },
  { period: 5, label: "Period 5", start: "2:00", end: "3:00", type: "class" },
  { period: 6, label: "Period 6", start: "3:00", end: "4:00", type: "class" },
];
