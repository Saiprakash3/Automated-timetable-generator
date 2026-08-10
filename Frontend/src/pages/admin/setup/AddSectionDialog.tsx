import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addSection, updateSection } from "@/hooks/useSectionData";
import type { Section } from "@/types";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when set: same form, pre-filled (PATTERNS.md Pattern 9.2). */
  editing?: Section | null;
}

const YEAR_OPTIONS = [1, 2, 3, 4];

/** Year is a Select (fixed 1st–4th year range, not free text) since it drives
 *  the timetable's own `year: number` field (types/timetable.ts) — a typo'd
 *  number there would silently create an orphan section. Name stays a plain
 *  Input: section letters aren't a closed set worth hardcoding (some
 *  colleges run past C). */
export function AddSectionDialog({ open, onOpenChange, editing }: AddSectionDialogProps) {
  const [year, setYear] = useState<string>("");
  const [name, setName] = useState("");
  const [studentCount, setStudentCount] = useState("");

  function reset() {
    setYear("");
    setName("");
    setStudentCount("");
  }

  const studentCountNum = Number(studentCount);
  const isValid = year !== "" && name.trim() !== "" && studentCount.trim() !== "" && studentCountNum > 0;

  const isEdit = !!editing;

  // Pre-fill on open. A blank 'edit' form is just a second Add form:
  // you can't see what you're correcting, and untouched fields blank out.
  useEffect(() => {
    if (!open) return;
    setYear(editing ? String(editing.year) : year);
    setName(editing?.name ?? "");
    setStudentCount(editing ? String(editing.studentCount) : "");
  }, [open, editing]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const record = { year: Number(year), name: name.trim(), studentCount: studentCountNum };
    if (editing) void updateSection(editing.id, record);
    else void addSection(record);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="rounded-lg sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit section" : "Add section"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="section-year">Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger id="section-year" className="w-full">
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
            <div className="w-24 space-y-2">
              <Label htmlFor="section-name">Section</Label>
              <Input id="section-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-count">Student count</Label>
            <Input
              id="section-count"
              type="number"
              min={1}
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              {isEdit ? "Save changes" : "Add section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
