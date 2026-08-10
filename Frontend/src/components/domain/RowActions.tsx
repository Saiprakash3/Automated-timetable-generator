import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Trailing per-row Edit + Delete for every Setup table (COMPONENTS.md G.1's
 * Actions column, PATTERNS.md Pattern 9.1).
 *
 * Always visible, never hover-revealed: hover-only row actions are invisible to
 * keyboard and touch users and undiscoverable on first read — the exact failure
 * this was added to fix ("there is no edit option in each step").
 *
 * `label` is required because the visible icons carry no record identity. A
 * table of twenty identical "Edit" buttons is unusable on a screen reader, so
 * each one names its own row: "Edit Data Structures".
 */
interface RowActionsProps {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function RowActions({ label, onEdit, onDelete, className }: RowActionsProps) {
  const base =
    "inline-flex size-7 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        title={`Edit ${label}`}
        className={cn(base, "text-muted-foreground hover:bg-muted hover:text-foreground")}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        title={`Delete ${label}`}
        className={cn(base, "text-destructive hover:bg-destructive/10")}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
