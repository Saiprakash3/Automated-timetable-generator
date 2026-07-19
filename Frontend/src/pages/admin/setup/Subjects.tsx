import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useFacultyData } from "@/hooks/useFacultyData";
import { AddSubjectDialog } from "./AddSubjectDialog";

const TYPE_LABEL: Record<string, string> = { regular: "Regular", lab: "Lab", elective: "Elective" };

/** Same structure as pages/admin/setup/Faculty.tsx — see that file's notes on
 *  the omitted checkbox column and the disabled Import button; both apply here too. */
export default function SubjectsSetup() {
  const subjects = useSubjectData();
  const faculty = useFacultyData();
  const [addOpen, setAddOpen] = useState(false);

  const facultyName = (id: string) => faculty.find((f) => f.id === id)?.name ?? "—";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Subjects</h1>
          <p className="font-body text-muted-foreground">Manage subject codes, credits, and default faculty.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" disabled title="Bulk Import Stepper — not built yet">
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>Add subject</Button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-border text-center">
          <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-h3 font-semibold text-foreground">No subjects added yet</p>
            <p className="font-body text-sm text-muted-foreground">
              Subjects need to be added before faculty can be mapped.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)}>Add Subject</Button>
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
                <TableHead>Code</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead>Default Faculty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-muted-foreground">{s.code}</TableCell>
                  <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{TYPE_LABEL[s.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{s.credits}</TableCell>
                  <TableCell className="text-muted-foreground">{facultyName(s.defaultFacultyId)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddSubjectDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
