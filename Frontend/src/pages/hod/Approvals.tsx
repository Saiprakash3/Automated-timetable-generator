import { Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTimetableData } from "@/hooks/useTimetableData";

/**
 * F-04 step 2: "a queue of one is expected" — the combined-timetable model
 * means this list only ever shows 0 or 1 item, but stays list-shaped in
 * case that ever changes. Empty state is PATTERNS.md §5.1's
 * Waiting-for-others sub-pattern (clock icon, no CTA — "a waiting state has
 * nothing for the user to do"), not the Zero-state pattern every setup page
 * uses, since there's genuinely no action HOD can take to make something
 * appear here.
 */
export default function HodApprovals() {
  const timetable = useTimetableData();
  const pending = timetable?.status === "pending" ? timetable : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-h1 font-semibold text-foreground">Approvals</h1>
        <p className="font-body text-muted-foreground">Timetables waiting for your review.</p>
      </div>

      {!pending ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-border text-center">
          <Clock className="size-10 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-heading text-h3 font-semibold text-foreground">Nothing to review right now</p>
            <p className="font-body text-sm text-muted-foreground">
              You'll see it here as soon as Admin sends a timetable for approval.
            </p>
          </div>
        </div>
      ) : (
        <Link
          to={`/approvals/${pending.id}`}
          className="flex items-center justify-between gap-4 rounded-lg border border-border px-6 py-4 hover:bg-muted"
        >
          <div>
            <p className="font-heading text-h3 font-medium text-foreground">Timetable</p>
            <p className="font-body text-sm text-muted-foreground">
              Submitted {new Date(pending.submittedAt ?? pending.generatedAt).toLocaleString()}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
