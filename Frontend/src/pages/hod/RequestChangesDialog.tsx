import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { requestTimetableChanges } from "@/hooks/useTimetableData";
import { useSession } from "@/hooks/useSession";

interface RequestChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * PATTERNS.md §6.2 exact copy template. Reason is required — the button
 * stays disabled until non-empty, per F-04's "reduces accidental clicks"
 * error-recovery note. Labeled "Request changes" throughout (not "Reject")
 * — collaborative framing, same underlying Pending → Draft transition.
 */
export function RequestChangesDialog({ open, onOpenChange }: RequestChangesDialogProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");

  function reset() {
    setReason("");
  }

  const isValid = reason.trim() !== "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !user) return;
    requestTimetableChanges(reason, user.name);
    reset();
    onOpenChange(false);
    toast.warning("Changes requested. Admin will see your reason on their Draft screen.", { duration: 5000 });
    navigate("/approvals");
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
          <DialogTitle>Request changes to this timetable?</DialogTitle>
          <DialogDescription>
            This will return the timetable to Draft state for Admin to revise. Please explain what needs to change.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="changes-reason">Reason for changes (required)</Label>
            <Textarea id="changes-reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!isValid}>
              Request changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
