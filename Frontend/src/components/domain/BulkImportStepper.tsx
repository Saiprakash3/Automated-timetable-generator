import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileDown, Upload, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { parseCsv } from "@/lib/parseCsv";

export interface BulkImportColumn {
  key: string;
  label: string;
  required: boolean;
}

interface RowValidation<T> {
  valid: boolean;
  error?: string;
  data?: Omit<T, "id">;
}

interface BulkImportStepperProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Plural, lowercase — used in copy like "3 rows will be added to faculty". */
  entityLabelPlural: string;
  columns: BulkImportColumn[];
  exampleRows: string[][];
  /** Cells in column order (matching `columns`), for one data row. */
  validateRow: (cells: string[]) => RowValidation<T>;
  onImportRow: (data: Omit<T, "id">) => void;
}

type Step = 1 | 2 | 3 | 4;

interface ParsedRow<T> {
  /** 1-indexed file line number, header counted as row 1 (Pattern 3.1's "Row [N]" copy). */
  rowNumber: number;
  cells: string[];
  validation: RowValidation<T>;
}

const STEP_TITLES: Record<Step, string> = {
  1: "Template",
  2: "Upload",
  3: "Validate",
  4: "Confirm",
};

/**
 * DOMAIN_COMPONENTS.md §12 — generic over an entity's column schema and
 * row validator so any Setup category could plug in its own; only Faculty
 * wires it up for now (FacultySetup.tsx), the same "build one fully, leave
 * the rest disabled" scope decision this session has used throughout.
 *
 * Cannot advance past Step 3 if zero rows are valid (spec's own rule) —
 * enforced by disabling Continue, not by hiding the button.
 */
export function BulkImportStepper<T>({
  open,
  onOpenChange,
  entityLabelPlural,
  columns,
  exampleRows,
  validateRow,
  onImportRow,
}: BulkImportStepperProps<T>) {
  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow<T>[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter((r) => r.validation.valid);
  const errorRows = rows.filter((r) => !r.validation.valid);

  function reset() {
    setStep(1);
    setFileName(null);
    setParseError(null);
    setRows([]);
    setImporting(false);
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function downloadTemplate() {
    const header = columns.map((c) => c.key).join(",");
    const lines = [header, ...exampleRows.map((row) => row.join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityLabelPlural.replace(/\s+/g, "-")}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelected(file: File) {
    setParseError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = parseCsv(text);
      if (lines.length <= 1) {
        setParseError("No data rows found in this file.");
        setRows([]);
        return;
      }
      const dataLines = lines.slice(1);
      const parsed: ParsedRow<T>[] = dataLines.map((cells, i) => ({
        rowNumber: i + 2, // header is line 1
        cells,
        validation: validateRow(cells),
      }));
      setRows(parsed);
    };
    reader.onerror = () => setParseError("Could not read this file.");
    reader.readAsText(file);
  }

  function downloadErrorReport() {
    const header = "row,error";
    const lines = errorRows.map((r) => `${r.rowNumber},"${r.validation.error}"`);
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleConfirm() {
    setImporting(true);
    const total = validRows.length;
    const skipped = errorRows.length;
    let i = 0;
    function commitNext() {
      if (i >= total) {
        handleOpenChange(false);
        // The modal closing is the only other signal the import finished, and
        // it closes the same way Cancel does — so without this there's nothing
        // distinguishing "imported 12 rows" from "changed my mind."
        toast.success(
          `${total} ${total === 1 ? "row" : "rows"} imported.` +
            (skipped > 0 ? ` ${skipped} skipped due to errors.` : ""),
        );
        return;
      }
      const row = validRows[i];
      if (row.validation.data) onImportRow(row.validation.data);
      i++;
      setImportedCount(i);
      setTimeout(commitNext, 150);
    }
    commitNext();
  }

  const canContinueStep2 = fileName !== null && rows.length > 0 && !parseError;
  const canContinueStep3 = validRows.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[960px]">
        <DialogHeader>
          <DialogTitle>Bulk import {entityLabelPlural}</DialogTitle>
          <p className="font-body text-sm text-muted-foreground">
            Step {step} of 4: {STEP_TITLES[step]}
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <p className="font-body text-sm text-foreground">
                Download the CSV template below, fill in one row per record, then upload it in the next step.
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columns.map((c) => (
                      <TableRow key={c.key}>
                        <TableCell className="font-medium text-foreground">{c.key}</TableCell>
                        <TableCell className="text-muted-foreground">{c.required ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <FileDown className="size-4" aria-hidden="true" />
                Download template
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="font-body text-sm text-muted-foreground">
                Upload the filled-in CSV. Only .csv files are accepted, up to 5 MB.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-10 text-center">
                <Upload className="size-8 text-muted-foreground" aria-hidden="true" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Choose file
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                />
                {fileName && !parseError && (
                  <p className="font-body text-sm text-foreground">
                    {fileName} — {rows.length} row{rows.length === 1 ? "" : "s"} found
                  </p>
                )}
                {parseError && <p className="font-body text-sm text-destructive">{parseError}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="font-body text-sm text-foreground">
                {validRows.length} valid, {errorRows.length} with errors
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      {columns.map((c) => (
                        <TableHead key={c.key}>{c.label}</TableHead>
                      ))}
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell className="text-muted-foreground">{row.rowNumber}</TableCell>
                        {columns.map((c, i) => (
                          <TableCell key={c.key} className="text-foreground">
                            {row.cells[i] ?? ""}
                          </TableCell>
                        ))}
                        <TableCell>
                          {row.validation.valid ? (
                            <Badge className="bg-status-approved-bg text-status-approved-fg">
                              <CheckCircle2 className="size-3" aria-hidden="true" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive" title={`Row ${row.rowNumber}: ${row.validation.error}`}>
                              <XCircle className="size-3" aria-hidden="true" />
                              Row {row.rowNumber}: {row.validation.error}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {!importing ? (
                <>
                  <p className="font-body text-sm text-foreground">
                    {validRows.length} row{validRows.length === 1 ? "" : "s"} will be added.
                  </p>
                  {errorRows.length > 0 && (
                    <p className="font-body text-sm text-muted-foreground">
                      {errorRows.length} row{errorRows.length === 1 ? "" : "s"} have errors and will not be imported.{" "}
                      <button
                        type="button"
                        onClick={downloadErrorReport}
                        className="text-primary underline underline-offset-2"
                      >
                        Download error report
                      </button>
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <p className="font-body text-sm text-foreground">
                    Importing {importedCount} of {validRows.length}…
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-150"
                      style={{ width: `${(importedCount / validRows.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)} disabled={importing}>
            Cancel
          </Button>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => (s - 1) as Step)} disabled={importing}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={(step === 2 && !canContinueStep2) || (step === 3 && !canContinueStep3)}
            >
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={handleConfirm} disabled={importing || validRows.length === 0}>
              Import {validRows.length} row{validRows.length === 1 ? "" : "s"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
