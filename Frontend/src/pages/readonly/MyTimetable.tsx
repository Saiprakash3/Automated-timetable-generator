import { FileText, Calendar } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useTimetableData } from "@/hooks/useTimetableData";
import { useFacultyData } from "@/hooks/useFacultyData";
import { useLabCoordinatorData } from "@/hooks/useLabCoordinatorData";
import { resolveMyEntries } from "@/lib/resolveMyEntries";
import { TimetableGrid } from "@/components/domain/TimetableGrid";
import type { TimetableEntry, User } from "@/types";

/**
 * The role-specific second line, matching `Claude design review V1.md`
 * §3.24/§3.25: on a personal schedule the faculty is always the viewer, so
 * line 2 carries *section · room* instead of the faculty name. The Lab
 * Coordinator is the exception — they're the second person on the session,
 * not the teacher, so they need to know who they're paired with.
 */
function detailFor(user: User) {
  return (entry: TimetableEntry) => {
    const basket = entry.basket ? ` · ${entry.basket}` : "";
    if (user.role === "lab_coordinator") return `${entry.room} · ${entry.facultyName}${basket}`;
    if (user.role === "faculty" || user.role === "hod") return `${entry.section} · ${entry.room}${basket}`;
    return `${entry.facultyName} · ${entry.room}${basket}`;
  };
}

/**
 * F-08 — the primary view for Faculty, Student, Lab Coordinator, and
 * HOD-as-teacher. Uses the same day×period matrix as the desktop design
 * (`Claude design review V1.md` §3.24 `HOD — My Timetable` 333:9556 and
 * §3.25's three desktop role screens), on every breakpoint: the grid keeps
 * its real proportions and scrolls horizontally on a phone rather than
 * reflowing into a different layout. This replaces the earlier vertical
 * day-list of cards — DOMAIN_COMPONENTS.md §5's "Mobile adaptation" — at
 * Prakash's request (2026-07-19), so mobile and desktop now read the same.
 *
 * Cells the viewer isn't scheduled for correctly read "Free", exactly as the
 * design's 5-sessions/25-Free HOD screen does — a personal schedule is the
 * whole week with your own sessions in it, not just a list of what you teach.
 */
export default function MyTimetable() {
  const { user } = useSession();
  const timetable = useTimetableData();
  const faculty = useFacultyData();
  const coordinators = useLabCoordinatorData();

  if (!user) return null;

  if (!timetable || timetable.status !== "published") {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-border text-center">
        <FileText className="size-10 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-heading text-h3 font-semibold text-foreground">No timetable yet</p>
          <p className="font-body text-sm text-muted-foreground">
            Your schedule will appear here once Admin publishes a timetable.
          </p>
        </div>
      </div>
    );
  }

  const myEntries = resolveMyEntries(user, timetable.entries, faculty, coordinators);

  if (myEntries.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-border text-center">
        <Calendar className="size-10 text-muted-foreground" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-heading text-h3 font-semibold text-foreground">No assignments</p>
          <p className="font-body text-sm text-muted-foreground">
            You don't have anything scheduled on the current published timetable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TimetableGrid entries={myEntries} variant="readOnly" detail={detailFor(user)} compactHeader />

      {user.role === "lab_coordinator" && (
        <p className="font-body text-sm text-muted-foreground">
          Labs you're coordinating — not counted toward teaching load.
        </p>
      )}
    </div>
  );
}
