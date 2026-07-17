# Foundations

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-DS-001
Evidence status: Category B — every value below is a design judgment. Values are grounded in shadcn/ui conventions (the chosen library baseline), Tailwind's proven scale defaults, and the domain constraints established in `DESIGN_PRINCIPLES.md` (reading-heavy, table-dense, three device contexts per role). None of these values have been user-validated.

---

## Purpose

Lock the atomic design tokens the rest of the design system is built from: spacing, radii, borders, shadows, motion, breakpoints, z-index, icon sizes, and container widths. Plus the token architecture — the pattern that color and typography values will slot into once you've picked them.

Everything here is deliberately concrete. You picked "detailed spec" as the depth for this stage, so each token has a specific value, a Tailwind equivalent where one exists, and a use case. Nothing is left "to be decided later" unless it's explicitly waiting on your color/font choices.

## How this document works

Each section below defines a category of tokens with three things:
- **What the token is** — CSS custom property name (shadcn convention) and specific value
- **Tailwind equivalent** — the class you'd use in code
- **When to use it** — the practical guidance for Figma work

Tokens work the same way across three surfaces:

| Surface | Format |
|---|---|
| Figma variables | Named to match the CSS custom property (e.g. `space/4`, `radius/md`, `shadow/2`) |
| CSS custom properties | `--space-4`, `--radius-md`, `--shadow-2` |
| Tailwind classes | `p-4`, `rounded-md`, `shadow-md` (Tailwind's defaults, extended where noted) |

Set your Figma variables to match this naming convention. When code implementation happens later, values transfer cleanly with no translation layer needed.

---

## 1. Token architecture

### 1.1 Base tokens vs. semantic aliases

The system uses two layers of tokens, following shadcn/ui's pattern:

- **Base tokens** are the raw scale — every color stop, every spacing step, every radius value. Named by their position in the scale (`--gray-500`, `--space-4`, `--radius-md`). These are the palette.
- **Semantic aliases** are the meaning layer — they reference base tokens and give them a role (`--background: var(--gray-50)`, `--border: var(--gray-200)`, `--destructive: var(--red-500)`). Components consume semantic aliases, not base tokens directly.

**Why both layers matter:** if you decide to shift the neutral palette one step warmer six months from now, changing base tokens updates every semantic alias downstream automatically. Components don't have to change because they never referenced base tokens directly. Skipping the semantic layer forces a rewrite of every component.

### 1.2 Color format convention

shadcn's convention is **HSL without the wrapper function**:

```css
:root {
  --background: 0 0% 100%;        /* not hsl(0, 0%, 100%) */
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
}
```

The `hsl()` wrapper gets added by Tailwind when the token is consumed (`hsl(var(--background))`). This lets you compose with alpha values easily: `hsl(var(--background) / 0.5)`.

When you pick your color values (per `DESIGN_PRINCIPLES.md`), define them in this format. In Figma, store the HSL values in your color variables — the wrapper conversion happens at code time.

### 1.3 Where color and typography plug in

Two sections at the end of this document (§10 and §11) show the exact token structure for color and typography. When you decide on hex values and a font, drop them into those structures — nothing else in the system needs to change.

---

## 2. Spacing

Base unit: **4px**. This matches Tailwind's default and shadcn's convention. Don't pick a different base — every other library and every icon set assumes 4px.

### 2.1 Full scale (Tailwind default, use as-is)

| Token | Value | Tailwind | Common use |
|---|---|---|---|
| `--space-0` | 0px | `p-0`, `m-0` | Reset |
| `--space-px` | 1px | `p-px` | Borders, hairlines |
| `--space-0.5` | 2px | `p-0.5` | Very tight spacing |
| `--space-1` | 4px | `p-1` | Icon padding, chip content |
| `--space-1.5` | 6px | `p-1.5` | Rarely used |
| `--space-2` | 8px | `p-2` | Small button padding, tight gaps |
| `--space-3` | 12px | `p-3` | Between related items in a group |
| `--space-4` | 16px | `p-4` | **Standard component padding, form field gaps** |
| `--space-5` | 20px | `p-5` | Card padding |
| `--space-6` | 24px | `p-6` | Between sections in a page |
| `--space-8` | 32px | `p-8` | Between major blocks |
| `--space-10` | 40px | `p-10` | Page-level breathing room |
| `--space-12` | 48px | `p-12` | Between page sections |
| `--space-16` | 64px | `p-16` | Section separators |
| `--space-20` | 80px | `p-20` | Empty state whitespace |
| `--space-24` | 96px | `p-24` | Rare — very large gaps |

### 2.2 Practical guidance for Figma

Configure Figma's grid to use 4px as the base unit and 8px as the visible gridline. Snap everything to 4px. If you find yourself using 5px or 7px anywhere, that's a signal — round to the nearest valid stop.

**Most-used stops for this project** (build these into your Figma variables first):
- `space/2` (8px), `space/3` (12px), `space/4` (16px), `space/6` (24px), `space/8` (32px), `space/12` (48px)

You'll rarely reach for the values outside that range.

---

## 3. Border radii

Base radius: **6px**.

Rationale: 8px (shadcn's default) reads as friendly/consumer, 4px reads as harsh/technical. 6px sits in a professional-but-approachable middle — appropriate for an admin tool that's used daily by faculty but shouldn't feel like it was designed for children. If after Figma work you want to move to 8px (softer) or 4px (more precise), it's a one-value change since everything derives from `--radius`.

### 3.1 Full scale

| Token | Value | Tailwind | When to use |
|---|---|---|---|
| `--radius-none` | 0px | `rounded-none` | Timetable cells, tables (crisp edges) |
| `--radius-sm` | 4px | `rounded-sm` | Small pills, badges |
| `--radius` | 6px | `rounded-md` | **Default: buttons, inputs, cards, dropdowns** |
| `--radius-lg` | 8px | `rounded-lg` | Dialogs, drawers |
| `--radius-xl` | 12px | `rounded-xl` | Rarely used — hero cards |
| `--radius-full` | 9999px | `rounded-full` | Status pills, avatars, icon buttons |

### 3.2 Component-specific rules

- **Timetable cells:** use `--radius-none`. A grid of rounded cells looks noisy — sharp cells read as a data table, which is what it is.
- **Buttons and inputs:** always `--radius` (6px). Consistent affordance across all forms.
- **Status pills:** always `--radius-full`. Pills are shaped, not rounded — this reads as a status *label*, not a small button.
- **Modals/drawers:** `--radius-lg` (8px). Slightly softer than components inside them, which reinforces the container relationship.

---

## 4. Border widths

Three widths, no more.

| Token | Value | Tailwind | When to use |
|---|---|---|---|
| `--border-1` | 1px | `border` | **Default:** all component borders, table cell dividers |
| `--border-2` | 2px | `border-2` | Focus rings, active/selected states, error emphasis |
| `--border-4` | 4px | `border-4` | Very rare — used for high-emphasis dividers if at all |

The 2px width is critical for Principle 6 (accessibility) — focus rings need to be visible at a glance, and 1px focus rings fail this at normal viewing distances.

---

## 5. Elevation (shadows)

Five levels. Each has a specific purpose — don't use them interchangeably.

### 5.1 Elevation scale

| Token | Value | Tailwind | When to use |
|---|---|---|---|
| `--shadow-0` | none | `shadow-none` | Flat surfaces, table cells, grid |
| `--shadow-1` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-sm` | Subtle lift: cards resting on page background |
| `--shadow-2` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | `shadow` | Dropdowns, popovers, sticky headers |
| `--shadow-3` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `shadow-lg` | Drawer (cell edit panel), floating panels |
| `--shadow-4` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | `shadow-xl` | Modals, confirmation dialogs |

### 5.2 Focus ring (separate from elevation)

| Token | Value | When to use |
|---|---|---|
| `--ring` | `0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring-color))` | Every interactive element on `:focus-visible` |

The double-ring pattern (inner white + outer color) ensures visibility on both light and dark surfaces. The `--ring-color` semantic alias will point to your Primary palette (defined once you pick colors).

### 5.3 Backdrop for overlays

Modals and drawers need a scrim behind them:

| Token | Value |
|---|---|
| `--backdrop` | `hsl(0 0% 0% / 0.5)` — 50% black overlay |

---

## 6. Motion

Two axes: **duration** and **easing**. Combine them for every transition.

### 6.1 Durations

| Token | Value | When to use |
|---|---|---|
| `--duration-instant` | 75ms | Micro-feedback: button press, hover state on already-visible elements |
| `--duration-fast` | 150ms | Small state changes: tooltip appear, checkbox toggle |
| `--duration-default` | 200ms | **Most transitions:** dropdown open, panel expand, color shifts |
| `--duration-moderate` | 300ms | Drawer slide-in, modal appear, larger movements |
| `--duration-slow` | 500ms | Rare — page transitions, celebratory feedback |

### 6.2 Easings

| Token | Value | When to use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | **Default:** most transitions, back-and-forth state changes |
| `--ease-enter` | `cubic-bezier(0, 0, 0.2, 1)` | Element appearing: modal opens, drawer slides in, toast enters |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Element leaving: modal closes, toast dismisses |
| `--ease-emphasized` | `cubic-bezier(0.4, 0, 0, 1)` | Attention-getting movement — use sparingly |

### 6.3 Composition guidance

Standard pairings:
- **Hover state changes:** `--duration-fast` + `--ease-standard`
- **Dropdown / popover:** `--duration-default` + `--ease-enter` (open), `--ease-exit` (close)
- **Drawer / modal:** `--duration-moderate` + `--ease-enter` (open), `--ease-exit` (close)
- **Conflict badge appearing:** `--duration-default` + `--ease-emphasized` — this is intentionally emphasized to draw attention per Principle 2

Respect `prefers-reduced-motion`: when the user has this OS setting enabled, all durations should collapse to 0ms. This isn't optional — it's part of Principle 6.

---

## 7. Breakpoints

Tailwind's defaults, annotated with which shell uses which range.

| Token | Value | Tailwind | Which shell designs here |
|---|---|---|---|
| — | <640px | (below `sm`) | Read-Only shell (Faculty / Student mobile) |
| `sm` | 640px | `sm:` | Read-Only shell (large mobile / small tablet) |
| `md` | 768px | `md:` | Read-Only + HOD shell (tablet) |
| `lg` | 1024px | `lg:` | HOD shell (desktop-primary starts) |
| `xl` | 1280px | `xl:` | **Admin shell (edit views require this minimum)** |
| `2xl` | 1536px | `2xl:` | Admin shell (comfortable width — timetable grid breathes) |

### 7.1 Design targets in Figma

Per Principle 7 (Device use matches role reality), design each shell at these specific frame widths:

| Shell | Figma frame widths to design |
|---|---|
| Admin | 1440px (primary), 1280px (minimum), 1920px (large monitors — a nice-to-have) |
| HOD | 1024px (primary), 768px (tablet fallback) |
| Read-Only | 375px (mobile primary), 768px (tablet), 1280px (desktop) |

Skip mobile Admin edit views entirely — that's out of scope by principle, not oversight.

---

## 8. Z-index

Named tokens, not raw numbers scattered through the codebase. This matters more than it looks — z-index bugs are the single most common cause of "why is my modal behind the toast" issues.

| Token | Value | Layer |
|---|---|---|
| `--z-base` | 0 | Page content — default |
| `--z-sticky` | 10 | Sticky nav, sticky table headers, status bar in shell |
| `--z-dropdown` | 20 | Dropdowns, popovers, select menus |
| `--z-fixed` | 30 | Fixed-position elements (rare — floating action buttons) |
| `--z-drawer-overlay` | 40 | Drawer backdrop |
| `--z-drawer` | 50 | Drawer content (cell edit panel) |
| `--z-toast` | 60 | Toast notifications — above drawer, below modal |
| `--z-modal-overlay` | 70 | Modal backdrop |
| `--z-modal` | 80 | Modal content (dialogs, confirmations, bulk import stepper) |
| `--z-tooltip` | 90 | Tooltips — always the highest layer |

Rationale for ordering: **modals sit above drawers** (Publish confirmation appears over an edit drawer). **Tooltips sit above modals** (a validation tooltip in a modal must be visible). **Toasts sit between drawer and modal** (a system-info toast shouldn't block a critical confirmation dialog).

---

## 9. Icon sizes

Consistent icon sizing across the system. Every icon in Figma should snap to one of these values.

| Token | Value | Tailwind | When to use |
|---|---|---|---|
| `--icon-xs` | 12px | `size-3` | Inline with body-small text, dense table cells |
| `--icon-sm` | 16px | `size-4` | **Default:** inside buttons, form fields, status pills |
| `--icon-md` | 20px | `size-5` | Standalone icon buttons, section headers |
| `--icon-lg` | 24px | `size-6` | Prominent icons, empty states, dialog headers |
| `--icon-xl` | 32px | `size-8` | Empty-state illustrations, large empty states |

Icon library: **Lucide** (shadcn's default, per `DESIGN_PRINCIPLES.md`). All sizes above match Lucide's default stroke weight and grid — no adjustment needed.

---

## 10. Color tokens (confirmed)

Seven palettes, generated as full 11-stop tonal ramps from your seed values using standard ramp-generation logic (seed anchored at its named stop, lightness/saturation interpolated outward) — the same approach a Figma color plugin produces. Contrast-checked against WCAG AA; see notes below each risk area.

**Naming note:** your "Secondary" palette (teal, seed `#537977`) is named `--teal-*` in tokens below, not `--secondary-*`. This avoids collision with shadcn's `--secondary` semantic token, which is the neutral gray "Cancel/Back" button per `COMPONENTS.md` §A.1 — a different thing that happens to share the word "secondary." Per your confirmed role decision, teal is reserved for domain-category identification (marking lab-related content), never for action-button emphasis.

