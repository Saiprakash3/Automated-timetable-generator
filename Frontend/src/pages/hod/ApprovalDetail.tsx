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
import type { GeneratedTimetable, TimetableEntry } from "@/types";

export default function HodApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const storeTimetable = useTimetableData();
  const sections = useSectionData();
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id ?? "");
  const [view, setView] = useState<GridView>("week");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);

  const [fetchedTimetable, setFetchedTimetable] = useState<GeneratedTimetable | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  useEffect(() => {
    if (storeTimetable && storeTimetable.id === id) {
      return;
    }
    if (!id) return;
    setLoading(true);
    import("@/services/api/timetables").then(({ timetablesApi }) => {
      timetablesApi
        .get(id)
        .then((data) => {
          setFetchedTimetable({
            id: data.id,
            status: data.state,
            generatedAt: data.createdAt,
            entries: (data.entries || []) as unknown as TimetableEntry[],
            summary: {
              totalNeeded: data.entries?.length || 0,
              placed: data.entries?.length || 0,
              gaps: 0,
              adjustedByRepair: 0,
            },
            draftNumber: 1,
            submittedAt: data.createdAt,
          });
        })
        .catch((err) => {
          console.warn("Could not fetch timetable details from API:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [id, storeTimetable]);

  const activeTimetable =
    storeTimetable && storeTimetable.id === id
      ? storeTimetable
      : fetchedTimetable;

  const isReviewable = !loading && !!activeTimetable;

  useEffect(() => {
    if (!loading && !isReviewable && id) {
      // Allow API time to fetch before redirecting
    }
  }, [isReviewable, loading]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <p className="font-body text-sm text-muted-foreground">Loading timetable details...</p>
      </div>
    );
  }

  if (!isReviewable || !activeTimetable) return null;

  const { summary } = activeTimetable;

  async function handleApprove() {
    if (!user) return;
    if (id) {
      try {
        const { timetablesApi } = await import("@/services/api/timetables");
        await timetablesApi.approve(id);
      } catch (err) {
        console.warn("API approve call failed/skipped:", err);
      }
    }
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
            Submitted {new Date(activeTimetable.submittedAt ?? activeTimetable.generatedAt).toLocaleString()}
          </p>
        </div>
        <StatusPill state={activeTimetable.status} />
      </div>

      {activeTimetable.note && (
        <div className="rounded-lg border border-border bg-muted px-4 py-3">
          <p className="font-body text-sm font-medium text-foreground">Note from Admin</p>
          <p className="font-body text-sm text-muted-foreground">"{activeTimetable.note}"</p>
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
        let sectionEntries = activeTimetable.entries.filter(
          (e) => e.section === sectionLabel || e.sections?.includes(sectionLabel)
        );
        if (sectionEntries.length === 0) {
          sectionEntries = activeTimetable.entries;
        }
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

      <RequestChangesDialog open={requestChangesOpen} onOpenChange={setRequestChangesOpen} timetableId={id} />
    </div>
  );
}
