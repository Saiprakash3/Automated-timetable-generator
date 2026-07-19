import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addRoom } from "@/hooks/useRoomData";

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Simplest of the three Add dialogs so far — no cross-entity select (unlike
 *  Subjects' Default Faculty), no boolean toggle (unlike Faculty's switch). */
export function AddRoomDialog({ open, onOpenChange }: AddRoomDialogProps) {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  function reset() {
    setNumber("");
    setCapacity("");
  }

  const capacityNum = Number(capacity);
  const isValid = number.trim() !== "" && capacity.trim() !== "" && capacityNum > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    addRoom({ number: number.trim(), capacity: capacityNum });
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
          <DialogTitle>Add room</DialogTitle>
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
              Add room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
