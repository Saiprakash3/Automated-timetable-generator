import { useState, useEffect } from "react";
import { Lock, TriangleAlert, Trash2 } from "lucide-react";
import { StatusPill } from "@/components/domain/StatusPill";
import { Button } from "@/components/ui/button";
import { TimetableGrid } from "@/components/domain/TimetableGrid";
import { CellEditDrawer } from "@/components/domain/CellEditDrawer";
import { ViewControls, type GridView } from "@/components/domain/ViewControls";
import { DeleteDraftDialog } from "@/components/domain/DeleteDraftDialog";
import { useTimetableData, useArchivedDrafts, setGeneratedTimetable } from "@/hooks/useTimetableData";
import { useSetupCategories, getSetupSummary } from "@/lib/setupCategories";
import { generateTimetable } from "@/lib/generateTimetable";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useSectionData } from "@/hooks/useSectionData";
import { useFacultyData } from "@/hooks/useFacultyData";
import { useRoomData } from "@/hooks/useRoomData";
import { useLabData } from "@/hooks/useLabData";
import { useLabCoordinatorData } from "@/hooks/useLabCoordinatorData";
import { useSubjectFacultyMappingData } from "@/hooks/useSubjectFacultyMappingData";
import { useElectiveBasketData } from "@/hooks/useElectiveBasketData";
import { SendForApprovalDialog } from "./SendForApprovalDialog";
import { PublishDialog } from "./PublishDialog";
import { ReviewNote } from "@/components/domain/ReviewNote";
import { timetablesApi } from "@/services/api/timetables";
import type { TimetableEntry, WorkflowState } from "@/types";

/**
 * F-02 steps 1–7 + F-05: the "No timetable yet" trigger state, the Generate
 * action (gated on Setup being complete, per F-02's precondition), the
 * resulting Draft + Post-Generation Summary Panel (DOMAIN_COMPONENTS.md
 * §11), Send for Approval (PATTERNS.md §6.1) transitioning Draft → Pending
 * HOD Approval with a locked read-only banner (Pattern 4.1's state table),
 * and Publish (PATTERNS.md §1.2, type-to-confirm) transitioning Approved →
 * Published with a persistent timestamp. The real Timetable Grid (§5/§6)
 * and Cell Edit Drawer (§10) render one section at a time — see
 * TimetableGrid.tsx's own note on why a day×period matrix is inherently
 * per-section, not a flat list of every entry across every section.
 *
 * No Pattern 8.1 generation-gating Toast ("Can't generate — waiting for
 * HOD's response") yet — Generate/Regenerate are simply hidden once status
 * isn't Draft, since there's no way to "attempt" the blocked action through
 * this UI. Add the Toast once a path to attempt it anyway exists (e.g. a
 * kept keyboard shortcut).
 */
