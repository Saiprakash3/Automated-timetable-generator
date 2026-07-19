import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { StatusPill } from "@/components/domain/StatusPill";
import { Button } from "@/components/ui/button";
import { TimetableGrid } from "@/components/domain/TimetableGrid";
import { ViewControls, type GridView } from "@/components/domain/ViewControls";
import { useTimetableData, approveTimetable } from "@/hooks/useTimetableData";
import { useSectionData } from "@/hooks/useSectionData";
import { useSession } from "@/hooks/useSession";
import { RequestChangesDialog } from "./RequestChangesDialog";

/**
 * F-04 steps 3–6: the read-only detail view HOD reviews before deciding.
 * Admin's optional note shown at top (F-04 step 3), same post-generation
 * summary Admin saw, and the real read-only Timetable Grid (§5) — same
 * component Generate.tsx uses in its Edit variant, just without a cell
 * click handler here (Principle 5: read-only and editable are designed
 * states, not variations of one component with a flag toggled on).
 */
export default function HodApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const timetable = useTimetableData();
  const sections = useSectionData();
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id ?? "");
  const [view, setView] = useState<GridView>("week");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);

  // Guard: only a pending timetable matching this id is reviewable here.
  // Anything else (already decided, wrong id, or none at all) has nothing
  // left to review — back to the list. Redirect lives in an effect, not the
  // render body: this fires while still mounted (e.g. right after HOD's own
  // Request Changes submit flips status away from "pending"), and calling
  // navigate() during render throws React's "Cannot update a component
  // while rendering a different component" warning.
  const isReviewable = !!timetable && timetable.id === id && timetable.status === "pending";

  useEffect(() => {
    if (!isReviewable) navigate("/approvals", { replace: true });
  }, [isReviewable, navigate]);

  if (!isReviewable || !timetable) return null;

  const { summary } = timetable;

  function handleApprove() {
    if (!user) return;
    approveTimetable(user.name);
    toast.success("Timetable approved.");
    navigate("/approvals");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Timetable</h1>
          <p className="font-body text-muted-foreground">
            Submitted {new Date(timetable.submittedAt ?? timetable.generatedAt).toLocaleString()}
          </p>
        </div>
        <StatusPill state={timetable.status} />
      </div>

      {timetable.note && (
        <div className="rounded-lg border border-border bg-muted px-4 py-3">
          <p className="font-body text-sm font-medium text-foreground">Note from Admin</p>
          <p className="font-body text-sm text-muted-foreground">"{timetable.note}"</p>
        </div>
      )}

      <div className="space-y-2 rounded-lg bg-card p-6 shadow-1">
        <h2 className="font-heading text-h3 font-semibold text-foreground">Generation summary</h2>
        <p className="font-body text-sm text-success-solid">
          {summary.placed} of {summary.totalNeeded} sessions placed successfully
        </p>
        {summary.gaps > 0 && (
          <p className="font-body text-sm text-warning-500">
            {summary.gaps} unresolved {summary.gaps === 1 ? "gap" : "gaps"} requiring manual attention
          </p>
        )}
      </div>

      <ViewControls
        view={view}
        onViewChange={setView}
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
        sections={sections}
        selectedSectionId={selectedSectionId}
        onSectionChange={setSelectedSectionId}
        stickyClassName="top-14"
      />

      {(() => {
        const section = sections.find((s) => s.id === selectedSectionId);
        const sectionLabel = section ? `${section.year}${section.name}` : "";
        const sectionEntries = timetable.entries.filter(
          (e) => e.section === sectionLabel || e.sections?.includes(sectionLabel),
        );
        return (
          <TimetableGrid
            entries={sectionEntries}
            variant="readOnly"
            filterDay={view === "day" ? selectedDay : undefined}
          />
        );
      })()}

      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="destructive" onClick={() => setRequestChangesOpen(true)}>
          Request changes
        </Button>
        <Button onClick={handleApprove}>Approve</Button>
      </div>

      <RequestChangesDialog open={requestChangesOpen} onOpenChange={setRequestChangesOpen} />
    </div>
  );
}