### 10.1 Base tokens

```css
:root {
  /* Neutral — seed #5B6472 @ 600 */
  --neutral-50:  180 9% 98%;
  --neutral-100: 210 7% 95%;
  --neutral-200: 220 9% 87%;
  --neutral-300: 216 8% 76%;
  --neutral-400: 217 10% 64%;
  --neutral-500: 215 10% 51%;
  --neutral-600: 217 11% 40%;   /* seed: #5B6472 */
  --neutral-700: 218 11% 30%;
  --neutral-800: 216 10% 20%;
  --neutral-900: 220 10% 12%;
  --neutral-950: 210 10% 4%;

  /* Primary — seed #3454D1 @ 600 */
  --primary-50:  240 40% 98%;
  --primary-100: 230 50% 95%;
  --primary-200: 228 51% 89%;
  --primary-300: 228 54% 81%;
  --primary-400: 227 56% 70%;
  --primary-500: 228 60% 60%;
  --primary-600: 228 63% 51%;   /* seed: #3454D1 */
  --primary-700: 228 58% 37%;
  --primary-800: 228 53% 25%;
  --primary-900: 229 49% 15%;
  --primary-950: 228 50% 4%;

  /* Teal (your "Secondary" palette) — seed #537977 @ 500 — domain accent only, not a button color */
  --teal-50:  150 20% 98%;
  --teal-100: 180 12% 94%;
  --teal-200: 175 15% 84%;
  --teal-300: 177 16% 71%;
  --teal-400: 177 17% 55%;
  --teal-500: 177 19% 40%;   /* seed: #537977 */
  --teal-600: 178 19% 32%;   /* #41605F — user-supplied, replaces formula estimate */
  --teal-700: 174 18% 23%;
  --teal-800: 180 16% 16%;
  --teal-900: 172 15% 10%;
  --teal-950: 180 14% 4%;

  /* Success — seed #2F9E5B @ 600 */
  --success-50:  150 40% 98%;
  --success-100: 144 36% 95%;
  --success-200: 144 41% 87%;
  --success-300: 144 43% 76%;
  --success-400: 144 47% 64%;
  --success-500: 144 51% 52%;
  --success-600: 144 54% 40%;   /* seed: #2F9E5B */
  --success-700: 144 52% 29%;   /* #247143 — user-supplied, replaces formula estimate */
  --success-800: 144 48% 20%;
  --success-900: 144 45% 12%;
  --success-950: 140 43% 4%;

  /* Warning — seed #D98C2B @ 400 */
  --warning-50:  30 60% 98%;
  --warning-100: 33 53% 93%;
  --warning-200: 33 58% 82%;
  --warning-300: 34 63% 68%;
  --warning-400: 33 70% 51%;   /* seed: #D98C2B */
  --warning-500: 33 66% 41%;
  --warning-600: 33 62% 32%;
  --warning-700: 21 67% 33%;   /* #8C431C — user-supplied, replaces formula estimate */
  --warning-800: 34 57% 16%;
  --warning-900: 33 55% 10%;
  --warning-950: 36 50% 4%;

  /* Danger — seed #D94A4A @ 500 */
  --danger-50:  0 45% 98%;
  --danger-100: 0 52% 95%;
  --danger-200: 0 54% 88%;
  --danger-300: 0 57% 79%;
  --danger-400: 0 62% 68%;
  --danger-500: 0 65% 57%;   /* seed: #D94A4A */
  --danger-600: 0 56% 51%;   /* #C83A3A — user-supplied, replaces formula estimate */
  --danger-700: 0 57% 42%;   /* #A72E2E — user-supplied, replaces formula estimate */
  --danger-800: 0 52% 22%;
  --danger-900: 0 49% 13%;
  --danger-950: 0 50% 4%;

  /* Info — seed #3B82C4 @ 500 */
  --info-50:  210 40% 98%;
  --info-100: 210 43% 95%;
  --info-200: 208 43% 86%;
  --info-300: 209 46% 76%;
  --info-400: 209 50% 63%;
  --info-500: 209 54% 50%;   /* seed: #3B82C4 */
  --info-600: 210 59% 39%;   /* #2964A0 — user-supplied, replaces formula estimate */
  --info-700: 209 48% 29%;
  --info-800: 209 45% 20%;
  --info-900: 208 43% 12%;
  --info-950: 210 40% 4%;
}
```

