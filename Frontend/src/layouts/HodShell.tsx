import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Calendar, ClipboardCheck } from "lucide-react";
import { useSession, logout } from "@/hooks/useSession";
import { useTimetableData } from "@/hooks/useTimetableData";
import { StatusPill } from "@/components/domain/StatusPill";
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

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * COMPONENTS.md §H.2 — HOD's job here is narrower than Admin's (approvals +
 * own teaching schedule), so the shell is a single top bar with no sidebar:
 * "HOD needs a clean review-and-approve experience, not a configuration
 * screen" (audit §3.3). Approvals only shows a count badge when something's
 * pending — hidden entirely at zero, matching INFORMATION_ARCHITECTURE.md's
 * "Approvals only appears when relevant" decision (no permanently-empty tab).
 * Content max-width `--container-xl` (1280px) per the tokens list, not the
 * ~1024px mentioned in the prose above it — the tokens are the binding spec.
 */
export default function HodShell() {
  const { user } = useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const timetable = useTimetableData();
  const hasPending = timetable?.status === "pending";

  // RequireAuth in App.tsx already guards this route; purely for TS narrowing.
  if (!user) return null;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const showStatusPill = pathname.startsWith("/approvals/") || pathname === "/my-timetable";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-sticky flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6 print:hidden">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-5 text-primary" aria-hidden="true" />
            <span className="font-heading text-h3 font-semibold text-foreground">Timetable</span>
          </div>

          <nav className="flex items-center gap-1">
            {hasPending && (
              <Link
                to="/approvals"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 font-body text-sm font-medium",
                  pathname.startsWith("/approvals")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <ClipboardCheck className="size-4 shrink-0" aria-hidden="true" />
                Approvals
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  1
                </span>
              </Link>
            )}
            <Link
              to="/my-timetable"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 font-body text-sm font-medium",
                pathname === "/my-timetable" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
              )}
            >
              <Calendar className="size-4 shrink-0" aria-hidden="true" />
              My Timetable
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {showStatusPill && timetable && <StatusPill state={timetable.status} size="sm" />}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {initials(user.name)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user.name}
                <span className="block font-normal text-muted-foreground">{ROLE_LABELS[user.role]}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
