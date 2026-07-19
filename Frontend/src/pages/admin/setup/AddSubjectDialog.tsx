import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addSubject } from "@/hooks/useSubjectData";
import { useFacultyData } from "@/hooks/useFacultyData";
import type { SubjectType } from "@/types";

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_LABELS: Record<SubjectType, string> = {
  regular: "Regular",
  lab: "Lab",
  elective: "Elective",
};

/**
 * Fields per the verified Figma build ("Add Single Record `204:6063`" —
 * Claude design review V1.md): name, code + credits (a row), type, default
 * faculty. Default faculty options come from useFacultyData — same live
 * store the Faculty page reads/writes, so a faculty member added there
 * shows up here immediately without a page reload.
 */
export function AddSubjectDialog({ open, onOpenChange }: AddSubjectDialogProps) {
  const faculty = useFacultyData();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [credits, setCredits] = useState("");
  const [type, setType] = useState<SubjectType>("regular");
  const [defaultFacultyId, setDefaultFacultyId] = useState("");

  function reset() {
    setName("");
    setCode("");
    setCredits("");
    setType("regular");
    setDefaultFacultyId("");
  }

  const creditsNum = Number(credits);
  const isValid = name.trim() !== "" && code.trim() !== "" && credits.trim() !== "" && creditsNum > 0 && defaultFacultyId !== "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    addSubject({ name: name.trim(), code: code.trim(), credits: creditsNum, type, defaultFacultyId });
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
          <DialogTitle>Add subject</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="subject-name">Subject name</Label>
            <Input id="subject-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="subject-code">Code</Label>
              <Input id="subject-code" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div className="w-24 space-y-2">
              <Label htmlFor="subject-credits">Credits</Label>
              <Input
                id="subject-credits"
                type="number"
                min={1}
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as SubjectType)}>
              <SelectTrigger id="subject-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABELS) as SubjectType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-faculty">Default faculty</Label>
            <Select value={defaultFacultyId} onValueChange={setDefaultFacultyId}>
              <SelectTrigger id="subject-faculty" className="w-full">
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
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Add subject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
