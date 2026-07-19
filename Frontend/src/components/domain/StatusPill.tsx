import { File, Pencil, Clock, CheckCircle2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowState } from "@/types";

export type StatusPillState = WorkflowState | "none";

const CONFIG: Record<StatusPillState, { label: string; icon: typeof File; colorClass: string }> = {
  // DOMAIN_COMPONENTS.md §1 names this `--gray-100`/`--gray-700` — FOUNDATIONS.md's
  // actual palette is called "neutral", not "gray". Same pairing as Draft; the
  // meaning-not-color rule means icon + label carry the distinction, not color.
  none: { label: "No timetable yet", icon: File, colorClass: "bg-neutral-100 text-neutral-700" },
  draft: { label: "Draft", icon: Pencil, colorClass: "bg-status-draft-bg text-status-draft-fg" },
  pending: { label: "Pending HOD Approval", icon: Clock, colorClass: "bg-status-pending-bg text-status-pending-fg" },
  approved: { label: "Approved", icon: CheckCircle2, colorClass: "bg-status-approved-bg text-status-approved-fg" },
  published: { label: "Published", icon: Globe, colorClass: "bg-status-published-bg text-status-published-fg" },
  // "rejected" isn't a Status Pill variant (DOMAIN_COMPONENTS.md §1 lists 5 states,
  // rejected routes straight back to Draft in the workflow — PATTERNS.md §4.1).
  rejected: { label: "Draft", icon: Pencil, colorClass: "bg-status-draft-bg text-status-draft-fg" },
};

interface StatusPillProps {
  state: StatusPillState;
  /** Published is the only variant with a timestamp suffix (DOMAIN_COMPONENTS.md §1). */
  publishedAt?: string;
  size?: "sm" | "default";
  className?: string;
}

export function StatusPill({ state, publishedAt, size = "default", className }: StatusPillProps) {
  const { label, icon: Icon, colorClass } = CONFIG[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-heading text-label font-semibold tracking-wide",
        size === "sm" ? "h-5" : "h-7",
        colorClass,
        className,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>
        {label}
        {state === "published" && publishedAt ? ` — ${publishedAt}` : ""}
      </span>
    </span>
  );
}
