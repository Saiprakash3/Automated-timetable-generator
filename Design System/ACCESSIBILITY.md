# Accessibility

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-DS-001
Evidence status: Category A for the standards (WCAG 2.2 AA is a published specification); Category B for the specific implementation choices per component. Audit §22 confirmed the existing system's accessibility as "one of the least developed areas" — this document exists to prevent that gap from persisting.

---

## Purpose

Codify the WCAG 2.2 AA baseline for every component in the system, plus per-component accessibility annotations. Per Principle 6 (`DESIGN_PRINCIPLES.md`), accessibility is a build constraint, not a review checklist — meaning every component must meet these rules as part of its definition, not as a retroactive fix.

This document has two halves:
1. **System-wide baseline rules** — what every component must meet
2. **Per-component annotations** — specific accessibility patterns for each of the 34 components

The baseline is non-negotiable; per-component annotations show how each specific component meets the baseline.

---

## Part 1: System-wide baseline

### 1.1 Target compliance level

**WCAG 2.2 Level AA** across the whole system. Rationale: AA is the standard target for public-facing and institutional software. AAA is more restrictive than this domain needs (and would require sacrificing some density decisions Admin work depends on).

### 1.2 Color contrast

- **Text on background:** minimum 4.5:1 for body text (Body, Body Small), minimum 3:1 for large text (H1, H2, and text at 18px+ regular or 14px+ bold)
- **Interactive elements:** minimum 3:1 contrast for the borders and icons of buttons, form fields, and other interactive components against adjacent colors
- **Non-text UI components:** minimum 3:1 for meaningful graphical elements (icons carrying meaning, focus rings, status indicators)

When you pick colors (per `DESIGN_PRINCIPLES.md`), verify each palette's semantic pairings pass these ratios:

- `--primary` on `--primary-foreground` (button label on button bg)
- `--foreground` on `--background` (default text on default bg)
- `--muted-foreground` on `--background` (secondary text)
- `--border` on `--background` (borders visible)
- `--destructive` and other semantic colors on their `foreground` pair

Any pairing that fails means adjusting the base token, not the semantic alias.

#### 1.2.1 Confirmed palette — contrast rules specific to this color set

Now that colors are finalized (`FOUNDATIONS.md` §10), these rules apply and are already reflected in the semantic aliases:

- **Secondary/Teal filled elements must use `--teal-600` (`#41605F`), not `--teal-500`.** The seed value (teal-500, `#537977`) passes AA against white text at 4.81:1, but with a thin margin — too close to be safe across rendering variation (subpixel AA, font-weight differences, display calibration). `--teal-solid` is aliased to `--teal-600` (confirmed 6.42–6.86:1) for this reason. Teal-500 remains valid for its original role — domain-identification icons, borders, and light-bg/dark-text badge pairings — where the requirement is only 3:1, not 4.5:1.
- **Success, Warning, Danger, and Info seeds fail AA when used as a solid fill with white text at their given stop** (2.71–4.18:1, all below the 4.5:1 floor). This does not affect their existing use in badges, toasts, and conflict indicators — those use a light-background/dark-text pattern (e.g. `warning-100` bg with `warning-700` text) that tests at 5.3–8.2:1, well above AA. It only matters for a *solid* fill with white/light text. Confirmed replacement stops: `--success-solid` → success-700 (`#247143`, ~5.7–6.0:1), `--warning-solid` → warning-700 (`#8C431C`, ~6.6–7.2:1), `--destructive` → danger-700 (`#A72E2E`, ~6.3–6.8:1 — chosen over danger-600's tighter ~4.7–5.1:1 margin since this token backs the Publish confirmation, the system's highest-stakes action), `--info-solid` → info-600 (`#2964A0`, ~5.7–6.1:1).
- **`--muted-foreground` uses `neutral-600`, not `neutral-500`.** Neutral-500 only reaches 3.95:1 against the background — sufficient for non-text UI (borders, disabled-state hints) but insufficient for body text. Any component using muted-foreground for actual reading text (helper text, captions, secondary labels) must reference neutral-600 (5.98:1) or darker.

### 1.3 Meaning is never conveyed by color alone

Every state distinguished by color must also be distinguished by at least one other attribute: icon, label text, position, or shape.

Applied consistently across:
- Conflict Badge (3 severities have 3 distinct icons + text labels)
- Status Pill (5 states have 5 distinct icons + labels)
- Form field error (icon + error message text, not just red border)
- Setup Checklist Row (state icon + row treatment)

### 1.4 Keyboard access