export default function TimetableGenerate() {
  const timetable = useTimetableData();
  const archivedDrafts = useArchivedDrafts();
  const categories = useSetupCategories();
  const { completed, total } = getSetupSummary(categories);
  const setupComplete = completed === total;

  const subjects = useSubjectData();
  const sections = useSectionData();
  const faculty = useFacultyData();
  const rooms = useRoomData();
  const labs = useLabData();
  const coordinators = useLabCoordinatorData();
  const mappings = useSubjectFacultyMappingData();
  const baskets = useElectiveBasketData();

  const [generating, setGenerating] = useState(false);
  const [loadingApi, setLoadingApi] = useState(true);
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id ?? "");
  const [view, setView] = useState<GridView>("week");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCell, setDrawerCell] = useState<{ day: string; period: number; entry: TimetableEntry | null } | null>(
    null,
  );
  const [deleteDraftId, setDeleteDraftId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    timetablesApi
      .list()
      .then(async (res) => {
        if (isMounted && res.timetables && res.timetables.length > 0) {
          // Get details of the first timetable found (or active one)
          const detail = await timetablesApi.get(res.timetables[0].id);
          if (isMounted && detail) {
            setGeneratedTimetable({
              id: detail.id,
              status: (detail.state || "draft") as WorkflowState,
              generatedAt: detail.createdAt,
              summary: {
                totalNeeded: detail.entries.length,
                placed: detail.entries.length,
                gaps: 0,
                adjustedByRepair: 0,
              },
              entries: detail.entries as unknown as TimetableEntry[],
              approvedBy: detail.approvedBy || undefined,
              publishedAt: detail.publishedAt || undefined,
            });
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load timetables from backend API:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingApi(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleGenerate() {
    setGenerating(true);
    // Brief artificial delay so the loading state is visible — the
    // placement algorithm itself runs synchronously and is effectively instant.
    setTimeout(() => {
      const result = generateTimetable({ subjects, sections, faculty, rooms, labs, coordinators, mappings, baskets });
      setGeneratedTimetable(result);
      setSummaryDismissed(false);
      setGenerating(false);
    }, 600);
  }

  if (loadingApi) {
    return <div className="mx-auto max-w-2xl py-16 text-center text-muted-foreground">Loading timetable...</div>;
  }

  if (!timetable) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
        <StatusPill state="none" />
        <div className="space-y-1">
          <h1 className="font-heading text-h1 font-semibold text-foreground">No timetable yet</h1>
          <p className="font-body text-muted-foreground">
            {setupComplete
              ? "All setup categories are complete — ready to generate."
              : `Complete all 9 setup categories before generating (${completed} of ${total} done).`}
          </p>
        </div>
        <Button size="lg" onClick={handleGenerate} disabled={!setupComplete || generating}>
          {generating ? "Generating…" : "Generate Timetable"}
        </Button>
      </div>
    );
  }

  const { summary } = timetable;
  const isDraft = timetable.status === "draft";
  const isPending = timetable.status === "pending";
  const isApproved = timetable.status === "approved";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Timetable</h1>
          <p className="font-body text-muted-foreground">
            Generated {new Date(timetable.generatedAt).toLocaleString()}
            {isDraft ? ` · Draft ${timetable.draftNumber}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill
            state={timetable.status}
            publishedAt={timetable.publishedAt ? new Date(timetable.publishedAt).toLocaleString() : undefined}
          />
          <div className="flex gap-2 print:hidden">
            {isDraft && <Button onClick={() => setSendDialogOpen(true)}>Send for Approval</Button>}
            {isApproved && <Button onClick={() => setPublishDialogOpen(true)}>Publish</Button>}
          </div>
        </div>
      </div>

      {isPending && (
        <div className="space-y-2 rounded-lg border border-warning-500 bg-status-pending-bg px-4 py-3 text-status-pending-fg">
          <div className="flex items-center gap-3">
            <Lock className="size-4 shrink-0" aria-hidden="true" />
            <p className="font-body text-sm">Waiting for HOD response — edits disabled.</p>
          </div>
          {timetable.note && <p className="font-body text-sm italic">Note to HOD: "{timetable.note}"</p>}
        </div>
      )}

      {isDraft && timetable.draftNumber === 3 && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/10 px-4 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <p className="font-body text-sm text-destructive">
            This is your final draft. Review all changes carefully before resubmitting — HOD has already reviewed
            two versions.
          </p>
        </div>
      )}

      {isApproved && timetable.approvedBy && (
        <ReviewNote variant="approved" actor={timetable.approvedBy} timestamp={timetable.approvedAt} />
      )}
      {isDraft && timetable.changesRequestedReason && (
        <ReviewNote variant="changesRequested" reason={timetable.changesRequestedReason} />
      )}

      {!summaryDismissed && (
        <div className="space-y-4 rounded-lg bg-card p-6 shadow-1">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-h3 font-semibold text-foreground">Generation complete</h2>
            <button
              type="button"
              onClick={() => setSummaryDismissed(true)}
              className="font-body text-sm text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
          <p className="font-body text-sm text-success-solid">
            {summary.placed} of {summary.totalNeeded} sessions placed successfully
          </p>
          {summary.gaps > 0 && (
            <p className="font-body text-sm text-warning-500">
              {summary.gaps} unresolved {summary.gaps === 1 ? "gap" : "gaps"} requiring manual attention
            </p>
          )}
          {summary.adjustedByRepair > 0 && (
            <p className="font-body text-sm text-muted-foreground">
              {summary.adjustedByRepair} {summary.adjustedByRepair === 1 ? "placement" : "placements"} adjusted by
              the repair pass
            </p>
          )}
          <div className="flex gap-2 print:hidden">
            <Button onClick={() => setSummaryDismissed(true)}>Review Grid</Button>
            {isDraft && (
              <Button variant="secondary" onClick={handleGenerate} disabled={generating}>
                {generating ? "Regenerating…" : "Regenerate"}
              </Button>
            )}
          </div>
        </div>
      )}

      <ViewControls
        view={view}
        onViewChange={setView}
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
        sections={sections}
        selectedSectionId={selectedSectionId}
        onSectionChange={setSelectedSectionId}
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
            variant={isDraft ? "edit" : "readOnly"}
            selectedEntryId={drawerCell?.entry?.id ?? null}
            filterDay={view === "day" ? selectedDay : undefined}
            onCellClick={(cell) => {
              setDrawerCell(cell);
              setDrawerOpen(true);
            }}
          />
        );
      })()}

      {!isPending && !isApproved && archivedDrafts.length > 0 && (
        <div className="space-y-3 rounded-lg border border-border p-4 print:hidden">
          <h2 className="font-heading text-h3 font-semibold text-foreground">Manage drafts</h2>
          <p className="font-body text-sm text-muted-foreground">
            Past drafts HOD has already reviewed, kept for comparison. Deleting one removes it permanently.
          </p>
          <ul className="space-y-2">
            {archivedDrafts.map((draft) => (
              <li
                key={draft.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
              >
                <span className="font-body text-sm text-foreground">
                  Draft {draft.draftNumber} — {new Date(draft.generatedAt).toLocaleString()}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setDeleteDraftId(draft.id)}>
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SendForApprovalDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} />
      <PublishDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen} />
      {deleteDraftId &&
        (() => {
          const draft = archivedDrafts.find((d) => d.id === deleteDraftId);
          if (!draft) return null;
          return (
            <DeleteDraftDialog
              open={!!deleteDraftId}
              onOpenChange={(next) => !next && setDeleteDraftId(null)}
              draftId={draft.id}
              draftNumber={draft.draftNumber}
            />
          );
        })()}
      {drawerCell &&
        (() => {
          const section = sections.find((s) => s.id === selectedSectionId);
          return (
            <CellEditDrawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              day={drawerCell.day}
              period={drawerCell.period}
              entry={drawerCell.entry}
              sectionLabel={section ? `${section.year}${section.name}` : ""}
              sectionStudentCount={section?.studentCount}
              allEntries={timetable.entries}
            />
          );
        })()}
    </div>
  );
}
