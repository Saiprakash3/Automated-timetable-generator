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
  /**
   * Opt-in interactivity. The pill is a status *display* by default
   * (DOMAIN_COMPONENTS.md §1 defines no click behavior), so it stays a plain
   * `<span>` unless a caller has somewhere real to send the click — currently
   * only "open draft history," and only when there IS history to open. A pill
   * that looks clickable but does nothing is the exact dead-click this was
   * added to fix, so the element type follows the behavior rather than being
   * a button that's sometimes inert.
   */
  onClick?: () => void;
  /** Accessible name for the interactive variant — the visible label is the
   *  status, which doesn't describe what activating it does. */
  actionLabel?: string;
}

export function StatusPill({
  state,
  publishedAt,
  size = "default",
  className,
  onClick,
  actionLabel,
}: StatusPillProps) {
  const { label, icon: Icon, colorClass } = CONFIG[state];
  const shared = cn(
    "inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-heading text-label font-semibold tracking-wide",
    size === "sm" ? "h-5" : "h-7",
    colorClass,
    className,
  );
  // The hover underline is scoped to the label rather than sitting on the
  // button, so Published's " — {timestamp}" suffix isn't dragged into it —
  // underlining the whole "Published — Mar 15, 2:30 PM" string reads as a
  // rule through the pill rather than as an affordance on the thing you
  // click through to. Named group (`/pill`) so an ancestor's `group` can't
  // trigger it.
  const content = (
    <>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>
        <span className={cn(onClick && "underline-offset-2 group-hover/pill:underline")}>{label}</span>
        {state === "published" && publishedAt ? ` — ${publishedAt}` : ""}
      </span>
    </>
  );

  if (!onClick) return <span className={shared}>{content}</span>;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={actionLabel}
      title={actionLabel}
      className={cn(shared, "group/pill cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring")}
    >
      {content}
    </button>
  );
}
