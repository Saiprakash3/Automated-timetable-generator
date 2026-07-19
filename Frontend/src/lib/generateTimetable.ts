import type {
  Subject,
  Section,
  Faculty,
  Room,
  Lab,
  LabCoordinator,
  SubjectFacultyMapping,
  ElectiveBasket,
  TimetableEntry,
  GeneratedTimetable,
} from "@/types";
import { TIME_SLOTS } from "@/lib/timeSlots";

/** "Monday through Saturday, typically — every built screen uses Mon–Fri"
 *  (DOMAIN_COMPONENTS.md §5) — using the 5 days every other screen uses. */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const REGULAR_PERIODS = TIME_SLOTS.filter((t) => t.type === "class").map((t) => t.period as number);
/** Valid 2-period lab windows, staying inside one lunch-block per
 *  INTERACTION_DECISIONS.md §8.2 — pre-lunch (P1–P3) or post-lunch (P4–P6). */
const LAB_WINDOWS: [number, number][] = [
  [1, 2],
  [2, 3],
  [4, 5],
  [5, 6],
];

interface GenerateInput {
  subjects: Subject[];
  sections: Section[];
  faculty: Faculty[];
  rooms: Room[];
  labs: Lab[];
  coordinators: LabCoordinator[];
  mappings: SubjectFacultyMapping[];
  baskets: ElectiveBasket[];
}

function slotKey(day: string, period: number) {
  return `${day}-${period}`;
}

function isBusy(map: Map<string, Set<string>>, id: string, key: string) {
  return map.get(id)?.has(key) ?? false;
}

function markBusy(map: Map<string, Set<string>>, id: string, key: string) {
  if (!map.has(id)) map.set(id, new Set());
  map.get(id)!.add(key);
}

/**
 * The "priority-based greedy algorithm (electives → labs → regular) with the
 * repair pass" described in USER_FLOWS.md F-02 step 2 — implemented for
 * real against the actual Setup data, not faked. Places electives first
 * (one shared day+period per basket, all its contributing sections blocked
 * off for that slot per F-06 step 5), then labs (2 consecutive periods,
 * staying inside one lunch-block), then regular lectures (1 period).
 *
 * The "repair pass" is a real second attempt, not an invented counter: each
 * item's first attempt only considers rooms/labs sized to fit the section's
 * `studentCount`; if none is free in any slot, a second attempt relaxes that
 * capacity preference and accepts any free room/lab. Anything unplaced even
 * after that counts as a genuine gap.
 *
 * Each lab entry also gets a `labCoordinatorId` (F-07's "second person") —
 * a coordinator whose `labIds` includes the specific lab used, free for
 * both periods. This is what makes a Lab Coordinator's My Timetable able to
 * show anything at all; it was a real gap (the field existed on
 * TimetableEntry but nothing ever set it) until this pass added it.
 */
