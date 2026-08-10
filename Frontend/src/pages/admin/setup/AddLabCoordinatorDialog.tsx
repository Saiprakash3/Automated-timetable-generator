import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addLabCoordinator, updateLabCoordinator } from "@/hooks/useLabCoordinatorData";
import type { LabCoordinator } from "@/types";
import { useLabData } from "@/hooks/useLabData";

interface AddLabCoordinatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when set: same form, pre-filled (PATTERNS.md Pattern 9.2). */
  editing?: LabCoordinator | null;
}

/** Labs are a checkbox list, not a multi-select — the lab roster is small
 *  (3 today) and a coordinator can service zero or more, so a plain list of
 *  toggles reads faster than opening a dropdown. Reads live from
 *  useLabData, same live-join pattern as Subjects' Default Faculty select. */
export function AddLabCoordinatorDialog({ open, onOpenChange, editing }: AddLabCoordinatorDialogProps) {
  const labs = useLabData();
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [labIds, setLabIds] = useState<string[]>([]);

  function reset() {
    setName("");
    setDepartment("");
    setLabIds([]);
  }

  function toggleLab(id: string, checked: boolean) {
    setLabIds((prev) => (checked ? [...prev, id] : prev.filter((l) => l !== id)));
  }

  const isValid = name.trim() !== "" && department.trim() !== "";

  const isEdit = !!editing;

  // Pre-fill on open. A blank 'edit' form is just a second Add form:
  // you can't see what you're correcting, and untouched fields blank out.
  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setDepartment(editing?.department ?? "");
    setLabIds(editing?.labIds ?? []);
  }, [open, editing]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const record = { name: name.trim(), department: department.trim(), labIds };
    if (editing) void updateLabCoordinator(editing.id, record);
    else void addLabCoordinator(record);
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
          <DialogTitle>{isEdit ? "Edit lab coordinator" : "Add lab coordinator"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="coordinator-name">Name</Label>
            <Input id="coordinator-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordinator-department">Department</Label>
            <Input
              id="coordinator-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Labs coordinated</Label>
            <div className="space-y-2 rounded-md border border-border px-3 py-2.5">
              {labs.map((lab) => (
                <div key={lab.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`coordinator-lab-${lab.id}`}
                    checked={labIds.includes(lab.id)}
                    onCheckedChange={(checked) => toggleLab(lab.id, checked === true)}
                  />
                  <Label htmlFor={`coordinator-lab-${lab.id}`} className="font-normal">
                    {lab.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              {isEdit ? "Save changes" : "Add coordinator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