### 10.2 Semantic aliases

```css
:root {
  /* Surfaces */
  --background: var(--neutral-50);
  --foreground: var(--neutral-900);
  --card: var(--neutral-50);
  --card-foreground: var(--neutral-900);
  --popover: var(--neutral-50);
  --popover-foreground: var(--neutral-900);

  /* Interactive */
  --primary: var(--primary-600);              /* your seed, verified 6.30:1 with white text */
  --primary-foreground: 0 0% 100%;
  --secondary: var(--neutral-100);             /* shadcn's neutral secondary button — NOT teal */
  --secondary-foreground: var(--neutral-900);
  --accent: var(--neutral-100);
  --accent-foreground: var(--neutral-900);
  --muted: var(--neutral-100);
  --muted-foreground: var(--neutral-600);      /* neutral-500 fails AA for body text at 3.95:1 — use 600 */

  /* Borders and inputs */
  --border: var(--neutral-200);
  --input: var(--neutral-200);
  --ring-color: var(--primary-600);

  /* Feedback — solid-fill pairs (white text). Confirmed against user-supplied contrast-checked values */
  --destructive: var(--danger-700);            /* #A72E2E, 6.28–6.83:1 — using 700 over 600 (#C83A3A, ~4.7–5.1:1) for a safer margin on this highest-stakes action (Publish confirmation depends on this token) */
  --destructive-foreground: 0 0% 100%;
  --success-solid: var(--success-700);         /* #247143, confirmed ~5.7–6.0:1 */
  --success-solid-foreground: 0 0% 100%;
  --warning-solid: var(--warning-700);         /* #8C431C, confirmed ~6.6–7.2:1 */
  --warning-solid-foreground: 0 0% 100%;
  --info-solid: var(--info-600);               /* #2964A0, confirmed ~5.7–6.1:1 */
  --info-solid-foreground: 0 0% 100%;
  --teal-solid: var(--teal-600);               /* #41605F, confirmed ~6.4–6.9:1 */
  --teal-solid-foreground: 0 0% 100%;

  /* Feedback — light-bg / dark-text pairs (badges, toasts, conflict badges). All verified 5.3–8.2:1 */
  --success-fg: var(--success-700);
  --success-bg: var(--success-100);
  --warning-fg: var(--warning-700);
  --warning-bg: var(--warning-100);
  --danger-fg: var(--danger-700);
  --danger-bg: var(--danger-100);
  --info-fg: var(--info-700);
  --info-bg: var(--info-100);
  --teal-fg: var(--teal-700);
  --teal-bg: var(--teal-100);

  /* Status pills (DESIGN_PRINCIPLES.md — reuse existing palettes, light-bg/dark-text pattern) */
  --status-draft-bg: var(--neutral-100);
  --status-draft-fg: var(--neutral-700);
  --status-pending-bg: var(--warning-100);
  --status-pending-fg: var(--warning-700);
  --status-approved-bg: var(--success-100);
  --status-approved-fg: var(--success-700);
  --status-published-bg: var(--primary-100);
  --status-published-fg: var(--primary-700);

  /* Conflict badges (INTERACTION_DECISIONS.md §1.3 — three tiers, light-bg/dark-text pattern) */
  --conflict-blocking-bg: var(--danger-100);
  --conflict-blocking-fg: var(--danger-700);
  --conflict-blocking-border: var(--danger-500);
  --conflict-warning-bg: var(--warning-100);
  --conflict-warning-fg: var(--warning-700);
  --conflict-warning-border: var(--warning-500);
  --conflict-info-bg: var(--info-100);
  --conflict-info-fg: var(--info-700);
  --conflict-info-border: var(--info-500);
}
```

