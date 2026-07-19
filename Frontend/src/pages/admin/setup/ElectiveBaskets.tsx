import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useElectiveBasketData } from "@/hooks/useElectiveBasketData";
import { useSubjectData } from "@/hooks/useSubjectData";
import { useSectionData } from "@/hooks/useSectionData";
import { TIME_SLOTS } from "@/lib/timeSlots";

const YEARS = [3, 4];

/**
 * List/overview page — grouped by year (3rd/4th, the only years electives
 * apply to per PROJECT_BRIEF.md). "Add basket" navigates to the dedicated
 * configuration screen (ElectiveBasketConfig.tsx) rather than opening the
 * shared Add-record Dialog every other setup category uses — this category
 * doesn't use that shared modal (FIGMA_BUILD_CHECKLIST.md lists them
 * separately).
 */
export default function ElectiveBasketsSetup() {
  const navigate = useNavigate();
  const baskets = useElectiveBasketData();
  const subjects = useSubjectData();
  const sections = useSectionData();

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;
  const sectionName = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    return sec ? `${sec.year}${sec.name}` : id;
  };
  const periodLabel = (period: number) => {
    const slot = TIME_SLOTS.find((t) => t.period === period);
    return slot ? `${slot.label} · ${slot.start}–${slot.end}` : `Period ${period}`;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-h1 font-semibold text-foreground">Elective Baskets</h1>
          <p className="font-body text-muted-foreground">Configure elective groupings for 3rd and 4th year.</p>
        </div>
        <Button onClick={() => navigate("/setup/elective-baskets/new")}>Add basket</Button>
      </div>

      {YEARS.map((year) => {
        const yearBaskets = baskets.filter((b) => b.year === year);
        return (
          <div key={year} className="space-y-3">
            <h2 className="font-heading text-h3 font-semibold text-foreground">Year {year}</h2>

            {yearBaskets.length === 0 ? (
              <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border border-border text-center">
                <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
                <p className="font-body text-sm text-muted-foreground">No baskets configured for Year {year} yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {yearBaskets.map((b) => (
                  <div key={b.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{b.name}</span>
                      <span className="font-body text-sm text-muted-foreground">{periodLabel(b.period)}</span>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      Sections: {b.sectionIds.map(sectionName).join(", ")}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      Electives: {b.electives.map((e) => subjectName(e.subjectId)).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
