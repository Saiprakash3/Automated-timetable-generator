import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertTimetableEntry, deleteTimetableEntry } from "@/hooks/useTimetableData";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useFacultyData } from "@/hooks/useFacultyData";
import { useRoomData } from "@/hooks/useRoomData";
import { useLabData } from "@/hooks/useLabData";
import { useLabCoordinatorData } from "@/hooks/useLabCoordinatorData";
import { checkEntryConflicts } from "@/lib/checkEntryConflicts";
import { ConflictBadge } from "./ConflictBadge";
import type { TimetableEntry } from "@/types";

interface CellEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: string;
  period: number;
  entry: TimetableEntry | null;
  sectionLabel: string;
  sectionStudentCount?: number;
  allEntries: TimetableEntry[];
}

/**
 * DOMAIN_COMPONENTS.md §10 — right-docked drawer, 480px. Core scope:
 * Subject/Faculty/Room. Labs additionally get the "second person" (Lab
 * Coordinator or Faculty-acting-as-coordinator) and a free-text Batch
 * identifier — both optional (no coordinator/batch assigned isn't a save
 * blocker, matching `lib/generateTimetable.ts`'s own "no coordinator found
 * isn't a placement failure" rule). No dedicated Batch entity/Setup
 * category exists, so Batch is descriptive metadata Admin types in, not a
 * managed record — conflict #9 ("batch double-booking") isn't checked here
 * as a result, since validating it meaningfully would need that entity.
 *
 * Electives stay read-only here entirely: an elective session is shared
 * across every contributing section (Elective Baskets' own model), so
 * editing it from one section's grid would silently affect every other
 * section showing the same basket — out of scope, redirected to Setup
 * instead. The elective variant does show its Basket name (previously only
 * visible on the grid cell itself, not in the drawer) — "Elective within
 * basket" is the same value the Subject field above already displays for
 * this type, not a second, separate picker.
 *
 * Labs keep their existing subject and period span (changing a lab's
 * subject would need to re-validate its 2-period placement) but allow
 * reassigning Faculty/Room/second-person/batch. Free cells and Regular
 * entries get full Subject/Faculty/Room editing, one period only —
 * creating a new lab session isn't supported from this drawer (labs need
 * the algorithm's pre/post-lunch window placement, not an arbitrary single
 * click).
 */
