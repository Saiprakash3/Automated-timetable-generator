import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * The shared shape for the three page-level failures: 404, no-access, and a
 * render crash (Figma `558:11582` / `558:11594` / `558:11604`).
 *
 * Deliberately **standalone** — no sidebar, no top bar. All three render
 * outside every shell: `path="*"` and `RequireRole` both sit above the shell
 * routes in App.tsx, and the crash boundary can't assume the shell is even
 * intact, since the shell may be what threw.
 *
 * Every variant carries an action. A dead end with no way out is the failure
 * these screens exist to prevent — the previous 404 offered nothing but the
 * browser's Back button.
 */
interface ErrorScreenProps {
  icon: ReactNode;
  title: string;
  body: string;
  actions?: ReactNode;
}

export function ErrorScreen({ icon, title, body, actions }: ErrorScreenProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-lg border border-border bg-background px-10 py-10 text-center">
        <span className="text-muted-foreground" aria-hidden="true">
          {icon}
        </span>
        <h1 className="font-heading text-h3 font-semibold text-foreground">{title}</h1>
        <p className="font-body text-sm text-muted-foreground">{body}</p>
        {actions && <div className="flex flex-wrap items-center justify-center gap-2 pt-1">{actions}</div>}
      </div>
    </div>
  );
}

/** Convenience for the common "get me somewhere real" action. */
export function ErrorScreenAction({
  onClick,
  children,
  variant,
}: {
  onClick: () => void;
  children: ReactNode;
  variant?: "secondary";
}) {
  return (
    <Button variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}