Every interactive element must be reachable and operable via keyboard, in a logical order.

- **Tab / Shift+Tab:** navigate forward/backward through interactive elements
- **Enter / Space:** activate buttons, links, checkboxes
- **Arrow keys:** navigate within composite widgets (menus, tabs, radio groups, calendar)
- **Escape:** dismiss overlays (Dialog, Drawer, Tooltip, Dropdown menu)
- **Home / End:** jump to first/last in lists and menus where appropriate

**No keyboard traps** anywhere except intentional focus traps in modal Dialogs (which must be escapable via Escape or the close button).

### 1.5 Focus indication

Every interactive element must have a visible focus indicator when reached via keyboard.

- **Focus ring:** `--ring` (2px, using `--ring-color` from `FOUNDATIONS.md` §5.2)
- **Never `outline: none` without a replacement** — this is the single most common accessibility failure and is explicitly forbidden
- **:focus-visible only, not :focus** — mouse users don't need to see focus rings after every click; keyboard users always do
- **Focus rings must have 3:1 contrast** against adjacent background

### 1.6 Touch targets

All interactive elements meet minimum touch target size, on all shells and all breakpoints:

- **44×44 CSS pixels minimum** on mobile and touch-capable devices
- **32×32 CSS pixels minimum** on non-touch desktop (Admin shell) — but 40×40 recommended
- Where the visible control is smaller (small Icon Button), the hitbox must be enlarged with padding to meet 44×44 on touch surfaces

### 1.7 Screen reader support

Every meaningful element has a screen-reader-accessible name and role:

- **Semantic HTML by default:** use `<button>` for buttons, `<a>` for navigation, `<input>` for inputs, `<table>` for data tables. Divs with click handlers are forbidden except for genuine layout containers.
- **ARIA landmarks:** `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>` used to structure each shell — screen readers use these for quick navigation
- **ARIA labels:** every Icon Button, every icon-only interactive element, every input without a visible `<label>`
- **ARIA live regions:** used for Toast, Post-Generation Summary, and Conflict Badge appearance — announces changes without requiring focus movement
- **ARIA states:** `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled` used per Radix conventions (shadcn/Radix handle most of this automatically)

### 1.8 Motion and animation

Per `FOUNDATIONS.md` §6, `prefers-reduced-motion` is respected system-wide:

