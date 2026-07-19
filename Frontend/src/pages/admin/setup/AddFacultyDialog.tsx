import { useState, type FormEvent } from "react";
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
import { addFaculty } from "@/hooks/useFacultyData";

interface AddFacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
export function AddFacultyDialog({ open, onOpenChange }: AddFacultyDialogProps) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [canCoordinate, setCanCoordinate] = useState(false);

  function reset() {
    setName("");
    setDepartment("");
    setCanCoordinate(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !department.trim()) return;
    addFaculty({ name: name.trim(), department: department.trim(), canServeAsLabCoordinator: canCoordinate });
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
          <DialogTitle>Add faculty</DialogTitle>
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

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !department.trim()}>
              Add faculty
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
