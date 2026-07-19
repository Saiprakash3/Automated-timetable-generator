import { useEffect, useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Section } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export type GridView = "day" | "week";

interface ViewControlsProps {
  view: GridView;
  onViewChange: (view: GridView) => void;
  selectedDay: string;
  onDayChange: (day: string) => void;
  sections: Section[];
  selectedSectionId: string;
  onSectionChange: (id: string) => void;
  /** Sticky offset differs by shell: AdminShell's `main` is its own scroll
   *  container with the top bar outside it (`top-0` sticks flush against
   *  it); HodShell scrolls the whole page with a sticky top bar inside the
   *  same flow (`top-14` clears it). Defaults to `top-0`. */
  stickyClassName?: string;
}

/**
 * DOMAIN_COMPONENTS.md §13 — the toolbar above the Timetable Grid. Only the
 * Full/desktop variant is built (Compact/Mobile collapse the filter+export
 * into a "More" menu / Drawer) since the Grid itself is desktop-only by
 * design (§6) — nothing today renders it below that breakpoint to collapse
 * for. Filter is the section selector already used by both Grid callers
 * (Generate.tsx, ApprovalDetail.tsx) — folded in here rather than kept as a
 * separate control, since "any dimension" resolves to just section today.
 */
export function ViewControls({
  view,
  onViewChange,
  selectedDay,
  onDayChange,
  sections,
  selectedSectionId,
  onSectionChange,
  stickyClassName = "top-0",
}: ViewControlsProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // Spec: shadow only appears "when scrolled" (i.e. once actually stuck),
  // not permanently — a 1px sentinel just above the bar flips `stuck` the
  // moment it scrolls past, no scroll-position math needed.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="print:hidden">
      <div ref={sentinelRef} className="h-px" />
      <div
        className={cn(
          "sticky z-sticky flex items-center justify-between gap-4 border-b border-border bg-background px-6 py-3",
          stickyClassName,
          stuck && "shadow-1",
        )}
      >
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {(["day", "week"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              className={cn(
                "rounded-md px-3 py-1 font-body text-sm font-medium capitalize",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-center gap-2">
          {view === "day" && (
            <Select value={selectedDay} onValueChange={onDayChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={selectedSectionId} onValueChange={onSectionChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  Year {s.year} — {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled title="Export — not built yet">
            <Download className="size-4" aria-hidden="true" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
