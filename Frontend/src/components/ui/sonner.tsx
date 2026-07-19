import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/** No next-themes — this project has no dark mode (tokens.css is explicit
 *  about that), so the theme is hardcoded rather than pulling in a provider
 *  and dependency that would never do anything here. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      // Sonner only applies its per-type --success/warning/error/info-*
      // variables (and matching [data-type] CSS rules) when richColors is
      // on — without it every toast renders in the same neutral style
      // regardless of variant, which was the actual bug: the color
      // tokens below were already correct but silently inert.
      richColors
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          // COMPONENTS.md §C.1 — bg=100/fg=700/border=500 per variant.
          // Sourced from the base palette stops directly (not the
          // --success-bg/-fg semantic aliases) to avoid a same-element
          // custom-property cycle (--success-bg: var(--success-bg) would
          // resolve to the guaranteed-invalid value, per the CSS spec).
          "--success-bg": "var(--success-100)",
          "--success-text": "var(--success-700)",
          "--success-border": "var(--success-500)",
          "--warning-bg": "var(--warning-100)",
          "--warning-text": "var(--warning-700)",
          "--warning-border": "var(--warning-500)",
          "--error-bg": "var(--danger-100)",
          "--error-text": "var(--danger-700)",
          "--error-border": "var(--danger-500)",
          "--info-bg": "var(--info-100)",
          "--info-text": "var(--info-700)",
          "--info-border": "var(--info-500)",
        } as React.CSSProperties
      }
      toastOptions={{
        // Shortened from COMPONENTS.md §C.1's spec'd 5s/8s — felt too long
        // in practice (user feedback 2026-07-19), especially since Sonner
        // pauses the dismiss countdown entirely while the cursor rests near
        // the toast or the tab is unfocused, which can make even a "short"
        // duration feel stuck. Danger's no-auto-dismiss isn't global — set
        // per-call (`toast.error(msg, { duration: Infinity })`) since it's
        // the exception, not the default.
        duration: 3000,
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
