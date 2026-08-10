import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useSectionData, removeSection } from "@/hooks/useSectionData";
import { AddSectionDialog } from "./AddSectionDialog";
import { RowActions } from "@/components/domain/RowActions";
import { DeleteRecordDialog } from "@/components/domain/DeleteRecordDialog";
import type { Section } from "@/types";

/** Same structure as Faculty.tsx / Rooms.tsx — see Faculty.tsx's notes on the
 *  omitted checkbox column and the disabled Import button; both apply here too.
 *  Table sorted by year then name so the 1A/1B/2A/3A/3B/4A grouping reads
 *  naturally rather than in raw insertion order. */
export default function SectionsSetup() {
  const sections = useSectionData();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState<Section | null>(null);
  const sorted = [...sections].sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Sections</h1>
          <p className="font-body text-muted-foreground">Manage year-wise sections and student counts.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" disabled title="Bulk Import Stepper — not built yet">
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>Add section</Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-border text-center">
          <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-h3 font-semibold text-foreground">No sections added yet</p>
            <p className="font-body text-sm text-muted-foreground">
              Sections need to be added before the timetable can be generated.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)}>Add Section</Button>
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
                <TableHead>Year</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Student count</TableHead>
                <TableHead className="w-[88px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-muted-foreground">Year {s.year}</TableCell>
                  <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{s.studentCount}</TableCell>
                  <TableCell>
                    <RowActions
                      label={`${s.year}${s.name}`}
                      onEdit={() => { setEditing(s); setAddOpen(true); }}
                      onDelete={() => setDeleting(s)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddSectionDialog
        open={addOpen}
        onOpenChange={(next) => { setAddOpen(next); if (!next) setEditing(null); }}
        editing={editing}
      />
      <DeleteRecordDialog
        open={!!deleting}
        onOpenChange={(next) => !next && setDeleting(null)}
        recordName={deleting ? `${deleting.year}${deleting.name}` : ""}
        categoryLabel="section list"
        onConfirm={() => removeSection(deleting!.id)}
      />
    </div>
  );
}
