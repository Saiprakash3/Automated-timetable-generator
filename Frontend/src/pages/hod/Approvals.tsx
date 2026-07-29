import { useState, useEffect } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTimetableData } from "@/hooks/useTimetableData";
import { timetablesApi } from "@/services/api/timetables";
import type { TimetableMeta } from "@/types";


export default function HodApprovals() {
  const timetable = useTimetableData();
  const mockPending = timetable?.status === "pending" ? timetable : null;

  const [apiPending, setApiPending] = useState<TimetableMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    timetablesApi
      .list({ state: "pending" })
      .then((res) => {
        if (isMounted && res.timetables && res.timetables.length > 0) {
          setApiPending(res.timetables[0]);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch pending approvals from backend API:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingItem = apiPending ? { id: apiPending.id, submittedAt: apiPending.createdAt } : mockPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-h1 font-semibold text-foreground">Approvals</h1>
        <p className="font-body text-muted-foreground">Timetables waiting for your review.</p>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-border text-center">
          <p className="font-body text-sm text-muted-foreground">Loading pending approvals...</p>
        </div>
      ) : !pendingItem ? (
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
          to={`/approvals/${pendingItem.id}`}
          className="flex items-center justify-between gap-4 rounded-lg border border-border px-6 py-4 hover:bg-muted"
        >
          <div>
            <p className="font-heading text-h3 font-medium text-foreground">Timetable</p>
            <p className="font-body text-sm text-muted-foreground">
              Submitted {new Date(pendingItem.submittedAt ?? Date.now()).toLocaleString()}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

