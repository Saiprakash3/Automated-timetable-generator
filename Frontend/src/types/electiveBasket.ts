/** One elective subject within a basket, with its own faculty and room —
 *  PROJECT_BRIEF.md: "each elective gets its own appropriately sized room." */
export interface Elective {
  id: string;
  subjectId: string;
  facultyId: string;
  roomId: string;
}

/**
 * F-06's entity: "year, time slot, contributing sections, and a list of
 * electives." `period` (not day+period) per DOMAIN_COMPONENTS.md §5.1 — a
 * basket occupies a period only, the generator decides which day. No
 * per-basket day field: `Claude design review V1.md` §3.13 notes this
 * explicitly ("a basket's slot is a period alone ... the generator, not
 * Admin, decides which day a basket lands on").
 *
 * `sectionIds` are the sections whose students contribute to this basket —
 * INTERACTION_DECISIONS.md conflict #12 ("Elective basket time-slot
 * collision, same year, two baskets") is enforced client-side in
 * AddBasket's period picker: periods already taken by another basket in the
 * same year are excluded from the options.
 */
export interface ElectiveBasket {
  id: string;
  name: string;
  year: number;
  period: number;
  sectionIds: string[];
  electives: Elective[];
}