- When user has `prefers-reduced-motion: reduce` set, all durations collapse to 0ms
- Transitions become instant state changes rather than animations
- Progress bars still show progress (that's information, not decoration)
- Skeleton loaders can either stop pulsing or reduce pulse to a static state

### 1.9 Responsive and zoom support

- Interface must remain usable at **200% zoom** without horizontal scrolling (except for the Admin timetable grid, which is expected to horizontal-scroll on smaller viewports)
- Text scales with browser font size preferences — never use fixed pixel values for text
- Layout adapts to text scale — buttons and containers grow with their content, no clipping

### 1.10 Forms

- Every field has a visible `<label>` (or aria-labelledby pointing to a heading)
- Required fields marked with an asterisk *and* the text "(required)" in the label — asterisk alone is decorative
- Error messages associated with fields via `aria-describedby` — screen readers announce the error when the field is focused
- Error messages positioned below the field, not above, so tab order takes users through label → field → error

### 1.11 Tables

- Every data table has a `<caption>` describing its content, or an `aria-labelledby` pointing to a nearby heading
- Column headers are `<th scope="col">`
- Row headers (where meaningful) are `<th scope="row">`
- Sortable columns announce sort state via `aria-sort`
- Large tables include keyboard navigation via arrow keys

---

## Part 2: Per-component accessibility annotations

### Generic components (from COMPONENTS.md)

#### Button
- Native `<button>` element; no div-with-onclick
- `aria-disabled` when disabled state active (in addition to visual)
- Loading state announces "Loading" via aria-live
- Icon + label buttons: visible text is the accessible name; icon is decorative (`aria-hidden`)
- Icon-only buttons: use Icon Button component (below)

#### Icon Button
- Requires `aria-label` or `aria-labelledby` — no exceptions
- If also using Tooltip, tooltip content should match aria-label
- Hit area 44×44 minimum on touch even when visible icon is smaller

#### Input
- Every Input paired with a `<label>` or `aria-labelledby`
- `aria-required="true"` when required
- `aria-invalid="true"` when in error state
- Error message linked via `aria-describedby`
- Placeholder text is decorative — never used as the sole label

#### Select / Dropdown
- Uses Radix Select primitive (via shadcn) — handles keyboard/ARIA correctly by default
- Ensure the visible label is present, not just a placeholder
- Selected value announced on change
- Multi-select: selected items announced as "N of M selected"

#### Checkbox / Radio / Switch
- Native `<input>` element wrapped with visible label
- Radio group wrapped in `<fieldset>` with `<legend>`
- Switch role: `role="switch"` with `aria-checked` (Radix handles this)
- Space bar toggles; Enter does not (this is a spec quirk — expected)

#### Toast / Alert
- `role="status"` (Info/Success) or `role="alert"` (Warning/Danger)
- Uses `aria-live="polite"` for status, `aria-live="assertive"` for alerts
- Auto-dismiss must not prevent screen reader from reading the message — minimum 5 seconds visible
- Danger variant does not auto-dismiss (user must dismiss to proceed)

#### Tooltip
- Radix Tooltip handles ARIA automatically (uses `aria-describedby`)
- Tooltip content is supplementary — never the only way to access the information
- Delay in of 500ms on hover; immediate on keyboard focus

#### Progress Bar
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` describing what's progressing ("Setup completion", "Bulk import validation")
- Announced updates via aria-live when progress crosses meaningful thresholds

#### Skeleton Loader
- `aria-busy="true"` on the container
- Content region has `aria-live="polite"` so incoming content is announced when replaced
- The skeleton shapes themselves are decorative (`aria-hidden`)

#### Dialog / Modal
- Focus moves to the Dialog on open (typically to the close button or first interactive element)
- Focus trapped inside Dialog until dismissed
- Escape closes (except Irreversible variant — see Confirmation Dialog)
- `role="dialog"` with `aria-labelledby` pointing to the title
- Focus returns to the trigger element on close

#### Drawer / Side Panel
- Same as Dialog for focus management
- Additionally: Drawer's less-blocking nature means clicking outside dismisses (in most cases), so click-outside must be equivalent to Escape for accessibility

#### Confirmation Dialog
- Reversible variant: same as Dialog
- Irreversible variant: focus lands on Cancel by default, not the Confirm button — reduces accidental confirmations
- Type-to-confirm input has explicit label ("Type Publish to confirm") — screen readers announce this

#### Card
- Interactive Card variant: wrapped in a `<button>` or `<a>` — never a div with onclick
- Card content within has semantic structure (headings, lists, etc.)

#### Empty State
- Title is a heading (`<h2>` or `<h3>` depending on nesting depth)
- Icon is decorative (`aria-hidden`)
- Action button follows standard Button accessibility

#### Tab / Tab Group
- Radix Tabs primitive handles ARIA — uses `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Arrow keys navigate between tabs (Radix default)
- Space/Enter activates focused tab

#### Breadcrumb
- Wrapped in `<nav aria-label="Breadcrumb">`
- Separator is decorative (aria-hidden)
- Current page marked with `aria-current="page"`

#### Table
- Semantic `<table>` with `<caption>`, `<thead>`, `<tbody>`
- Column headers `<th scope="col">`
- Sortable columns: sort button inside header with `aria-sort` on the `<th>`
- Row selection checkbox has label "Select row [identifier]"
- Empty state within table uses `<tr>` spanning all columns

#### Badge / Pill
- Decorative badges: no ARIA needed
- Interactive badges (rare): treated as buttons
- Status Pill (see Domain Components below): specific requirements

### Shell components

#### Admin Shell
- Sidebar wrapped in `<nav aria-label="Main navigation">`
- Main content in `<main>`
- Top bar in `<header>`
- Active nav item has `aria-current="page"`
- Setup sub-items have completion state announced ("Faculty: complete", "Subjects: partial")

#### HOD Shell
- Top bar in `<header>`
- Nav in `<nav aria-label="Main navigation">`
- Approvals count badge announced as "N pending"

#### Read-Only Shell
- Simplified structure — `<header>`, `<main>` is enough
- User's greeting is a `<h1>` for the page

### Domain-specific components (from DOMAIN_COMPONENTS.md)

#### Status Pill
- `role="status"` with `aria-live="polite"` when the state changes
- Accessible name reads the label ("Draft", "Pending HOD Approval", "Approved", "Published")
- When clickable (some pills link somewhere), rendered as `<button>` or `<a>`
- Icon is decorative

#### Setup Progress Summary
- `role="region"` with `aria-labelledby` on a "Setup progress" heading
- Progress ring is a Progress Bar (see above)
- Action button follows Button accessibility

#### Setup Checklist Row
- Each row is a `<a>` or `<button>` with the category name as accessible name
- State icon has aria-hidden (state announced via row text)
- Blocked state: `aria-disabled="true"` + explanation text as accessible description
- Row hover reveals action hint via title attribute (redundant with visual)

#### Timestamp Caption
- Read as regular text — no special ARIA needed
- Uses `<time>` element with `datetime` attribute for machine-readability

#### Timetable Grid — Read-Only Variant
- Table semantics: `<table>` with `<caption>` ("Timetable for [context]") + column and row headers
- Each cell has an accessible name incorporating time slot + day + content ("Monday, 9 AM — Data Structures, Prof. Sharma, Room 101")
- Empty cells have accessible text "Free"
- Mobile list variant: semantic list (`<ul>` per day) with day as heading

#### Timetable Grid — Edit Variant
- Same table semantics as Read-Only variant
- Cells are `<button>` elements (semantic — announces "editable")
- Selected cell: `aria-selected="true"`
- Cells with conflicts: `aria-invalid="true"` (Blocking) or `aria-describedby` pointing to conflict message
- Keyboard navigation: arrow keys move between cells, Enter opens Cell Edit Drawer

#### Timetable Cell (Read-Only)
- Content is legible via screen reader (subject, faculty, room)
- Lab coordinator second person, when present, is announced

#### Timetable Cell (Edit)
- Same as Read-Only + `aria-selected` and `aria-invalid` when applicable

#### Conflict Badge
- Blocking: `role="alert"` — announces immediately
- Warning: `role="status"` with `aria-live="polite"`
- Informational: `role="status"` with `aria-live="polite"`
- Each has an accessible label ("Blocking conflict: Prof. Sharma is already teaching...")
- Icon decorative; text label carries meaning

#### Cell Edit Drawer
- Same as Drawer component + specifics:
- Live conflict updates announced via aria-live region inside the drawer
- Save button announces state ("Save", "Save disabled — 2 blocking conflicts", "Save with warnings")
- Faculty/Room selectors' filtered options: filtered-out entries mentioned with reason on demand (aria-describedby)

#### Post-Generation Summary Panel
- `role="region"` with `aria-labelledby` on "Generation complete" heading
- Announced via aria-live when first appearing
- Gap and conflict lists are semantic lists

#### Bulk Import Stepper
- Same as Dialog for outer overlay
- Step indicator announces current step ("Step 2 of 4: Upload")
- Validation table follows Table accessibility rules
- Errors announced when validation completes

#### View Controls
- Toolbar wrapped in `<div role="toolbar" aria-label="Timetable view controls">`
- Day/Week toggle uses Tab Group semantics
- Filter uses Select semantics
- Export buttons follow Button accessibility

---

## Part 3: Testing and verification

### 3.1 During Figma design

- Use Figma's contrast plugins on every text-and-background pair
- Design focus states as explicit variants of each interactive component
- Include mobile touch target sizes in your component specifications

### 3.2 During implementation (later, at Claude Code Development stage)

- Every component uses semantic HTML and appropriate ARIA
- Every interactive element has visible focus indication and keyboard operability
- Test with keyboard only (no mouse) — every task in every flow must be completable
- Test with a screen reader (VoiceOver on macOS or NVDA on Windows) on Admin's Setup and Timetable flows, HOD's Approvals, and Read-Only shell viewing

### 3.3 Automated tooling

- axe-core or similar automated accessibility scanner runs on every route
- Lighthouse accessibility score of 100 is the target (not a substitute for manual testing, but a floor)

---

## What's out of scope for this document

- **AAA compliance** — this system targets AA, not AAA. AAA compliance would require sacrificing some density decisions.
- **Cognitive accessibility beyond WCAG 2.2 AA** — designing for dyslexia, autism, ADHD specifically is beyond baseline compliance. This is worth revisiting in a future phase if the user base includes populations where it's critical.
- **Assistive technology support beyond mainstream screen readers** — voice input (Dragon), eye-tracking, switch access are not explicitly designed for. Semantic HTML gives us a baseline of support, but not testing against these tools.
- **Internationalization / RTL** — English-only in this scope. RTL layout support is deferred.

---

## Cross-references

- Foundation tokens for focus rings, motion, and color contrast: `FOUNDATIONS.md`
- Component variants and states this doc annotates: `COMPONENTS.md`, `DOMAIN_COMPONENTS.md`
- Copy patterns that support accessibility (specific error text, meaningful labels): `PATTERNS.md`
- Principle 6 (accessibility as build constraint): `DESIGN_PRINCIPLES.md`
