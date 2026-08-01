import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Our theme adds semantic font-size utilities (`text-label`, `text-h1/h2/h3`
// — see tokens.css §11). tailwind-merge doesn't know these are FONT-SIZES, so
// by default it lumps them into the text-COLOR group. That means a call like
// cn("text-label", "text-muted-foreground") silently DROPS `text-label` (both
// look like text-colors, last one wins) and the element falls back to the
// inherited 16px. Registering them in the `font-size` group makes merge treat
// them as sizes: they conflict with each other and with text-xs/sm/base, but
// never with a text-color class.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["label", "h1", "h2", "h3"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
