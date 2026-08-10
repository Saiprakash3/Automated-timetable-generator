import { useState } from "react";
import { TriangleAlert, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Dependent } from "@/services/api/client";

/**
 * Removing a Setup record — PATTERNS.md Pattern 9.3, which branches:
 *
 *   no live dependents  → 9.3a destructive confirmation → removed
 *   has live dependents → 9.3b blocked, dependents listed → not removed
 *
 * The blocked branch is the whole reason "block on delete" is usable. A bare
 * "can't delete this" is worse than the problem it prevents, so this lists what
 * is using the record with enough detail to go and find it. Published and
 * archived timetables deliberately don't count as dependents
 * (INTERACTION_DECISIONS.md §12.4) — counting them would freeze Setup for the
 * whole term.
 */
interface DeleteRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The record's display name, e.g. "Data Structures". */
  recordName: string;
  /** The category, lower-case and singular-ish: "subject list", "faculty list". */
  categoryLabel: string;
  /** Performs the delete; resolves with the blocked outcome if refused. */
  onConfirm: () => Promise<{ ok: boolean; message?: string; dependents?: Dependent[] }>;
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  recordName,
  categoryLabel,
  onConfirm,
}: DeleteRecordDialogProps) {
  const [blocked, setBlocked] = useState<{ message?: string; dependents: Dependent[] } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    const result = await onConfirm();
    setBusy(false);
    if (result.ok) {
      onOpenChange(false);
      return;
    }
    if (result.dependents && result.dependents.length > 0) {
      setBlocked({ message: result.message, dependents: result.dependents });
      return;
    }
    // Neither removed nor blocked — the store already raised an error toast.
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) setBlocked(null);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-lg sm:max-w-md">
        {blocked ? (
          <>
            <DialogHeader>
              <Info className="size-5 text-info-500" aria-hidden="true" />
              <DialogTitle>Can't remove {recordName}</DialogTitle>
              <DialogDescription>
                {blocked.message ?? "It's still in use."} Reassign or remove those first.
              </DialogDescription>
            </DialogHeader>

            <ul className="divide-y divide-border rounded-md border border-border">
              {blocked.dependents.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="font-body text-sm text-foreground">
                    {d.count} {d.type}
                  </span>
                  {d.detail && (
                    <span className="truncate font-body text-sm text-muted-foreground" title={d.detail}>
                      {d.detail}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <TriangleAlert className="size-5 text-warning-500" aria-hidden="true" />
              <DialogTitle>Remove {recordName}?</DialogTitle>
              <DialogDescription>
                This will remove {recordName} from the {categoryLabel}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleConfirm} disabled={busy}>
                {busy ? "Removing…" : "Remove"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
