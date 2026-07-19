/**
 * Distinct from Room (types/room.ts) and owned separately from Lab
 * Coordinators — a coordinator's *own* record lists which labs they
 * coordinate (confirmed from the Figma build history: "Setup › Lab
 * Coordinators lists him... coordinates Networks Lab + DS Lab"), so this
 * type carries no coordinator reference of its own.
 *
 * Fields map directly to the 3 Lab-specific conflict checks in
 * INTERACTION_DECISIONS.md's taxonomy:
 * - `available` → #6 "Lab under maintenance / marked unavailable" (Blocking)
 * - `capacity`  → #7 "Lab capacity exceeded by section/batch size" (Warning)
 * - `equipment` → #8 "Lab unsuitable for subject (equipment/type mismatch)" (Warning)
 * No automated equipment-matching system is specified anywhere, so this is
 * free text an Admin reads, not a field Subjects cross-references.
 */
export interface Lab {
  id: string;
  name: string;
  room: string;
  capacity: number;
  equipment: string;
  available: boolean;
}
