import { FileText, Calendar } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useTimetableData } from "@/hooks/useTimetableData";
import { useFacultyData } from "@/hooks/useFacultyData";
import { useLabCoordinatorData } from "@/hooks/useLabCoordinatorData";
import { resolveMyEntries } from "@/lib/resolveMyEntries";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function periodLabel(periodStart: number, periodEnd: number) {
  return periodStart === periodEnd ? `Period ${periodStart}` : `Period ${periodStart}–${periodEnd}`;
}

/**
 * F-08 — the primary view for Faculty, Student, Lab Coordinator, and
 * HOD-as-teacher. Mobile-first vertical day-list (DOMAIN_COMPONENTS.md §5's
 * "Mobile adaptation": each day a section header, sessions as cards
 * underneath, chronologically) — the desktop wide-grid variant
 * (INTERACTION_DECISIONS.md §10.2) isn't built; this list also works fine
 * at desktop widths, just narrower than a full grid would be.
 *
 * Card content is role-specific, matching what each role actually needs to
 * know (DOMAIN_COMPONENTS.md §10.4's own reasoning): Faculty/HOD see the
 * section they're teaching (the faculty name is always the viewer, so
 * showing it back would be noise); Lab Coordinator sees which teaching
 * Faculty they're paired with, since the coordinator is the second person,
 * not the teacher; Student sees the faculty teaching them.
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

  const isLabCoordinator = user.role === "lab_coordinator";
  const isFacultyLike = user.role === "faculty" || user.role === "hod";

  return (
    <div className="space-y-6">
      {DAYS.map((day) => {
        const dayEntries = myEntries
          .filter((e) => e.day === day)
          .sort((a, b) => a.periodStart - b.periodStart);
        if (dayEntries.length === 0) return null;

        return (
          <div key={day} className="space-y-2">
            <h2 className="font-heading text-h3 font-semibold text-foreground">{day}</h2>
            <div className="space-y-2">
              {dayEntries.map((e) => (
                <div key={e.id} className="rounded-lg border border-border bg-card p-4 shadow-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-heading text-label font-medium tracking-wide text-muted-foreground uppercase">
                      {periodLabel(e.periodStart, e.periodEnd)}
                    </p>
                    {e.type !== "regular" && (
                      <span className="font-heading text-label font-medium text-muted-foreground capitalize">
                        {e.type}
                      </span>
                    )}
                  </div>
                  <p className="font-body font-bold text-foreground">{e.subject}</p>
                  <p className="font-body text-sm text-muted-foreground">
                    {isLabCoordinator
                      ? `${e.room} · with ${e.facultyName}`
                      : isFacultyLike
                        ? `${e.section} · ${e.room}`
                        : `${e.facultyName} · ${e.room}`}
                    {e.basket ? ` · ${e.basket}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
