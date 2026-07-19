import { useSyncExternalStore } from "react";
import type { ElectiveBasket } from "@/types";

/**
 * Same placeholder pattern as the other useXData hooks. "Basket A" isn't
 * invented: `Claude design review V1.md` names it explicitly — Dr. Gupta's
 * Machine Learning elective and Dr. Iyer's NLP elective (his second
 * elective, per the same review's HOD-mapping reasoning), in Room 210 and
 * Room 212 respectively. Assigned to 3rd year (sections 3A/3B) and Period 5
 * (2:00–3:00) — a plain, non-conflicting choice; the review's own history of
 * this basket's time slot shifted more than once while chasing an unrelated
 * clash, so no single historical slot value is authoritative to replay here.
 * Only one basket seeded (4th year still empty) — matches setupCategories.ts's
 * "partial" state for this category.
 */
let baskets: ElectiveBasket[] = [
  {
    id: "EB-A",
    name: "3rd Year — Elective Basket A",
    year: 3,
    period: 5,
    sectionIds: ["SEC-3A", "SEC-3B"],
    electives: [
      { id: "EL-ML", subjectId: "S-CS209", facultyId: "F-GUPTA", roomId: "R-210" },
      { id: "EL-NLP", subjectId: "S-CS213", facultyId: "F-IYER", roomId: "R-212" },
    ],
  },
];
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function addElectiveBasket(record: Omit<ElectiveBasket, "id">) {
  const newRecord: ElectiveBasket = { ...record, id: `EB-${Date.now()}` };
  baskets = [...baskets, newRecord];
  notify();
  return newRecord;
}

export function useElectiveBasketData() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => baskets,
  );
}
