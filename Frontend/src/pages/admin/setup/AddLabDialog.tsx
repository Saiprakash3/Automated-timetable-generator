import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { addLab, updateLab } from "@/hooks/useLabData";
import type { Lab } from "@/types";

interface AddLabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when set: same form, pre-filled (PATTERNS.md Pattern 9.2). */
  editing?: Lab | null;
}

export function AddLabDialog({ open, onOpenChange, editing }: AddLabDialogProps) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState("");
  const [equipment, setEquipment] = useState("");
  const [available, setAvailable] = useState(true);

  function reset() {
    setName("");
    setRoom("");
    setCapacity("");
    setEquipment("");
    setAvailable(true);
  }

  const capacityNum = Number(capacity);
  const isValid = name.trim() !== "" && room.trim() !== "" && capacity.trim() !== "" && capacityNum > 0;

  const isEdit = !!editing;

  // Pre-fill on open. A blank 'edit' form is just a second Add form:
  // you can't see what you're correcting, and untouched fields blank out.
  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setRoom(editing?.room ?? "");
    setCapacity(editing ? String(editing.capacity) : "");
    setEquipment(editing?.equipment ?? "");
    setAvailable(editing?.available ?? true);
  }, [open, editing]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const record = { name: name.trim(), room: room.trim(), capacity: capacityNum, equipment: equipment.trim(), available };
    if (editing) void updateLab(editing.id, record);
    else void addLab(record);
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
          <DialogTitle>{isEdit ? "Edit lab" : "Add lab"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="lab-name">Lab name</Label>
            <Input id="lab-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="lab-room">Room</Label>
              <Input id="lab-room" value={room} onChange={(e) => setRoom(e.target.value)} required />
            </div>
            <div className="w-24 space-y-2">
              <Label htmlFor="lab-capacity">Capacity</Label>
              <Input
                id="lab-capacity"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lab-equipment">Equipment</Label>
            <Input
              id="lab-equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="e.g. Desktop workstations"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <Label htmlFor="lab-available" className="font-normal">
              Available
            </Label>
            <Switch id="lab-available" checked={available} onCheckedChange={setAvailable} />
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              {isEdit ? "Save changes" : "Add lab"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