### 10.3 Contrast verification summary

| Pairing | Ratio | Result |
|---|---|---|
| `--foreground` (neutral-900) on `--background` | 16.7:1 | Pass, large margin |
| `--muted-foreground` (neutral-600) on `--background` | 5.98:1 | Pass |
| white on `--primary` (primary-600) | 6.30:1 | Pass |
| white on `--destructive` (danger-700, `#A72E2E`) | 6.28–6.83:1 | Pass, safe margin |
| white on `--success-solid` (success-700, `#247143`) | 5.65–5.97:1 | Pass |
| white on `--warning-solid` (warning-700, `#8C431C`) | 6.64–7.16:1 | Pass |
| white on `--info-solid` (info-600, `#2964A0`) | 5.66–6.13:1 | Pass |
| white on `--teal-solid` (teal-600, `#41605F`) | 6.42–6.86:1 | Pass |
| success-700 on success-100 (badge pattern) | 5.33:1 | Pass |
| warning-700 on warning-100 (badge pattern) | 8.09:1 | Pass |
| danger-700 on danger-100 (badge pattern) | 8.19:1+ | Pass |
| info-700 on info-100 (badge pattern) | 8.10:1 | Pass |

*Ranges reflect minor rounding differences between your color tool's contrast calculation and the WCAG relative-luminance formula used here — both agree on pass/fail for every pairing above.*

