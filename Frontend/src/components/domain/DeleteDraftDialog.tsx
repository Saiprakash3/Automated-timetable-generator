import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { deleteDraft } from "@/hooks/useTimetableData";

interface DeleteDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftId: string;
  draftNumber: number;
  onDeleted?: () => void;
}

/**
 * PATTERNS.md §8.3 — Confirmation Dialog, Destructive variant per §1.1 (no
 * type-to-confirm; deleting one bounded object only Admin sees, not §1.2's
 * blast radius). Copy is the exact template — "This cannot be undone"
 * without the dropped "you can re-add it later" promise §1.1 also removed.
 */
export function DeleteDraftDialog({ open, onOpenChange, draftId, draftNumber, onDeleted }: DeleteDraftDialogProps) {
  function handleConfirm() {
    deleteDraft(draftId);
    onOpenChange(false);
    onDeleted?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-lg sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete this draft?</DialogTitle>
          <DialogDescription>
            This will permanently remove Draft {draftNumber} from the timetable history. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Delete draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
