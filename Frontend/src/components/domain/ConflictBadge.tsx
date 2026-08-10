import { CircleX, TriangleAlert, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conflict } from "@/lib/checkEntryConflicts";

/**
 * DOMAIN_COMPONENTS.md #9 — Inline size only (used in the Cell Edit Drawer).
 * Overlay (grid-cell dot) and Summary (Post-Generation Summary Panel)
 * variants aren't built — Inline is what the Drawer actually needs, and
 * building sizes with no current caller would be speculative.
 * `--conflict-blocking-*`/`--conflict-warning-*` are the same tokens
 * StatusPill/Badge already draw on, just via the conflict-prefixed aliases.
 *
 * The message wraps rather than truncating. It used to be clamped to one line
 * behind a "View" toggle that only expanded the text — a control labelled
 * "View" that viewed nothing, sitting right next to a message naming a cell
 * the user genuinely could not reach. "View" now means what it says: it goes
 * to the colliding entry (PATTERNS.md Pattern 9.3b — the exit from a block is
 * a route onward, not dismissal).
 */
interface ConflictBadgeProps {
  conflict: Conflict;
  /** Omitted when the conflict names no specific entry (e.g. a capacity
   *  warning, which is about this cell alone and has nowhere to go). */
  onNavigate?: (target: NonNullable<Conflict["conflictingEntry"]>) => void;
}

// All three tiers from INTERACTION_DECISIONS.md §1.3. `informational` was
// specified from the start but had no visual treatment here until 2026-08-01,
// because no check produced one — so it fell through to the warning styling
// and would have read as something the user must act on.
const TIER = {
  blocking: {
    Icon: CircleX,
    className: "border-conflict-blocking-border bg-conflict-blocking-bg text-conflict-blocking-fg",
  },
  warning: {
    Icon: TriangleAlert,
    className: "border-conflict-warning-border bg-conflict-warning-bg text-conflict-warning-fg",
  },
  informational: {
    Icon: Info,
    className: "border-conflict-info-border bg-conflict-info-bg text-conflict-info-fg",
  },
} as const;

export function ConflictBadge({ conflict, onNavigate }: ConflictBadgeProps) {
  const { Icon, className } = TIER[conflict.severity];
  const target = conflict.conflictingEntry;

  return (
    <div className={cn("flex flex-col gap-1.5 rounded-sm border-2 px-2 py-1.5", className)}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="font-body text-sm">{conflict.message}</p>
      </div>

      {target && onNavigate && (
        <button
          type="button"
          onClick={() => onNavigate(target)}
          className="group/nav ml-6 flex w-fit items-center gap-1 font-body text-sm font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          View {target.section} · {target.day} P{target.periodStart}
          <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
