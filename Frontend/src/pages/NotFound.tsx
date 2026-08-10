import { useNavigate } from "react-router-dom";
import { SearchX, Lock } from "lucide-react";
import { ErrorScreen, ErrorScreenAction } from "@/components/domain/ErrorScreen";
import { useSession } from "@/hooks/useSession";
import { LANDING_ROUTE } from "@/lib/landingRoute";

/**
 * A genuinely unmatched URL. Figma `558:11582`.
 *
 * This used to render `<ComingSoon title="Page not found" />`, whose body read
 * *"Not built yet — coming soon."* — so a typo'd link told the user the page
 * **would exist later**, inviting them to wait for something that will never
 * arrive. Worse than no 404 at all, and it offered no way back.
 */
export function NotFound() {
  const { user } = useSession();
  const navigate = useNavigate();
  const home = user ? LANDING_ROUTE[user.role] : "/login";

  return (
    <ErrorScreen
      icon={<SearchX className="size-8" />}
      title="Page not found"
      body="That link doesn't point anywhere in the app. It may have been mistyped, or the page may have moved."
      actions={
        <ErrorScreenAction onClick={() => navigate(home, { replace: true })}>
          {user ? "Go to my dashboard" : "Go to sign in"}
        </ErrorScreenAction>
      }
    />
  );
}

/**
 * Signed in, but this route belongs to another role. Figma `558:11594`.
 *
 * RequireRole previously did a silent `<Navigate>` to the user's own landing
 * route: the URL just changed under them with no explanation, which reads as a
 * broken link rather than a permission boundary. Saying so — and naming who can
 * fix it — is the difference between "this app is buggy" and "this isn't mine".
 */
export function NoAccess() {
  const { user } = useSession();
  const navigate = useNavigate();
  const home = user ? LANDING_ROUTE[user.role] : "/login";

  return (
    <ErrorScreen
      icon={<Lock className="size-8" />}
      title="You don't have access to this page"
      body="This area is for a different role. If you think that's wrong, contact your administrator."
      actions={
        <ErrorScreenAction onClick={() => navigate(home, { replace: true })}>Go to my dashboard</ErrorScreenAction>
      }
    />
  );
}
