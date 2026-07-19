import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useFacultyData, addFaculty } from "@/hooks/useFacultyData";
import { useSubjectFacultyMappingData } from "@/hooks/useSubjectFacultyMappingData";
import { AddFacultyDialog } from "./AddFacultyDialog";
import { BulkImportStepper, type BulkImportColumn } from "@/components/domain/BulkImportStepper";
import type { Faculty } from "@/types";

const IMPORT_COLUMNS: BulkImportColumn[] = [
  { key: "name", label: "Name", required: true },
  { key: "department", label: "Department", required: true },
  { key: "canServeAsLabCoordinator", label: "Lab Coordinator?", required: false },
];

const IMPORT_EXAMPLE_ROWS = [
  ["Dr. Priya Menon", "Computer Science", "false"],
  ["Prof. Arjun Verma", "Electronics", "true"],
];

/**
 * COMPONENTS.md §G.1 Table (default size, per "Setup screens use default").
 * No Selectable/checkbox column — the Figma reference has one, but nothing
 * in the docs defines a bulk action for selected rows, so a checkbox with
 * no resulting behavior would be an unfinished control, not a feature.
 * Add it back once a real bulk action (e.g. bulk delete) is specified.
 *
 * Import (bulk) uses the generic BulkImportStepper (DOMAIN_COMPONENTS.md
 * §12) — Faculty is the one category that wires it up fully, matching this
 * session's "build one category all the way, leave the rest disabled"
 * scope decision. Other categories' Import buttons stay disabled until a
 * second one is worth building for real.
 */
export default function FacultySetup() {
  const faculty = useFacultyData();
  const mappings = useSubjectFacultyMappingData();
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  /** Distinct sections a faculty member teaches, joined from Subject–Faculty
   *  Mapping rather than a stored count — see types/faculty.ts's note. */
  function sectionsFor(facultyId: string) {
    return new Set(mappings.filter((m) => m.facultyId === facultyId).map((m) => m.sectionId)).size;
  }

  /** PATTERNS.md §3.1 — validated in column order: name, department, then
   *  the optional boolean. Duplicate names checked against the live
   *  Faculty store, case-insensitively (`Row [N]: [specific error]` copy is
   *  applied by BulkImportStepper itself). */
  function validateFacultyRow(cells: string[]) {
    const [name, department, coordinatorRaw] = cells;
    if (!name?.trim()) return { valid: false as const, error: "Name is required" };
    if (!department?.trim()) return { valid: false as const, error: "Department is required" };
    if (faculty.some((f) => f.name.toLowerCase() === name.trim().toLowerCase())) {
      return { valid: false as const, error: `Faculty "${name.trim()}" already exists` };
    }
    let canServeAsLabCoordinator = false;
    if (coordinatorRaw?.trim()) {
      const normalized = coordinatorRaw.trim().toLowerCase();
      if (normalized !== "true" && normalized !== "false") {
        return { valid: false as const, error: "Lab Coordinator? must be true or false" };
      }
      canServeAsLabCoordinator = normalized === "true";
    }
    const data: Omit<Faculty, "id"> = { name: name.trim(), department: department.trim(), canServeAsLabCoordinator };
    return { valid: true as const, data };
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Faculty</h1>
          <p className="font-body text-muted-foreground">Manage teaching staff and their teaching load.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <Button onClick={() => setAddOpen(true)}>Add faculty</Button>
        </div>
      </div>

      {faculty.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-border text-center">
          <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-h3 font-semibold text-foreground">No faculty added yet</p>
            <p className="font-body text-sm text-muted-foreground">
              Faculty need to be added before subjects can be mapped.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAddOpen(true)}>Add Faculty</Button>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              Bulk Import
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Faculty</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Sections</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculty.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium text-foreground">{f.name}</TableCell>
                  <TableCell className="text-muted-foreground">{f.department}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{sectionsFor(f.id)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddFacultyDialog open={addOpen} onOpenChange={setAddOpen} />
      <BulkImportStepper<Faculty>
        open={importOpen}
        onOpenChange={setImportOpen}
        entityLabelPlural="faculty"
        columns={IMPORT_COLUMNS}
        exampleRows={IMPORT_EXAMPLE_ROWS}
        validateRow={validateFacultyRow}
        onImportRow={addFaculty}
      />
    </div>
  );
}
