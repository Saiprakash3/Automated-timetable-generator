import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Lock, TriangleAlert, Trash2, Clock } from "lucide-react";
import { StatusPill } from "@/components/domain/StatusPill";
import { Button } from "@/components/ui/button";
import { TimetableGrid } from "@/components/domain/TimetableGrid";
import { CellEditDrawer } from "@/components/domain/CellEditDrawer";
import { ViewControls, type GridView } from "@/components/domain/ViewControls";
import { DeleteDraftDialog } from "@/components/domain/DeleteDraftDialog";
import {
  useTimetableData,
  useArchivedDrafts,
  useCanOpenDraftHistory,
  setGeneratedTimetable,
  DRAFTS_ANCHOR,
  scrollToDrafts,
} from "@/hooks/useTimetableData";
import { useSetupCategories, getSetupSummary } from "@/lib/setupCategories";
import { resolveConflictTarget, type ConflictTarget } from "@/lib/resolveConflictTarget";
import { useSectionData } from "@/hooks/useSectionData";
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
/**
 * PATTERNS.md §4.2's Pending → Draft (rejection) row promises Admin a warning
 * Toast "on next visit" — distinct from the persistent Review Note banner,
 * which is what actually got built. Tracking which rejections have already
 * been announced at module scope (not component state) is what makes "on next
 * visit" true: the page remounts on every navigation, so component state would
 * re-fire the same toast every single time Admin opened the screen.
 */
const announcedRejections = new Set<string>();

