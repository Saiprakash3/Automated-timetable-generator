import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addRoom, updateRoom } from "@/hooks/useRoomData";
import type { Room } from "@/types";

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when set: same form, pre-filled (PATTERNS.md Pattern 9.2). */
  editing?: Room | null;
}

/** Simplest of the three Add dialogs so far — no cross-entity select (unlike
 *  Subjects' Default Faculty), no boolean toggle (unlike Faculty's switch). */
export function AddRoomDialog({ open, onOpenChange, editing }: AddRoomDialogProps) {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  function reset() {
    setNumber("");
    setCapacity("");
  }

  const capacityNum = Number(capacity);
  const isValid = number.trim() !== "" && capacity.trim() !== "" && capacityNum > 0;

  const isEdit = !!editing;

  // Pre-fill on open. A blank 'edit' form is just a second Add form:
  // you can't see what you're correcting, and untouched fields blank out.
  useEffect(() => {
    if (!open) return;
    setNumber(editing?.number ?? "");
    setCapacity(editing ? String(editing.capacity) : "");
  }, [open, editing]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const record = { number: number.trim(), capacity: capacityNum };
    if (editing) void updateRoom(editing.id, record);
    else void addRoom(record);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="rounded-lg sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit room" : "Add room"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="room-number">Room</Label>
            <Input id="room-number" value={number} onChange={(e) => setNumber(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-capacity">Capacity</Label>
            <Input
              id="room-capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              {isEdit ? "Save changes" : "Add room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
