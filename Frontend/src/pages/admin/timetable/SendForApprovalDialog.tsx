import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { sendForApproval } from "@/hooks/useTimetableData";

interface SendForApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * PATTERNS.md §6.1 exact copy template — a plain Dialog (not Confirmation
 * Dialog), per the "known inconsistency, accepted deliberately" note there:
 * §6.1 and §6.2 (HOD Request Changes) are the same shape but use different
 * components, kept as-is rather than rebuilt to match.
 *
 * Confirming IS the trigger (INTERACTION_DECISIONS.md §11) — no external
 * step, no email, no round-trip. One call transitions status and locks the
 * timetable.
 */
export function SendForApprovalDialog({ open, onOpenChange }: SendForApprovalDialogProps) {
  const [note, setNote] = useState("");

  function reset() {
    setNote("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendForApproval(note);
    reset();
    onOpenChange(false);
    toast.success("Sent for HOD review. Waiting for approval.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="rounded-lg sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Send for approval</DialogTitle>
          <DialogDescription>
            This will lock the timetable from edits until HOD approves or requests changes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="approval-note">Note to HOD (optional)</Label>
            <Textarea
              id="approval-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Shown to HOD alongside the timetable"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send for approval</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
