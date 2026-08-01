import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Calendar, Settings, Circle, CircleDashed, CheckCircle2, Lock } from "lucide-react";
import { useSession, logout } from "@/hooks/useSession";
import { StatusPill } from "@/components/domain/StatusPill";
import { useTimetableData, useCanManageDrafts, DRAFTS_ANCHOR, scrollToDrafts } from "@/hooks/useTimetableData";
import { useSetupCategories, type SetupCategory } from "@/lib/setupCategories";
import type { SetupCategoryState } from "@/components/domain/SetupChecklistRow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<SetupCategoryState, typeof Circle> = {
  empty: Circle,
  partial: CircleDashed,
  complete: CheckCircle2,
  blocked: Lock,
};
const CATEGORY_ICON_CLASS: Record<SetupCategoryState, string> = {
  empty: "text-muted-foreground",
  partial: "text-warning-500",
  complete: "text-success-solid",
  blocked: "text-muted-foreground",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function useBreadcrumb(categories: SetupCategory[]): string {
  const { pathname } = useLocation();
  if (pathname === "/setup") return "Setup";
  const category = categories.find((c) => c.path === pathname);
  if (category) return `Setup / ${category.name}`;
  if (pathname === "/timetable") return "Timetable";
  return "";
}

/**
 * COMPONENTS.md §H.1 — 240px sidebar (fixed, no collapsed/mobile variant per
 * Principle 7 — Admin doesn't need mobile) + 56px top bar + scrolling content.
 */
export default function AdminShell() {
  const { user } = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const categories = useSetupCategories();
  const breadcrumb = useBreadcrumb(categories);
  const timetable = useTimetableData();
  const canManageDrafts = useCanManageDrafts();

  // RequireAuth in App.tsx already guards this route; the check here is
  // purely to satisfy TypeScript's null-narrowing for `user.*` below.
  if (!user) return null;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-svh bg-background">
      <aside className="flex min-h-0 w-60 shrink-0 flex-col border-r border-border bg-muted print:hidden">
        <div className="flex items-center gap-2 px-6 py-4">
          <LayoutGrid className="size-5 text-primary" aria-hidden="true" />
          <span className="font-heading text-h3 font-semibold text-foreground">Timetable</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-3 py-2 font-heading text-label font-medium tracking-wide text-muted-foreground uppercase">
            Setup
          </p>
          <ul className="space-y-0.5">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICON[cat.state];
              const active = pathname === cat.path;
              return (
                <li key={cat.key}>
                  <Link
                    to={cat.path}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 font-body text-sm",
                      active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-background",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", CATEGORY_ICON_CLASS[cat.state])} aria-hidden="true" />
                    <span className="truncate">{cat.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-2 border-t border-border" />

          <Link
            to="/timetable"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 font-body text-sm",
              pathname === "/timetable" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-background",
            )}
          >
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            <span>Timetable</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-medium text-primary">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-body text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate font-body text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>
          <Settings className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-sticky flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6 print:hidden">
          <p className="font-body text-sm text-muted-foreground">{breadcrumb}</p>
          <div className="flex items-center gap-4">
            <StatusPill
              state={timetable?.status ?? "none"}
              onClick={
                canManageDrafts
                  ? () => {
                      // Already there: scroll directly. Navigating instead
                      // would be a no-op the second time, since the hash
                      // wouldn't change and the page's effect wouldn't re-fire.
                      if (pathname === "/timetable") scrollToDrafts();
                      else navigate(`/timetable#${DRAFTS_ANCHOR}`);
                    }
                  : undefined
              }
              actionLabel={canManageDrafts ? "View draft history" : undefined}
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {initials(user.name)}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