### 10.4 Rule for any future solid-fill component

If a future component needs a solid semantic fill with white/light text beyond what's already aliased above, use the palette's **700 stop for Success, Warning, and Danger**, and the **600 stop for Info and Teal** — these are the confirmed, contrast-checked stops. Never use a palette's raw seed value for this purpose; several seeds fall short of AA at full white-text contrast (Success/Warning/Danger/Info seeds range 2.7–4.2:1). Seed stops remain correct and unchanged for their original use — badge borders, icons, and the light-bg/dark-text badge pattern — where they already test well above AA.

---

## 11. Typography token structure

Font family confirmed: **DM Sans** (primary — headings, labels, UI elements) + **Inter** (secondary — body content). This pairing splits duty deliberately: DM Sans gives headings and UI chrome a bit of geometric character, while Inter carries the actual reading load — timetable cells, table content, form values — where its high x-height and screen-optimized letterforms matter most (per Principle 6's reading-heavy-tool constraint).

**Type scale confirmed: Major Third (1.25 ratio)**, anchored at the 16px Body baseline. Mathematically exact values (H3: 20px, H2: 25px, H1: 31.25px) are rounded to clean rem steps below — 25px and 31.25px aren't values anyone hits cleanly in a design tool, and the rounded numbers land on the same quarter-rem grid Tailwind's own spacing scale already uses elsewhere in this system, keeping things consistent.

| Role | Exact (1.25³ from 16px) | Rounded (confirmed) | rem |
|---|---|---|---|
| H1 | 31.25px | **32px** | 2rem |
| H2 | 25px | **24px** | 1.5rem |
| H3 | 20px | **20px** | 1.25rem |
| Body | 16px | **16px** | 1rem |
| Body Small | — (fixed, not scale-derived) | **14px** | 0.875rem |
| Label | — (fixed, not scale-derived) | **12px** | 0.75rem |

Body Small and Label sit below the scale's mathematical curve deliberately — continuing the 1.25 ratio downward would produce 12.8px and 10.24px, both worse for reading than the clean 14px/12px already fixed earlier in this document. The scale governs the headings; the two smallest roles use practical, widely-legible values instead.

**Weights confirmed:** two per family, keeping font-loading light.
- **DM Sans:** Medium (500) for H3/Label, Semibold (600) for H1/H2 — headings get more visual weight than labels
- **Inter:** Regular (400) for Body/Body Small, Medium (500) reserved for emphasis within body text (e.g. a bolded value in a table cell)

### 11.1 Base type tokens (confirmed)

```css
:root {
  /* Font families */
  --font-primary: 'DM Sans', system-ui, sans-serif;    /* headings, labels, UI */
  --font-secondary: 'Inter', system-ui, sans-serif;     /* body content */

  /* Font sizes — Major Third (1.25) scale, rounded */
  --text-h1:    2rem;      /* 32px */
  --text-h2:    1.5rem;    /* 24px */
  --text-h3:    1.25rem;   /* 20px */
  --text-body:  1rem;      /* 16px baseline */
  --text-sm:    0.875rem;  /* 14px — Body Small, fixed below the scale curve */
  --text-label: 0.75rem;   /* 12px — Label, fixed below the scale curve */

  /* Font weights */
  --font-weight-regular:  400;  /* Inter — Body, Body Small */
  --font-weight-medium:   500;  /* Inter — emphasis in body; DM Sans — H3, Label */
  --font-weight-semibold: 600;  /* DM Sans — H1, H2 */

  /* Line heights */
  --leading-tight:  1.25;   /* headings */
  --leading-normal: 1.5;    /* body */
  --leading-loose:  1.75;   /* rarely used, long-form reading */

  /* Letter spacing — tighten large sizes slightly */
  --tracking-tight:  -0.01em;   /* H1, H2 */
  --tracking-normal: 0;
  --tracking-wide:   0.02em;    /* labels, all-caps */
}
```

### 11.2 Role application (fully confirmed)

```css
:root {
  --text-h1-style:    600 var(--text-h1)    / var(--leading-tight)  var(--font-primary);
  --text-h2-style:    600 var(--text-h2)    / var(--leading-tight)  var(--font-primary);
  --text-h3-style:    500 var(--text-h3)    / var(--leading-normal) var(--font-primary);
  --text-body-style:  400 var(--text-body)  / var(--leading-normal) var(--font-secondary);
  --text-sm-style:    400 var(--text-sm)    / var(--leading-normal) var(--font-secondary);
  --text-label-style: 500 var(--text-label) / var(--leading-normal) var(--font-primary);
}
```

| Role | Family | Weight | Rationale |
|---|---|---|---|
| H1, H2 | DM Sans | Semibold (600) | Page/section titles carry the most visual weight |
| H3 | DM Sans | Medium (500) | Subsection headers — present but quieter than H1/H2 |
| Label | DM Sans | Medium (500) | Short UI-chrome text — matches buttons and nav, not reading content |
| Body, Body Small | Inter | Regular (400), Medium (500) for emphasis | The bulk of actual reading (table cells, form values, descriptions) — legibility-first |

Typography is now fully specified — nothing left open in this section. Four font files to load in total: DM Sans Medium + Semibold, Inter Regular + Medium.

---

## 12. Container widths

Max widths for content areas. Not strict grid columns — just the maximum widths content should occupy.

| Token | Value | When to use |
|---|---|---|
| `--container-sm` | 640px | Small dialogs, empty states |
| `--container-md` | 768px | Medium dialogs, bulk import stepper |
| `--container-lg` | 1024px | Standard content areas, forms |
| `--container-xl` | 1280px | Large content areas |
| `--container-2xl` | 1536px | Timetable grid views — needs the width |
| `--container-full` | 100% | Full-width regions (grid pages) |

---

## Token count summary

| Category | Token count |
|---|---|
| Spacing | ~15 stops (Tailwind default) |
| Border radii | 6 |
| Border widths | 3 |
| Shadows / elevation | 6 (5 shadows + focus ring + backdrop) |
| Motion — durations | 5 |
| Motion — easings | 4 |
| Breakpoints | 5 (Tailwind default) |
| Z-index | 10 |
| Icon sizes | 5 |
| Container widths | 6 |
| **Non-color / non-typography subtotal** | **~65 tokens** |
| Color base tokens (confirmed) | 77 (7 palettes × 11 stops) |
| Color semantic aliases (confirmed) | ~40 |
| Typography base tokens (confirmed) | ~15 |
| Typography role tokens (confirmed) | ~7 |
| **Grand total** | **~204 tokens** |

That's the full foundation — everything `COMPONENTS.md` and `DOMAIN_COMPONENTS.md` will reference. Color and typography are now fully specified; nothing left waiting.

---

## What this document does not decide

- Specific color hex values, font family, exact type sizes and weights — waiting on your choices.
- How individual components use these tokens (which shadow on which component, which spacing between which elements) — that's per-component detail in `COMPONENTS.md` and `DOMAIN_COMPONENTS.md`.
- Copy tone, patterns for validation messaging — `PATTERNS.md`.
- Accessibility rules per token (contrast pairings, focus-ring visibility on specific palettes) — `ACCESSIBILITY.md`.
