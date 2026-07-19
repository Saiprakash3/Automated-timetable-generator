/**
 * Regular lecture rooms — distinct setup category from Labs. No "type"
 * field: unlike Subjects (which genuinely has 3 scheduling-relevant types),
 * a Room here is just a lecture space. INTERACTION_DECISIONS.md's conflict
 * taxonomy has "Room double-booking" (#4) as the only Room-specific check —
 * capacity/suitability checks (#7, #8) are scoped to Labs only. Capacity is
 * still captured as useful reference data (an elective needs "its own
 * appropriately sized room" per PROJECT_BRIEF.md), just not tied to an
 * automated constraint yet.
 */
export interface Room {
  id: string;
  number: string;
  capacity: number;
}
