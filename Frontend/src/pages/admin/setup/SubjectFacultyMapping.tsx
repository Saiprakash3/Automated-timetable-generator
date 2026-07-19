import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useSubjectFacultyMappingData } from "@/hooks/useSubjectFacultyMappingData";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useSectionData } from "@/hooks/useSectionData";
import { useFacultyData } from "@/hooks/useFacultyData";
import { AddMappingDialog } from "./AddMappingDialog";

/** Same structure as Faculty.tsx — see its notes on the omitted checkbox
 *  column and the disabled Import button; both apply here too. All three
 *  columns are live joins back to their own setup category, same pattern
 *  Subjects.tsx (Default Faculty) and LabCoordinators.tsx (Labs) established. */
export default function SubjectFacultyMappingSetup() {
  const mappings = useSubjectFacultyMappingData();
  const subjects = useSubjectData();
  const sections = useSectionData();
  const faculty = useFacultyData();
  const [addOpen, setAddOpen] = useState(false);

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const sectionName = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    return sec ? `Year ${sec.year} — ${sec.name}` : id;
  };
  const facultyName = (id: string) => faculty.find((f) => f.id === id)?.name ?? id;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Subject–Faculty Mapping</h1>
          <p className="font-body text-muted-foreground">Assign which faculty teaches each subject, per section.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" disabled title="Bulk Import Stepper — not built yet">
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>Add mapping</Button>
        </div>
      </div>

      {mappings.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-border text-center">
          <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-h3 font-semibold text-foreground">No mappings configured yet</p>
            <p className="font-body text-sm text-muted-foreground">
              Requires Subjects and Faculty to be set up first.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)}>Add Mapping</Button>
            <Button variant="outline" disabled title="Bulk Import Stepper — not built yet">
              Bulk Import
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Faculty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-foreground">{subjectName(m.subjectId)}</TableCell>
                  <TableCell className="text-muted-foreground">{sectionName(m.sectionId)}</TableCell>
                  <TableCell className="text-muted-foreground">{facultyName(m.facultyId)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddMappingDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
