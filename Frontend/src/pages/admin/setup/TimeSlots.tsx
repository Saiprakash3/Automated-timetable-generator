import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TIME_SLOTS } from "@/lib/timeSlots";

/**
 * Read-only reference, not an editable setup category — INTERACTION_DECISIONS.md
 * §8.1 confirms the daily schedule is a fixed college-wide constant, not
 * configurable by Admin. No Add/Import buttons: there is nothing to add.
 * The lunch row is visually distinct (muted background, no period number) —
 * mirrors the Timetable Grid's own non-selectable lunch column (§5.1),
 * just as a table row instead of a grid column.
 */
export default function TimeSlotsSetup() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-h1 font-semibold text-foreground">Time Slot Grid</h1>
        <p className="font-body text-muted-foreground">
          Fixed college-wide schedule — 6 teaching periods per day, Monday–Friday. Not editable here.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Slot</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TIME_SLOTS.map((slot) => (
              <TableRow key={slot.label} className={slot.type === "lunch" ? "bg-muted" : undefined}>
                <TableCell className={slot.type === "lunch" ? "text-muted-foreground" : "font-medium text-foreground"}>
                  {slot.type === "lunch" ? "—" : slot.label}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {slot.start} – {slot.end}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {slot.type === "lunch" ? "Lunch break" : "Class"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
