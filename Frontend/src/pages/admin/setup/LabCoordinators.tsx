import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useLabCoordinatorData } from "@/hooks/useLabCoordinatorData";
import { useLabData } from "@/hooks/useLabData";
import { AddLabCoordinatorDialog } from "./AddLabCoordinatorDialog";

/** Same structure as Faculty.tsx — see its notes on the omitted checkbox
 *  column and the disabled Import button; both apply here too. "Labs
 *  coordinated" joins labIds back to lab names live from useLabData, same
 *  join pattern Subjects.tsx uses for its Default Faculty column. */
export default function LabCoordinatorsSetup() {
  const coordinators = useLabCoordinatorData();
  const labs = useLabData();
  const [addOpen, setAddOpen] = useState(false);

  function labNames(labIds: string[]) {
    if (labIds.length === 0) return "—";
    return labIds.map((id) => labs.find((l) => l.id === id)?.name ?? id).join(", ");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Lab Coordinators</h1>
          <p className="font-body text-muted-foreground">Manage the dedicated lab coordinator pool.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" disabled title="Bulk Import Stepper — not built yet">
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>Add coordinator</Button>
        </div>
      </div>

      {coordinators.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-border text-center">
          <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-h3 font-semibold text-foreground">No lab coordinators added yet</p>
            <p className="font-body text-sm text-muted-foreground">
              Lab coordinators need to be added before lab sessions can be scheduled.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)}>Add Coordinator</Button>
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
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Labs coordinated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coordinators.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.department}</TableCell>
                  <TableCell className="text-muted-foreground">{labNames(c.labIds)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddLabCoordinatorDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
