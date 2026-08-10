import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { addFaculty, updateFaculty } from "@/hooks/useFacultyData";
import { useSubjectData } from "@/hooks/useSubjectData";
import type { Faculty } from "@/types";

interface AddFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * When set, the dialog is in Edit mode: same form, pre-filled, "Save
   * changes" instead of "Add faculty" (PATTERNS.md Pattern 9.2). Reusing the
   * Add form is the point — a separate edit form is how the two drift apart,
   * and an edit dialog that opens blank is just a second Add dialog.
   */
  editing?: Faculty | null;
}

/**
 * FIGMA_BUILD_CHECKLIST.md: "Add Single Record modal (used by each setup
 * screen — one component instance)" — the fields below are Faculty-specific;
 * the shared piece is the Dialog shell itself, not a single mega-component.
 * Worth extracting a shared wrapper once a second category's Add dialog
 * exists and the actual common shape is visible — not before.
 *
 * Fields per USER_FLOWS.md F-01/F-07: name + department only — explicitly
 * NO load-limit fields (college-wide constants) — plus canServeAsLabCoordinator,
 * which IS required by the backend note in F-07.
 */
export function AddFacultyDialog({ open, onOpenChange, editing }: AddFacultyDialogProps) {
  const subjects = useSubjectData();
  const isEdit = !!editing;
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [canCoordinate, setCanCoordinate] = useState(false);
  const [canTeachSubjectIds, setCanTeachSubjectIds] = useState<string[]>([]);

  // Re-seed whenever the dialog opens or the target record changes. Keyed on
  // `open` too, so re-opening Edit on a row you previously abandoned shows the
  // stored values again rather than your discarded edits.
  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setDepartment(editing?.department ?? "");
    setCanCoordinate(editing?.canServeAsLabCoordinator ?? false);
    setCanTeachSubjectIds(editing?.canTeachSubjectIds ?? []);
  }, [open, editing]);

  function reset() {
    setName("");
    setDepartment("");
    setCanCoordinate(false);
    setCanTeachSubjectIds([]);
  }

  function toggleSubject(id: string, checked: boolean) {
    setCanTeachSubjectIds((prev) => (checked ? [...prev, id] : prev.filter((s) => s !== id)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !department.trim()) return;
    const record = {
      name: name.trim(),
      department: department.trim(),
      canServeAsLabCoordinator: canCoordinate,
      canTeachSubjectIds,
    };
    if (editing) void updateFaculty(editing.id, record);
    else void addFaculty(record);
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
          <DialogTitle>{isEdit ? "Edit faculty" : "Add faculty"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="faculty-name">Name</Label>
            <Input id="faculty-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faculty-department">Department</Label>
            <Input
              id="faculty-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <Label htmlFor="faculty-coordinator" className="font-normal">
              Can serve as Lab Coordinator
            </Label>
            <Switch id="faculty-coordinator" checked={canCoordinate} onCheckedChange={setCanCoordinate} />
          </div>

          {/* Conflict #18's source of truth. Left empty this is "unrestricted",
              not "teaches nothing" — the helper text says so, because an empty
              multi-select otherwise reads as a field the user forgot to fill. */}
          <div className="space-y-2">
            <Label>Can teach</Label>
            {subjects.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">
                No subjects in Setup yet — add subjects first to record what this person can teach.
              </p>
            ) : (
              <>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border px-3 py-2.5">
                  {subjects.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`faculty-subject-${s.id}`}
                        checked={canTeachSubjectIds.includes(s.id)}
                        onCheckedChange={(checked) => toggleSubject(s.id, checked === true)}
                      />
                      <Label htmlFor={`faculty-subject-${s.id}`} className="font-normal">
                        {s.name} <span className="text-muted-foreground">({s.code})</span>
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  Leave empty to allow any subject. Listing subjects warns when they're scheduled for anything else.
                </p>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !department.trim()}>
              {isEdit ? "Save changes" : "Add faculty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
