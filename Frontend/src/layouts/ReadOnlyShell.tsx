import { Outlet } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useTimetableData } from "@/hooks/useTimetableData";

/**
 * COMPONENTS.md §H.3 — mobile-first (the only shell required down to a
 * 360px viewport, per Principle 7), no sidebar, no nav beyond the single
 * view every one of these four roles gets. Top bar 48px on mobile, 56px
 * from tablet up per the spec's two breakpoints — Tailwind's `sm:` (640px)
 * as the mobile/tablet cutover is close enough to the spec's own ≤640px /
 * ≥768px split that a third breakpoint isn't worth adding for 128px of
 * difference nothing else in this shell depends on.
 */
export default function ReadOnlyShell() {
  const { user } = useSession();
  const timetable = useTimetableData();

  if (!user) return null;

  const isPublished = timetable?.status === "published";

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-sticky flex h-12 items-center gap-2 border-b border-border bg-background px-4 shadow-1 sm:h-14 sm:px-6">
        <LayoutGrid className="size-5 text-primary" aria-hidden="true" />
        <span className="font-heading text-h3 font-semibold text-foreground">Timetable</span>
      </header>

      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-1 pb-4">
          <p className="font-heading text-h2 font-semibold text-foreground">Hi, {user.name}</p>
          {isPublished && timetable?.publishedAt && (
            <p className="font-body text-sm text-muted-foreground">
              Published — as of {new Date(timetable.publishedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
