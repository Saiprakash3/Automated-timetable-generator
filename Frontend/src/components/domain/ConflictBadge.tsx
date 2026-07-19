import { useState } from "react";
import { CircleX, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conflict } from "@/lib/checkEntryConflicts";

/**
 * DOMAIN_COMPONENTS.md #9 — Inline size only (used in the Cell Edit Drawer).
 * Overlay (grid-cell dot) and Summary (Post-Generation Summary Panel)
 * variants aren't built — Inline is what the Drawer actually needs, and
 * building sizes with no current caller would be speculative.
 * `--conflict-blocking-*`/`--conflict-warning-*` are the same tokens
 * StatusPill/Badge already draw on, just via the conflict-prefixed aliases.
 */
interface ConflictBadgeProps {
  conflict: Conflict;
}

export function ConflictBadge({ conflict }: ConflictBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const isBlocking = conflict.severity === "blocking";

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-sm border-2 px-2 py-1.5",
        isBlocking
          ? "border-conflict-blocking-border bg-conflict-blocking-bg text-conflict-blocking-fg"
          : "border-conflict-warning-border bg-conflict-warning-bg text-conflict-warning-fg",
      )}
    >
      {isBlocking ? (
        <CircleX className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <p className={cn("font-body text-sm", !expanded && "truncate")}>{conflict.message}</p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="shrink-0 font-body text-sm underline underline-offset-2"
      >
        {expanded ? "Hide" : "View"}
      </button>
    </div>
  );
}