export default function TimetableGenerate() {
  const timetable = useTimetableData();
  const archivedDrafts = useArchivedDrafts();
  const canOpenDraftHistory = useCanOpenDraftHistory();
  const categories = useSetupCategories();
  const { completed, total, loading: setupLoading } = getSetupSummary(categories);
  const setupComplete = completed === total;

  // Only sections is still read here — it drives the grid's section picker.
  // The rest of the setup data used to be gathered to feed the client-side
  // solver fallback; generation is now the backend's job, so the page no
  // longer needs its own copy of the whole setup dataset.
  const sections = useSectionData();

  const [generating, setGenerating] = useState(false);
  const [loadingApi, setLoadingApi] = useState(true);
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  // Starts empty and is resolved below, once both the sections list and the
  // timetable have loaded. Seeding it with `sections[0]` meant the picker
  // opened on "Year 2 — A" while the loaded timetable was 3A, so the grid
  // showed an almost-empty week and looked broken.
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [view, setView] = useState<GridView>("week");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCell, setDrawerCell] = useState<{ day: string; period: number; entry: TimetableEntry | null } | null>(
    null,
  );
  const [deleteDraftId, setDeleteDraftId] = useState<string | null>(null);

  // Point the grid at the section the timetable is actually for. Entries carry
  // a `section` label like "3A"; match it back to a Section record. Falls back
  // to the first section only when nothing matches (e.g. entries with no
  // section, as the API's own rows have).
  const entrySectionLabel = timetable?.entries.find((e) => e.section)?.section;
  useEffect(() => {
    // `loadingApi` gate matters: sections and the timetable load from separate
    // requests. Without it, sections usually won the race, the label was still
    // undefined, and this defaulted to sections[0] — then refused to correct
    // itself because selectedSectionId was set.
    if (loadingApi || selectedSectionId || sections.length === 0) return;
    const match = sections.find((s) => `${s.year}${s.name}` === entrySectionLabel);
    setSelectedSectionId((match ?? sections[0]).id);
  }, [loadingApi, selectedSectionId, sections, entrySectionLabel]);

  const changesRequestedAt = timetable?.changesRequestedAt;
  useEffect(() => {
    if (!changesRequestedAt || announcedRejections.has(changesRequestedAt)) return;
    announcedRejections.add(changesRequestedAt);
    toast.warning("HOD requested changes. See message.");
  }, [changesRequestedAt]);

  // Arriving from AdminShell's Status Pill, which links here with the anchor.
  // Deferred a frame so the panel it targets has actually rendered.
  const { hash } = useLocation();
  useEffect(() => {
    if (hash !== `#${DRAFTS_ANCHOR}`) return;
    const id = requestAnimationFrame(scrollToDrafts);
    return () => cancelAnimationFrame(id);
  }, [hash]);

  useEffect(() => {
    let isMounted = true;
    timetablesApi
      .list()
      .then(async (res) => {
        if (isMounted && res.timetables && res.timetables.length > 0) {
          // Pick the most recently touched timetable, not `[0]`. The list
          // endpoint has no defined ordering, so indexing into it showed a
          // different timetable on different loads — a Draft one moment and a
          // locked Pending one the next, which reads as the lifecycle randomly
          // changing. Newest-updated is also what "the timetable I'm working
          // on" means right after a Generate/Regenerate.
          const newest = [...res.timetables].sort(
            (a, b) =>
              new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime(),
          )[0];
          const detail = await timetablesApi.get(newest.id);
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
              // `timetable_entries` has no `section` column — a timetable is
              // per-(department, year, section), so the section lives on the
              // parent row. Without stamping it here every entry arrives
              // section-less, which made the grid's section filter match
              // nothing and the picker default to the wrong section.
              entries: (detail.entries as unknown as TimetableEntry[]).map((e) => ({
                ...e,
                section: e.section || `${detail.year}${detail.section}`,
              })),
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

  /**
   * Jump the grid and the drawer to the entry a conflict names. Nothing is
   * lost by leaving: this only appears on a conflict, and a *blocking* one
   * cannot be saved anyway — the pending edit was never a candidate to keep.
   *
   * An elective's `section` is its basket label ("Basket A"), which matches no
   * section in the picker, so fall back to the first contributing section —
   * otherwise the link would silently do nothing on exactly the cross-section
   * case it exists for.
   */
  function handleNavigateToConflict(target: ConflictTarget) {
    const resolved = resolveConflictTarget(target, timetable?.entries ?? [], sections);

    if (!resolved) {
      toast.error("Can't open that entry.", {
        description: `${target.section} isn't one of the sections available here.`,
      });
      return;
    }

    setSelectedSectionId(resolved.section.id);
    if (view === "day") setSelectedDay(target.day);
    setDrawerCell({ day: target.day, period: target.periodStart, entry: resolved.entry });
    setDrawerOpen(true);
  }

  async function handleGenerate() {
    setGenerating(true);
    // The backend solver is authoritative. There used to be a fall-through to
    // the client-side generateTimetable() here, which meant a failed API call
    // silently produced a locally-invented timetable that was never persisted
    // — indistinguishable on screen from a real one, and gone on reload. A
    // generation failure has to read as a failure.
    try {
      const data = await timetablesApi.generate("CSE", 3, "A");
      if (!data) throw new Error("Generation returned no timetable");
      setGeneratedTimetable({
        id: data.id,
        status: (data.state || "draft") as WorkflowState,
        generatedAt: data.createdAt,
        summary: {
          totalNeeded: data.entries?.length || 0,
          placed: data.entries?.length || 0,
          gaps: 0,
          adjustedByRepair: 0,
        },
        entries: (data.entries || []) as unknown as TimetableEntry[],
      });
      setSummaryDismissed(false);
    } catch (err) {
      console.error("Timetable generation failed:", err);
      toast.error("Couldn't generate the timetable.", {
        description: "The backend didn't return a schedule. Check it's running, then retry.",
      });
    } finally {
      setGenerating(false);
    }
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
            {setupLoading
              ? "Checking setup…"
              : setupComplete
                ? "All setup categories are complete — ready to generate."
                : `Complete all ${total} setup categories before generating (${completed} of ${total} done).`}
          </p>
        </div>
        {/* Gated on `setupLoading` too: the categories load async, so without
            it this button sat disabled with "0 of 9 done" on every visit until
            the fetches landed — on a fully-configured install. */}
        <Button size="lg" onClick={handleGenerate} disabled={setupLoading || !setupComplete || generating}>
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
            onClick={canOpenDraftHistory ? scrollToDrafts : undefined}
            actionLabel={canOpenDraftHistory ? "View draft history" : undefined}
          />
          {/* Figma puts the lifecycle actions here, secondary-then-primary:
              Draft `120:328` is [Regenerate][Send for approval], Approved
              `130:1647` is [Regenerate][Publish]. Regenerate used to live only
              inside the Post-Generation Summary Panel, which meant clicking
              "Review Grid" dismissed the panel and took Regenerate with it —
              leaving no way to regenerate at all until reload. */}
          <div className="flex gap-2 print:hidden">
            {(isDraft || isApproved) && (
              <Button
                variant="secondary"
                onClick={handleGenerate}
                disabled={generating || isApproved}
                title={isApproved ? "Approved timetables can't be regenerated — that would discard HOD approval." : undefined}
              >
                {generating ? "Regenerating…" : "Regenerate"}
              </Button>
            )}
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
          {/* Only Review Grid here. Figma `120:328` does show [Regenerate]
              [Review Grid] in this panel, but that panel is a rich one — gaps
              list, conflicts-by-severity — where a panel-scoped Regenerate
              reads as "these results are bad, redo them". Ours renders a
              single success line, so a second Regenerate sat ~150px from the
              header's own and just read as duplication. Header wins because it
              survives dismissing this panel; deliberate deviation from Figma. */}
          <div className="flex justify-end gap-2 print:hidden">
            <Button onClick={() => setSummaryDismissed(true)}>Review Grid</Button>
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
        let sectionEntries = timetable.entries.filter(
          (e) => e.section === sectionLabel || e.sections?.includes(sectionLabel),
        );
        if (sectionEntries.length === 0) {
          sectionEntries = timetable.entries;
        }
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

      {/* Renders whenever draft history is reachable, empty or not. It used to
          require `archivedDrafts.length > 0`, so the Status Pill's own
          destination silently didn't exist until a draft had been archived —
          the pill pointed at nothing. PATTERNS.md §8.4 / Figma `548:11261`. */}
      {canOpenDraftHistory && (
        <div id={DRAFTS_ANCHOR} className="space-y-3 rounded-lg border border-border p-4 print:hidden">
          <h2 className="font-heading text-h3 font-semibold text-foreground">Draft history</h2>
          <p className="font-body text-sm text-muted-foreground">
            Past drafts HOD has already reviewed, kept for comparison. Deleting one removes it permanently.
          </p>
          {archivedDrafts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-md border border-border px-4 py-8 text-center">
              <Clock className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-heading text-h3 font-semibold text-foreground">No drafts yet</p>
              {/* Names what will populate it, not just that it's empty — "No
                  drafts yet" alone leaves the user unsure whether the feature
                  is broken, not permitted, or merely unused. */}
              <p className="max-w-md font-body text-sm text-muted-foreground">
                Currently there are no drafts. A draft is kept here once HOD reviews a version and you regenerate, so
                you can compare them.
              </p>
            </div>
          ) : (
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
          )}
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
              onNavigateToEntry={handleNavigateToConflict}
            />
          );
        })()}
    </div>
  );
}
