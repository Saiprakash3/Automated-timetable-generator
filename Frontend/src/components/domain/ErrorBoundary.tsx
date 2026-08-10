import { Component, type ErrorInfo, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { ErrorScreen, ErrorScreenAction } from "./ErrorScreen";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time throws anywhere below it.
 *
 * There was no boundary at all before this: any component throwing during
 * render made React unmount the entire tree, leaving a **blank white page** —
 * no message, no navigation, no way back, and nothing on screen to suggest the
 * app hadn't simply failed to load. That was the worst failure mode in the
 * product and the only one with no design at all.
 *
 * Has to be a class: `componentDidCatch` / `getDerivedStateFromError` have no
 * hook equivalent, and React error boundaries are still class-only.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept as console.error rather than swallowed: without it the stack is
    // lost entirely once the fallback renders, and this is exactly the failure
    // someone will need to debug from a bug report.
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ErrorScreen
        icon={<TriangleAlert className="size-8" />}
        title="Something went wrong"
        body="The page stopped responding. Your saved work is safe — reloading usually fixes it."
        actions={
          <>
            {/* A full reload, not a state reset: the tree that threw is in an
                unknown state, and clearing the flag would just re-render
                straight back into the same throw. */}
            <ErrorScreenAction onClick={() => window.location.reload()}>Reload page</ErrorScreenAction>
            <ErrorScreenAction variant="secondary" onClick={() => window.location.assign("/")}>
              Go to my dashboard
            </ErrorScreenAction>
          </>
        }
      />
    );
  }
}
