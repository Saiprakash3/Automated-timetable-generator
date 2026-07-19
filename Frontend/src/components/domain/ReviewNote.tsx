import { CheckCircle2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DOMAIN_COMPONENTS.md #14 — a persistent, non-dismissible callout on the
 * Draft screen surfacing decision-critical context (HOD's decision) before
 * Admin resubmits. Only 2 of the 3 documented variants are built — Final
 * Draft Warning needs draft-count tracking (Pattern 8.2), not built yet.
 * `role="alert"` per the accessibility note: screen readers announce it on
 * appearance. No `--success-500`/`--warning-500` border tokens exist for
 * the Approved variant in this project's Tailwind mapping (only
 * `-bg`/`-fg`/`-solid` are registered) — `border-success-solid` substitutes
 * for the spec's `--success-500`, same kind of token substitution already
 * used for the Pending banner's `border-warning-500`.
 */
export type ReviewNoteVariant = "approved" | "changesRequested";

interface ReviewNoteProps {
  variant: ReviewNoteVariant;
  /** Approved: approver name. Changes Requested: not used (reason carries the detail). */
  actor?: string;
  timestamp?: string;
  /** Changes Requested only — HOD's exact reason text. */
  reason?: string;
}

export function ReviewNote({ variant, actor, timestamp, reason }: ReviewNoteProps) {
  const isApproved = variant === "approved";
  return (
    <div
      role="alert"
      className={cn(
        "space-y-1 rounded-lg border-l-4 px-4 py-3",
        isApproved
          ? "border-l-success-solid bg-success-bg text-success-fg"
          : "border-l-warning-500 bg-warning-bg text-warning-fg",
      )}
    >
      <div className="flex items-center gap-2">
        {isApproved ? (
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
        ) : (
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
        )}
        <p className="font-heading text-sm font-semibold">
          {isApproved ? "Approved" : "Changes requested"}
        </p>
      </div>
      {isApproved ? (
        <p className="font-body text-sm">
          Approved by {actor}
          {timestamp ? ` · ${new Date(timestamp).toLocaleString()}` : ""}
        </p>
      ) : (
        <p className="font-body text-sm">"{reason}"</p>
      )}
    </div>
  );
}
