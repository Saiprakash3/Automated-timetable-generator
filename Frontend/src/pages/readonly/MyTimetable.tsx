import { useState, useEffect } from "react";
import { FileText, Calendar } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useTimetableData } from "@/hooks/useTimetableData";
import { useFacultyData } from "@/hooks/useFacultyData";
import { useLabCoordinatorData } from "@/hooks/useLabCoordinatorData";
import { resolveMyEntries } from "@/lib/resolveMyEntries";
import { timetablesApi } from "@/services/api/timetables";
import type { TimetableEntry } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function periodLabel(periodStart: number, periodEnd: number) {
  return periodStart === periodEnd ? `Period ${periodStart}` : `Period ${periodStart}–${periodEnd}`;
}

export default function MyTimetable() {
  const { user } = useSession();
  const mockTimetable = useTimetableData();
  const faculty = useFacultyData();
  const coordinators = useLabCoordinatorData();

  const [apiEntries, setApiEntries] = useState<TimetableEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    timetablesApi
      .me()
      .then((res) => {
        if (isMounted && res && res.entries) {
          setApiEntries(res.entries as unknown as TimetableEntry[]);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch schedule from backend API:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!user) return null;

  const entriesToDisplay = apiEntries !== null 
    ? apiEntries 
    : (mockTimetable?.status === "published" ? resolveMyEntries(user, mockTimetable.entries, faculty, coordinators) : []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-border text-center">
        <p className="font-body text-sm text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  if (entriesToDisplay.length === 0) {
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

  const myEntries = entriesToDisplay;


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
