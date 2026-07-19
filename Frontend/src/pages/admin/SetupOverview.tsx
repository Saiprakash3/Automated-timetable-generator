import { useNavigate } from "react-router-dom";
import { SetupProgressSummary } from "@/components/domain/SetupProgressSummary";
import { SetupChecklistRow } from "@/components/domain/SetupChecklistRow";
import { useSetupCategories, getSetupSummary } from "@/lib/setupCategories";

/** F-01 — the Setup Overview screen: progress summary + a checklist of all 9 categories. */
export default function SetupOverview() {
  const navigate = useNavigate();
  const categories = useSetupCategories();
  const { completed, total, nextIncomplete } = getSetupSummary(categories);

  function handleAction() {
    if (nextIncomplete) navigate(nextIncomplete.path);
    else navigate("/timetable");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-h1 font-semibold text-foreground">Setup</h1>
        <p className="font-body text-muted-foreground">
          Enter the master data required before a timetable can be generated.
        </p>
      </div>

      <SetupProgressSummary
        completed={completed}
        total={total}
        nextIncompleteLabel={nextIncomplete?.name}
        onAction={handleAction}
      />

      <div role="list" className="overflow-hidden rounded-lg border border-border">
        {categories.map((cat) => (
          <SetupChecklistRow
            key={cat.key}
            name={cat.name}
            description={cat.description}
            state={cat.state}
            to={cat.path}
            hint={cat.hint}
          />
        ))}
      </div>
    </div>
  );
}
