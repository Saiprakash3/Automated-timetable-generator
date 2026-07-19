import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SetupProgressSummaryProps {
  completed: number;
  total: number;
  /** Label of the next incomplete category, for the action button's destination/copy. */
  nextIncompleteLabel?: string;
  onAction: () => void;
}

/**
 * DOMAIN_COMPONENTS.md §2 — fixed at the top of Setup Overview only, never
 * elsewhere. Ring animates on completion-state change (--duration-moderate +
 * --ease-emphasized) — the actual animation is deferred until this needs to
 * re-render from a live progress source; right now the ring is static per render.
 */
export function SetupProgressSummary({ completed, total, nextIncompleteLabel, onAction }: SetupProgressSummaryProps) {
  const pct = total === 0 ? 0 : completed / total;
  const isComplete = completed === total;
  const circumference = 2 * Math.PI * 28; // r=28, stroke 8px per spec
  const offset = circumference * (1 - pct);

  const actionLabel = completed === 0 ? "Start Setup" : isComplete ? "Generate Timetable" : "Continue Setup";
  const description = isComplete
    ? "Setup complete — timetable generation ready."
    : `${completed} of ${total} categories complete. ${total - completed} remaining before generation is available.`;

  return (
    <div className="flex items-center gap-6 rounded-lg bg-card p-6 shadow-1">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        className="shrink-0 -rotate-90 transition-[stroke-dashoffset] duration-300 ease-standard"
        role="img"
        aria-label={`${completed} of ${total} setup categories complete`}
      >
        <circle cx="32" cy="32" r="28" strokeWidth="8" fill="none" className="stroke-muted" />
        <circle
          cx="32"
          cy="32"
          r="28"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset]", isComplete ? "stroke-success-solid" : "stroke-primary")}
        />
      </svg>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-heading text-h3 font-medium text-foreground">
          {completed} of {total}
        </p>
        <p className="font-body text-sm text-muted-foreground">{description}</p>
      </div>

      <Button onClick={onAction} size="lg">
        {isComplete ? actionLabel : nextIncompleteLabel ? `${actionLabel}: ${nextIncompleteLabel}` : actionLabel}
      </Button>
    </div>
  );
}
