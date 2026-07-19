import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addElectiveBasket, useElectiveBasketData } from "@/hooks/useElectiveBasketData";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useSectionData } from "@/hooks/useSectionData";
import { useFacultyData } from "@/hooks/useFacultyData";
import { useRoomData } from "@/hooks/useRoomData";
import { TIME_SLOTS } from "@/lib/timeSlots";
import type { Elective } from "@/types";

const YEAR_OPTIONS = [3, 4];

/**
 * F-06's dedicated configuration screen — FIGMA_BUILD_CHECKLIST.md lists this
 * separately from "Add Single Record modal (used by each setup screen)",
 * meaning Elective Baskets doesn't use the shared Add-record Dialog every
 * other category does. A full page instead of a modal because the flow has
 * a genuinely nested shape (a list of electives being built up inside the
 * basket being built up) that a small dialog can't hold per
 * USER_FLOWS.md's 6 steps.
 */
export default function ElectiveBasketConfig() {
  const navigate = useNavigate();
  const existingBaskets = useElectiveBasketData();
  const subjects = useSubjectData().filter((s) => s.type === "elective");
  const sections = useSectionData();
  const faculty = useFacultyData();
  const rooms = useRoomData();

  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [period, setPeriod] = useState("");
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [electives, setElectives] = useState<Elective[]>([]);

  const [draftSubjectId, setDraftSubjectId] = useState("");
  const [draftFacultyId, setDraftFacultyId] = useState("");
  const [draftRoomId, setDraftRoomId] = useState("");

  const yearSections = sections.filter((s) => String(s.year) === year);

  /** Conflict #12 (INTERACTION_DECISIONS.md): a period already taken by
   *  another basket in the same year is not offered. */
  const takenPeriods = new Set(existingBaskets.filter((b) => String(b.year) === year).map((b) => b.period));
  const availablePeriods = TIME_SLOTS.filter((t) => t.type === "class" && !takenPeriods.has(t.period as number));

  const availableSubjects = subjects.filter((s) => !electives.some((e) => e.subjectId === s.id));

  function toggleSection(id: string, checked: boolean) {
    setSectionIds((prev) => (checked ? [...prev, id] : prev.filter((s) => s !== id)));
  }

  function addElectiveRow() {
    if (!draftSubjectId || !draftFacultyId || !draftRoomId) return;
    setElectives((prev) => [
      ...prev,
      { id: `EL-${Date.now()}`, subjectId: draftSubjectId, facultyId: draftFacultyId, roomId: draftRoomId },
    ]);
    setDraftSubjectId("");
    setDraftFacultyId("");
    setDraftRoomId("");
  }

  function removeElectiveRow(id: string) {
    setElectives((prev) => prev.filter((e) => e.id !== id));
  }

  const isValid = name.trim() !== "" && year !== "" && period !== "" && sectionIds.length > 0 && electives.length > 0;

  function handleSave() {
    if (!isValid) return;
    addElectiveBasket({
      name: name.trim(),
      year: Number(year),
      period: Number(period),
      sectionIds,
      electives,
    });
    navigate("/setup/elective-baskets");
  }

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const facultyName = (id: string) => faculty.find((f) => f.id === id)?.name ?? id;
  const roomNumber = (id: string) => rooms.find((r) => r.id === id)?.number ?? id;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-h1 font-semibold text-foreground">Configure Elective Basket</h1>
        <p className="font-body text-muted-foreground">
          Define which electives, faculty, rooms, sections, and time slot make up this basket.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="basket-year">Year</Label>
            <Select
              value={year}
              onValueChange={(v) => {
                setYear(v);
                setSectionIds([]);
                setPeriod("");
              }}
            >
              <SelectTrigger id="basket-year" className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    Year {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="basket-name">Name</Label>
            <Input id="basket-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="basket-period">Time slot</Label>
          <Select value={period} onValueChange={setPeriod} disabled={year === ""}>
            <SelectTrigger id="basket-period" className="w-full">
              <SelectValue placeholder={year === "" ? "Select a year first" : "Select time slot"} />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map((t) => (
                <SelectItem key={t.period} value={String(t.period)}>
                  {t.label} · {t.start}–{t.end}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {year !== "" && availablePeriods.length === 0 && (
            <p className="font-body text-sm text-muted-foreground">
              Every period is already taken by another Year {year} basket.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Contributing sections</Label>
          {year === "" ? (
            <p className="font-body text-sm text-muted-foreground">Select a year to see its sections.</p>
          ) : (
            <div className="space-y-2 rounded-md border border-border px-3 py-2.5">
              {yearSections.map((sec) => (
                <div key={sec.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`basket-section-${sec.id}`}
                    checked={sectionIds.includes(sec.id)}
                    onCheckedChange={(checked) => toggleSection(sec.id, checked === true)}
                  />
                  <Label htmlFor={`basket-section-${sec.id}`} className="font-normal">
                    Year {sec.year} — {sec.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <Label>Electives in this basket</Label>

        {electives.length > 0 && (
          <div className="space-y-2">
            {electives.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 font-body text-sm"
              >
                <span className="text-foreground">
                  {subjectName(e.subjectId)} · {facultyName(e.facultyId)} · {roomNumber(e.roomId)}
                </span>
                <button
                  type="button"
                  onClick={() => removeElectiveRow(e.id)}
                  aria-label={`Remove ${subjectName(e.subjectId)}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="elective-subject">Subject</Label>
            <Select value={draftSubjectId} onValueChange={setDraftSubjectId}>
              <SelectTrigger id="elective-subject" className="w-full">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="elective-faculty">Faculty</Label>
            <Select value={draftFacultyId} onValueChange={setDraftFacultyId}>
              <SelectTrigger id="elective-faculty" className="w-full">
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculty.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="elective-room">Room</Label>
            <Select value={draftRoomId} onValueChange={setDraftRoomId}>
              <SelectTrigger id="elective-room" className="w-full">
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addElectiveRow}
            disabled={!draftSubjectId || !draftFacultyId || !draftRoomId}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => navigate("/setup/elective-baskets")}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={!isValid}>
          Save basket
        </Button>
      </div>
    </div>
  );
}
