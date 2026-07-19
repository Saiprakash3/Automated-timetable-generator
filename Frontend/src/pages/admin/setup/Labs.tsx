import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useLabData } from "@/hooks/useLabData";
import { AddLabDialog } from "./AddLabDialog";

/** Same structure as Faculty/Subjects/Rooms — see Faculty.tsx's notes on the
 *  omitted checkbox column and the disabled Import button; both apply here too.
 *  No coordinator column: that relationship is owned by the (separate,
 *  not-yet-built) Lab Coordinators page, not by Labs. */
export default function LabsSetup() {
  const labs = useLabData();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Labs</h1>
          <p className="font-body text-muted-foreground">Manage lab facilities, capacity, and availability.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" disabled title="Bulk Import Stepper — not built yet">
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>Add lab</Button>
        </div>
      </div>

      {labs.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-border text-center">
          <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-h3 font-semibold text-foreground">No labs added yet</p>
            <p className="font-body text-sm text-muted-foreground">
              Labs need to be added before lab sessions can be scheduled.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)}>Add Lab</Button>
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
                <TableHead>Lab</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-foreground">{l.name}</TableCell>
                  <TableCell className="text-muted-foreground">{l.room}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{l.capacity}</TableCell>
                  <TableCell className="text-muted-foreground">{l.equipment || "—"}</TableCell>
                  <TableCell>
                    {l.available ? (
                      <Badge className="border-transparent bg-success-bg text-success-fg">Available</Badge>
                    ) : (
                      <Badge className="border-transparent bg-warning-bg text-warning-fg">Under maintenance</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddLabDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
