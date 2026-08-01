import { Outlet } from "react-router-dom";
import { LayoutGrid, Clock } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useTimetableData } from "@/hooks/useTimetableData";
import type { Role } from "@/types";

/**
 * The design's own heading per role (`Claude design review V1.md` §3.24 uses
 * "My teaching schedule" for the HOD screen). A Student isn't teaching and a
 * Lab Coordinator isn't either — they're the second person on a lab — so the
 * wording follows what the viewer is actually looking at rather than reusing
 * one teaching-specific string for everyone. Admin never reaches this shell
 * (RequireRole in App.tsx); the entry exists only to keep the map total.
 */
const TITLE: Record<Role, string> = {
  admin: "Timetable",
  hod: "My teaching schedule",
  faculty: "My teaching schedule",
  lab_coordinator: "My lab schedule",
  student: "My class schedule",
};

/**
 * COMPONENTS.md §H.3 — mobile-first (the only shell required down to a
 * 360px viewport, per Principle 7), no sidebar, no nav beyond the single
 * view every one of these four roles gets. Top bar 48px on mobile, 56px
 * from tablet up per the spec's two breakpoints — Tailwind's `sm:` (640px)
 * as the mobile/tablet cutover is close enough to the spec's own ≤640px /
 * ≥768px split that a third breakpoint isn't worth adding for 128px of
 * difference nothing else in this shell depends on.
 *
 * The page heading + "Published — as of …" caption mirror the Figma
 * read-only screens rather than §H.3's "Hi, [Name]" greeting — changed at
 * Prakash's request (2026-07-19) so mobile matches the desktop design. The
 * viewer's name moves into the top bar so a shared device still shows whose
 * schedule is on screen.
 */
export default function ReadOnlyShell() {
  const { user } = useSession();
  const timetable = useTimetableData();

  if (!user) return null;

  const isPublished = timetable?.status === "published";

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-sticky flex h-12 items-center justify-between gap-2 border-b border-border bg-background px-4 shadow-1 sm:h-14 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <LayoutGrid className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-heading text-h3 font-semibold text-foreground">Timetable</span>
        </div>
        <span className="truncate font-body text-sm text-muted-foreground">{user.name}</span>
      </header>

      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-1 pb-4">
          <h1 className="font-heading text-h2 font-semibold text-foreground">{TITLE[user.role]}</h1>
          {isPublished && timetable?.publishedAt && (
            <p className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" aria-hidden="true" />
              Published — as of {new Date(timetable.publishedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
