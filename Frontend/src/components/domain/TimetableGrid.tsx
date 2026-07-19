import { Fragment } from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIME_SLOTS } from "@/lib/timeSlots";
import type { TimetableEntry } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface GridCell {
  period: number;
  span: number;
  entry: TimetableEntry | null;
}

function buildDayRow(day: string, entries: TimetableEntry[]): GridCell[] {
  const dayEntries = entries.filter((e) => e.day === day);
  const cells: GridCell[] = [];
  let period = 1;
  while (period <= 6) {
    const entry = dayEntries.find((e) => e.periodStart === period) ?? null;
    const span = entry ? entry.periodEnd - entry.periodStart + 1 : 1;
    cells.push({ period, span, entry });
    period += span;
  }
  return cells;
}

interface TimetableGridProps {
  /** Already filtered to one section — a day×period matrix only makes
   *  sense for one section at a time (DOMAIN_COMPONENTS.md §5's layout is
   *  literally "rows: days, columns: periods, cells: one session"). */
  entries: TimetableEntry[];
  variant: "edit" | "readOnly";
  selectedEntryId?: string | null;
  onCellClick?: (args: { day: string; period: number; entry: TimetableEntry | null }) => void;
  /** View Controls' Day mode (DOMAIN_COMPONENTS.md §13) — renders just this
   *  one day's row instead of the full Mon–Fri week. */
  filterDay?: string;
}

/**
 * DOMAIN_COMPONENTS.md §5/§6/§7/§8 — the real day×period matrix, replacing
 * the flat entries table Generate.tsx/ApprovalDetail.tsx used as a
 * placeholder. Desktop-only by design (§6: "designed at Admin desktop
 * breakpoints only, ≥1280px, no mobile layout for the Edit variant") — the
 * Read-Only variant's mobile day-list adaptation (§5's "Mobile adaptation")
 * isn't built here, since every current caller (Admin Draft/Approved,
 * HOD Approval Detail) is a desktop-only page already.
 */
export function TimetableGrid({ entries, variant, selectedEntryId, onCellClick, filterDay }: TimetableGridProps) {
  const isEdit = variant === "edit";
  const teachingSlots = TIME_SLOTS.filter((t) => t.type === "class");
  const days = filterDay ? DAYS.filter((d) => d === filterDay) : DAYS;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[960px] border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="w-28 border border-border p-2 text-left font-heading text-label font-semibold text-muted-foreground">
              &nbsp;
            </th>
            {teachingSlots.map((slot, i) => (
              <Fragment key={slot.period}>
                {i === 3 && (
                  <th className="w-[72px] border border-border bg-muted p-2 text-center font-heading text-label font-semibold text-muted-foreground">
                    Lunch
                  </th>
                )}
                <th className="border border-border p-2 text-center font-heading text-label font-semibold text-muted-foreground">
                  Period {slot.period}
                  <br />
                  <span className="font-normal normal-case">
                    {slot.start}–{slot.end}
                  </span>
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const cells = buildDayRow(day, entries);
            return (
              <tr key={day}>
                <th className="border border-border bg-muted p-2 text-left font-heading text-label font-semibold text-muted-foreground">
                  {day}
                </th>
                {cells.map((cell) => (
                  <Fragment key={cell.period}>
                    {cell.period === 4 && <td className="border border-border bg-muted" aria-hidden="true" />}
                    <Cell
                      day={day}
                      cell={cell}
                      isEdit={isEdit}
                      selected={isEdit && cell.entry?.id === selectedEntryId}
                      onClick={onCellClick}
                    />
                  </Fragment>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Cell({
  day,
  cell,
  isEdit,
  selected,
  onClick,
}: {
  day: string;
  cell: GridCell;
  isEdit: boolean;
  selected: boolean;
  onClick?: (args: { day: string; period: number; entry: TimetableEntry | null }) => void;
}) {
  const { entry, span, period } = cell;

  const typeClass = entry
    ? entry.type === "lab"
      ? "bg-teal-bg text-teal-fg"
      : entry.type === "elective"
        ? "bg-warning-bg text-warning-fg"
        : "bg-background text-foreground"
    : "bg-background";

  return (
    <td
      colSpan={span}
      onClick={isEdit ? () => onClick?.({ day, period, entry }) : undefined}
      className={cn(
        "h-20 border border-border p-2 align-top",
        typeClass,
        isEdit && "cursor-pointer",
        isEdit && !entry && "border-dashed",
        isEdit && !selected && "hover:bg-muted",
        selected && "border-2 border-primary bg-primary/10",
      )}
    >
      {entry ? (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1 truncate font-body text-sm font-bold" title={entry.subject}>
            {entry.type === "lab" && <FlaskConical className="size-3.5 shrink-0" aria-hidden="true" />}
            {entry.subject}
          </p>
          <p className="truncate font-body text-sm text-muted-foreground" title={entry.facultyName}>
            {entry.facultyName}
          </p>
          <p className="truncate font-heading text-label text-muted-foreground" title={entry.room}>
            {entry.room}
            {entry.basket ? ` · ${entry.basket}` : ""}
          </p>
        </div>
      ) : (
        <p className="font-body text-sm text-muted-foreground">{isEdit ? "Click to fill" : "Free"}</p>
      )}
    </td>
  );
}