export function CellEditDrawer({
  open,
  onOpenChange,
  day,
  period,
  entry,
  sectionLabel,
  sectionStudentCount,
  allEntries,
}: CellEditDrawerProps) {
  const subjects = useSubjectData();
  const faculty = useFacultyData();
  const rooms = useRoomData();
  const labs = useLabData();
  const coordinators = useLabCoordinatorData();

  const isElective = entry?.type === "elective";
  const isLab = entry?.type === "lab";
  const readOnly = isElective;

  const regularSubjects = useMemo(() => subjects.filter((s) => s.type === "regular"), [subjects]);
  const roomOptions = isLab ? labs.filter((l) => l.available).map((l) => l.room) : rooms.map((r) => r.number);

  /** Union of the dedicated Lab Coordinator pool and Faculty who can also
   *  serve as one — DOMAIN_COMPONENTS.md §10's "Coordinator or
   *  Faculty-acting-as-coordinator." IDs come from two different `useXData`
   *  stores with distinct id prefixes (`LC-`/`F-`), so no collision risk in
   *  storing either directly in `labCoordinatorId`. */
  const secondPersonOptions = useMemo(
    () => [
      ...coordinators.map((c) => ({ id: c.id, name: c.name })),
      ...faculty.filter((f) => f.canServeAsLabCoordinator).map((f) => ({ id: f.id, name: f.name })),
    ],
    [coordinators, faculty],
  );

  const [subjectId, setSubjectId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [room, setRoom] = useState("");
  const [secondPersonId, setSecondPersonId] = useState("");
  const [batch, setBatch] = useState("");
  const [acceptWarnings, setAcceptWarnings] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (entry) {
      const subj = subjects.find((s) => s.name === entry.subject);
      setSubjectId(subj?.id ?? "");
      setFacultyId(entry.facultyId ?? "");
      setRoom(entry.room);
      setSecondPersonId(entry.labCoordinatorId ?? "");
      setBatch(entry.batch ?? "");
    } else {
      setSubjectId("");
      setFacultyId("");
      setRoom("");
      setSecondPersonId("");
      setBatch("");
    }
    setAcceptWarnings(false);
  }, [open, entry, subjects]);

  const facultyName = faculty.find((f) => f.id === facultyId)?.name;
  const periodEnd = entry ? entry.periodEnd : period;

  const conflicts = useMemo(() => {
    if (!facultyId && !room) return [];
    return checkEntryConflicts({
      candidate: { id: entry?.id ?? "DRAFT-NEW", day, periodStart: period, periodEnd, facultyId, facultyName, room },
      allEntries,
      sectionStudentCount,
      rooms,
      labs,
    });
  }, [entry, day, period, periodEnd, facultyId, facultyName, room, allEntries, sectionStudentCount, rooms, labs]);

  const hasBlocking = conflicts.some((c) => c.severity === "blocking");
  const hasWarning = conflicts.some((c) => c.severity === "warning");
  const hasSelection = isLab ? !!facultyId && !!room : !!subjectId && !!facultyId && !!room;
  const canSave = !readOnly && hasSelection && !hasBlocking && (!hasWarning || acceptWarnings);

  function handleSave() {
    if (!canSave) return;
    const subj = regularSubjects.find((s) => s.id === subjectId);
    const newEntry: TimetableEntry = {
      id: entry?.id ?? `EDIT-${Date.now()}`,
      day,
      periodStart: period,
      periodEnd,
      type: entry?.type ?? "regular",
      subject: isLab ? (entry?.subject ?? "") : (subj?.name ?? ""),
      facultyId,
      facultyName,
      room,
      section: sectionLabel,
      labCoordinatorId: isLab ? secondPersonId || undefined : undefined,
      batch: isLab ? batch.trim() || undefined : undefined,
    };
    upsertTimetableEntry(newEntry);
    onOpenChange(false);
  }

  function handleClear() {
    if (entry) deleteTimetableEntry(entry.id);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>
            {day}, Period {period} — {sectionLabel}
          </SheetTitle>
          {readOnly && (
            <SheetDescription>
              Configured via Elective Baskets — shared across every contributing section, so it can't be edited from
              a single section's grid.
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {isElective && (
            <div className="space-y-2">
              <Label>Elective Basket</Label>
              <p className="font-body text-sm text-foreground">{entry?.basket}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cell-subject">Subject</Label>
            {isLab || isElective ? (
              <p className="font-body text-sm text-foreground">{entry?.subject}</p>
            ) : (
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger id="cell-subject" className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {regularSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cell-faculty">Faculty</Label>
            {readOnly ? (
              <p className="font-body text-sm text-foreground">{entry?.facultyName}</p>
            ) : (
              <Select value={facultyId} onValueChange={setFacultyId}>
                <SelectTrigger id="cell-faculty" className="w-full">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cell-room">{isLab ? "Lab" : "Room"}</Label>
            {readOnly ? (
              <p className="font-body text-sm text-foreground">{entry?.room}</p>
            ) : (
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger id="cell-room" className="w-full">
                  <SelectValue placeholder={`Select ${isLab ? "lab" : "room"}`} />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {isLab && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cell-second-person">Lab Coordinator</Label>
                <Select
                  value={secondPersonId || "__none__"}
                  onValueChange={(v) => setSecondPersonId(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger id="cell-second-person" className="w-full">
                    <SelectValue placeholder="None assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None assigned</SelectItem>
                    {secondPersonOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cell-batch">Batch</Label>
                <Input
                  id="cell-batch"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="e.g. Batch 1"
                />
              </div>
            </>
          )}

          {!readOnly && conflicts.length > 0 && (
            <div className="space-y-2">
              {conflicts.map((c, i) => (
                <ConflictBadge key={i} conflict={c} />
              ))}
              {hasWarning && !hasBlocking && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="accept-warnings"
                    checked={acceptWarnings}
                    onCheckedChange={(v) => setAcceptWarnings(v === true)}
                  />
                  <Label htmlFor="accept-warnings" className="font-normal">
                    Accept and continue despite warnings
                  </Label>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="flex-row justify-between">
          <div>
            {entry && !readOnly && (
              <Button type="button" variant="destructive" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!readOnly && (
              <Button type="button" onClick={handleSave} disabled={!canSave}>
                Save
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