export function generateTimetable(input: GenerateInput): Omit<GeneratedTimetable, "draftNumber"> {
  const { subjects, sections, faculty, rooms, labs, coordinators, mappings, baskets } = input;

  const facultyBusy = new Map<string, Set<string>>();
  const roomBusy = new Map<string, Set<string>>();
  const sectionBusy = new Map<string, Set<string>>();
  const coordinatorBusy = new Map<string, Set<string>>();

  const entries: TimetableEntry[] = [];
  let gaps = 0;
  let adjustedByRepair = 0;
  let entryCounter = 0;

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const facultyName = (id: string) => faculty.find((f) => f.id === id)?.name ?? id;
  const sectionLabel = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    return sec ? `${sec.year}${sec.name}` : id;
  };

  // ---- 1. Electives — one shared day+period per basket ----
  for (const basket of baskets) {
    const period = basket.period;
    let placedDay: string | null = null;

    for (const day of DAYS) {
      const key = slotKey(day, period);
      const facultyFree = basket.electives.every((e) => !isBusy(facultyBusy, e.facultyId, key));
      const roomFree = basket.electives.every((e) => !isBusy(roomBusy, e.roomId, key));
      const sectionsFree = basket.sectionIds.every((sid) => !isBusy(sectionBusy, sid, key));
      if (facultyFree && roomFree && sectionsFree) {
        placedDay = day;
        break;
      }
    }

    if (!placedDay) {
      gaps += basket.electives.length;
      continue;
    }

    const key = slotKey(placedDay, period);
    for (const sid of basket.sectionIds) markBusy(sectionBusy, sid, key);

    for (const elective of basket.electives) {
      markBusy(facultyBusy, elective.facultyId, key);
      markBusy(roomBusy, elective.roomId, key);
      const room = rooms.find((r) => r.id === elective.roomId)?.number ?? elective.roomId;
      entries.push({
        id: `GEN-${++entryCounter}`,
        day: placedDay,
        periodStart: period,
        periodEnd: period,
        type: "elective",
        subject: subjectName(elective.subjectId),
        facultyId: elective.facultyId,
        facultyName: facultyName(elective.facultyId),
        room,
        section: basket.name,
        basket: basket.name,
        applicableYears: [basket.year],
        sections: basket.sectionIds.map(sectionLabel),
      });
    }
  }

  // ---- 2. Labs, ---- 3. Regular — priority order per F-02 ----
  const labRows = mappings.filter((m) => subjects.find((s) => s.id === m.subjectId)?.type === "lab");
  const regularRows = mappings.filter((m) => subjects.find((s) => s.id === m.subjectId)?.type === "regular");

  for (const row of labRows) {
    const section = sections.find((s) => s.id === row.sectionId);
    const availableLabs = labs.filter((l) => l.available);
    const sizedLabs = availableLabs.filter((l) => l.capacity >= (section?.studentCount ?? 0));

    let placed = false;
    for (const relaxed of [false, true]) {
      const candidateLabs = relaxed ? availableLabs : sizedLabs;
      if (candidateLabs.length === 0) continue;

      labSearch: for (const day of DAYS) {
        for (const [p1, p2] of LAB_WINDOWS) {
          const k1 = slotKey(day, p1);
          const k2 = slotKey(day, p2);
          if (isBusy(facultyBusy, row.facultyId, k1) || isBusy(facultyBusy, row.facultyId, k2)) continue;
          if (isBusy(sectionBusy, row.sectionId, k1) || isBusy(sectionBusy, row.sectionId, k2)) continue;

          const lab = candidateLabs.find((l) => !isBusy(roomBusy, l.id, k1) && !isBusy(roomBusy, l.id, k2));
          if (!lab) continue;

          // F-07's "second person" — a Lab Coordinator assigned to this
          // specific lab (LabCoordinator.labIds) and free for both periods.
          // No coordinator found isn't a placement failure (conflict #15 is
          // Informational, not Blocking — "surfaces a setup gap, not an
          // edit error"), just an entry with no labCoordinatorId.
          const coordinator = coordinators.find(
            (c) => c.labIds.includes(lab.id) && !isBusy(coordinatorBusy, c.id, k1) && !isBusy(coordinatorBusy, c.id, k2),
          );

          markBusy(facultyBusy, row.facultyId, k1);
          markBusy(facultyBusy, row.facultyId, k2);
          markBusy(sectionBusy, row.sectionId, k1);
          markBusy(sectionBusy, row.sectionId, k2);
          markBusy(roomBusy, lab.id, k1);
          markBusy(roomBusy, lab.id, k2);
          if (coordinator) {
            markBusy(coordinatorBusy, coordinator.id, k1);
            markBusy(coordinatorBusy, coordinator.id, k2);
          }

          entries.push({
            id: `GEN-${++entryCounter}`,
            day,
            periodStart: p1,
            periodEnd: p2,
            type: "lab",
            subject: subjectName(row.subjectId),
            facultyId: row.facultyId,
            facultyName: facultyName(row.facultyId),
            room: lab.room,
            section: sectionLabel(row.sectionId),
            labCoordinatorId: coordinator?.id,
          });

          if (relaxed) adjustedByRepair++;
          placed = true;
          break labSearch;
        }
      }
      if (placed) break;
    }
    if (!placed) gaps++;
  }

  for (const row of regularRows) {
    const section = sections.find((s) => s.id === row.sectionId);
    const sizedRooms = rooms.filter((r) => r.capacity >= (section?.studentCount ?? 0));

    let placed = false;
    for (const relaxed of [false, true]) {
      const candidateRooms = relaxed ? rooms : sizedRooms;
      if (candidateRooms.length === 0) continue;

      regularSearch: for (const day of DAYS) {
        for (const period of REGULAR_PERIODS) {
          const key = slotKey(day, period);
          if (isBusy(facultyBusy, row.facultyId, key)) continue;
          if (isBusy(sectionBusy, row.sectionId, key)) continue;

          const room = candidateRooms.find((r) => !isBusy(roomBusy, r.id, key));
          if (!room) continue;

          markBusy(facultyBusy, row.facultyId, key);
          markBusy(sectionBusy, row.sectionId, key);
          markBusy(roomBusy, room.id, key);

          entries.push({
            id: `GEN-${++entryCounter}`,
            day,
            periodStart: period,
            periodEnd: period,
            type: "regular",
            subject: subjectName(row.subjectId),
            facultyId: row.facultyId,
            facultyName: facultyName(row.facultyId),
            room: room.number,
            section: sectionLabel(row.sectionId),
          });

          if (relaxed) adjustedByRepair++;
          placed = true;
          break regularSearch;
        }
      }
      if (placed) break;
    }
    if (!placed) gaps++;
  }

  const totalNeeded = mappings.length + baskets.reduce((sum, b) => sum + b.electives.length, 0);

  return {
    id: `TT-${Date.now()}`,
    status: "draft",
    generatedAt: new Date().toISOString(),
    entries,
    summary: { totalNeeded, placed: entries.length, gaps, adjustedByRepair },
  };
}
