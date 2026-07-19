import { Circle, CircleDashed, CheckCircle2, Lock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type SetupCategoryState = "empty" | "partial" | "complete" | "blocked";

interface SetupChecklistRowProps {
  name: string;
  /** Description when actionable; the dependency reason when blocked. */
  description: string;
  state: SetupCategoryState;
  to: string;
  /** Shown on hover for non-blocked rows (DOMAIN_COMPONENTS.md §3 "Behavior"). */
  hint?: string;
}

const STATE_ICON: Record<SetupCategoryState, typeof Circle> = {
  empty: Circle,
  partial: CircleDashed,
  complete: CheckCircle2,
  blocked: Lock,
};

const STATE_ICON_CLASS: Record<SetupCategoryState, string> = {
  empty: "text-muted-foreground",
  partial: "text-warning-500",
  complete: "text-success-solid",
  blocked: "text-muted-foreground",
};

export function SetupChecklistRow({ name, description, state, to, hint }: SetupChecklistRowProps) {
  const Icon = STATE_ICON[state];
  const isBlocked = state === "blocked";

  const content = (
    <div
      className={cn(
        "group flex items-center gap-4 border-b border-border px-6 py-4",
        isBlocked ? "bg-muted" : "hover:bg-muted",
        state === "partial" && "border-l-4 border-l-warning-500",
      )}
    >
      <Icon className={cn("size-6 shrink-0", STATE_ICON_CLASS[state])} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-h3 font-medium text-foreground">{name}</p>
        <p className="font-body text-sm text-muted-foreground">{description}</p>
      </div>
      {!isBlocked && hint && (
        <span className="font-body text-sm text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {hint}
        </span>
      )}
      {!isBlocked && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </div>
  );

  // Blocked: not clickable, no chevron, no hover hint (DOMAIN_COMPONENTS.md §3 "Behavior").
  if (isBlocked) {
    return (
      <div role="listitem" aria-disabled="true">
        {content}
      </div>
    );
  }
  return (
    <Link to={to} role="listitem">
      {content}
    </Link>
  );
}
