import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useRoomData } from "@/hooks/useRoomData";
import { AddRoomDialog } from "./AddRoomDialog";

/** Same structure as Faculty.tsx / Subjects.tsx — see Faculty.tsx's notes on
 *  the omitted checkbox column and the disabled Import button; both apply here too. */
export default function RoomsSetup() {
  const rooms = useRoomData();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Rooms</h1>
          <p className="font-body text-muted-foreground">Manage lecture rooms and their capacity.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" disabled title="Bulk Import Stepper — not built yet">
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>Add room</Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-border text-center">
          <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-h3 font-semibold text-foreground">No rooms added yet</p>
            <p className="font-body text-sm text-muted-foreground">
              Rooms need to be added before the timetable can be generated.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)}>Add Room</Button>
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
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.number}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{r.capacity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddRoomDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
