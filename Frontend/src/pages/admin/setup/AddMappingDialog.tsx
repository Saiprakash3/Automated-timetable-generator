import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addMapping } from "@/hooks/useSubjectFacultyMappingData";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useSectionData } from "@/hooks/useSectionData";
import { useFacultyData } from "@/hooks/useFacultyData";

interface AddMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Three live-joined Selects, no free text — a mapping is only meaningful as
 *  a link between existing records. Subject options exclude electives:
 *  PROJECT_BRIEF.md scopes electives to cross-section basket assignment
 *  (Elective Baskets' job), not a per-section mapping like this one. */
export function AddMappingDialog({ open, onOpenChange }: AddMappingDialogProps) {
  const subjects = useSubjectData().filter((s) => s.type !== "elective");
  const sections = useSectionData();
  const faculty = useFacultyData();

  const [subjectId, setSubjectId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [facultyId, setFacultyId] = useState("");

  function reset() {
    setSubjectId("");
    setSectionId("");
    setFacultyId("");
  }

  const isValid = subjectId !== "" && sectionId !== "" && facultyId !== "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    addMapping({ subjectId, sectionId, facultyId });
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
          <DialogTitle>Add mapping</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="mapping-subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="mapping-subject" className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mapping-section">Section</Label>
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger id="mapping-section" className="w-full">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    Year {sec.year} — {sec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mapping-faculty">Faculty</Label>
            <Select value={facultyId} onValueChange={setFacultyId}>
              <SelectTrigger id="mapping-faculty" className="w-full">
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
              Add mapping
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
