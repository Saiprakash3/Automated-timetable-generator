import { useState, type FormEvent } from "react";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { publishTimetable, deleteDraft, useArchivedDrafts } from "@/hooks/useTimetableData";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONFIRM_WORD = "Publish";

/**
 * PATTERNS.md §1.2 — Irreversible variant, type-to-confirm. Publish is the
 * one action in this whole app that gets this treatment: blast radius is
 * every read-only user, not just Admin (the line §1.2 draws against the
 * lighter §1.1 Destructive-confirm pattern used for Regenerate/Request
 * Changes). Uses the "first-ever publish" copy variant — this project's
 * combined-timetable model has no separate stored prior-published version
 * to name in a "republishing" variant.
 *
 * §8.3 point 1's bundled cleanup option lives here too: "the Publish
 * confirmation screen offers Admin the option to delete existing drafts as
 * part of the finalization step" — a single opt-in checkbox (defaulting
 * unchecked, since deleting is the one irreversible side effect here),
 * not a per-draft picker; the quoted copy ("Clean up drafts before making
 * this live") describes one bundled action, not itemized selection.
 */
export function PublishDialog({ open, onOpenChange }: PublishDialogProps) {
  const archivedDrafts = useArchivedDrafts();
  const [confirmText, setConfirmText] = useState("");
  const [cleanUpDrafts, setCleanUpDrafts] = useState(false);

  function reset() {
    setConfirmText("");
    setCleanUpDrafts(false);
  }

  const isValid = confirmText === CONFIRM_WORD;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    if (cleanUpDrafts) {
      for (const draft of archivedDrafts) deleteDraft(draft.id);
    }
    publishTimetable();
    reset();
    onOpenChange(false);
    toast.success("Timetable published. Now visible to all users.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="rounded-lg sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-5 shrink-0 text-destructive" aria-hidden="true" />
            <DialogTitle>Publish this timetable?</DialogTitle>
          </div>
          <DialogDescription>
            This will make the timetable visible to all faculty and students. Once published, republishing later
            will overwrite this version — there is no history. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {archivedDrafts.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-border px-3 py-2.5">
              <Checkbox
                id="publish-cleanup-drafts"
                checked={cleanUpDrafts}
                onCheckedChange={(checked) => setCleanUpDrafts(checked === true)}
              />
              <Label htmlFor="publish-cleanup-drafts" className="font-normal">
                Clean up drafts before making this live — permanently deletes {archivedDrafts.length} past draft
                {archivedDrafts.length === 1 ? "" : "s"}
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="publish-confirm">
              Type "{CONFIRM_WORD}" to confirm
            </Label>
            <Input
              id="publish-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!isValid}>
              Publish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
