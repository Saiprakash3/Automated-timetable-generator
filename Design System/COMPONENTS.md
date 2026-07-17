# Components (Generic)

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-DS-001
Evidence status: Category B — component specs are design judgments grounded in shadcn/ui conventions and the constraints established in previous documents. Not user-validated. Component *inventory* (which components exist) traces to specific principles in `DESIGN_PRINCIPLES.md`.

---

## Purpose

Specify every generic component in the system — the reusable building blocks that aren't timetable-specific. For each: variants, sizes, states, anatomy, tokens consumed from `FOUNDATIONS.md`, and any usage constraints.

Timetable-specific components (grid, cell, status pill, conflict badge, etc.) live in `DOMAIN_COMPONENTS.md`. Accessibility details per component live in `ACCESSIBILITY.md`.

## How to use this document

**When building a component in Figma:** pull the spec below, wire it to your Foundation variables, and build the listed variants and states. If you feel like adding a variant or state not listed here, that's a signal — either the spec is wrong (raise it) or the addition isn't needed.

**When a design uses a component:** don't add one-off variations. If a design needs something the component doesn't support, the component gets updated, not the design.

**Reference format per component:** each has a Purpose, Variants, Sizes (where applicable), States, Anatomy, Tokens consumed, and Notes. Some sections are omitted when they don't apply.

---

## A. Actions

### A.1 Button

**Purpose:** Primary interactive element for user-initiated actions.

**Variants:**
| Variant | When to use |
|---|---|
| Primary | The single primary action per screen or dialog (Save, Publish, Send for Approval, Generate) |
| Secondary | Neutral actions alongside a primary (Cancel, Back) |
| Destructive | Reject, delete, remove — any action with permanent consequences |
| Ghost | Subtle actions, especially in dense contexts (table row actions) |
| Link | Text-only actions inline with body content (View details) |

**Sizes:** `sm` (32px height), `default` (40px height), `lg` (48px height). Default is the reference; `sm` for dense contexts like table rows, `lg` for prominent CTAs in empty states or hero areas.

**States:** default, hover, focus-visible, active (pressed), disabled, loading (spinner replaces label, click blocked).

**Anatomy:** icon (optional, left) + label + icon (optional, right). Loading state: spinner replaces left icon; label stays.

**Tokens consumed:**
- Padding: `space-3` horizontal (default size), `space-2` (sm), `space-4` (lg)
- Border radius: `--radius` (6px)
- Font: `--text-sm` at medium weight (default and sm), `--text-body` at medium weight (lg)
- Height comes from padding + font — not a hardcoded value
- Primary: `--primary` background, `--primary-foreground` label
- Destructive: `--destructive` background, `--destructive-foreground` label
- Focus ring: `--ring` shadow
- Transition: `--duration-fast` + `--ease-standard`

**Notes:**
- Only one Primary button visible at a time in any screen or dialog. Secondary buttons can appear multiple times.
- Never use color alone to distinguish variants — the Primary button also has a solid fill, the Ghost has none. Color + fill together carry the meaning.
- Icon-only buttons use the Icon Button component (below), not a Button with no label.

---

### A.2 Icon Button

**Purpose:** Compact action trigger where the icon carries the meaning (close, more, edit).

**Variants:** Ghost (default — no fill), Primary (filled, for high-emphasis single actions), Destructive.

**Sizes:** `sm` (32×32px), `default` (40×40px), `lg` (48×48px). All sizes preserve 44×44px minimum touch target per Principle 6 — the icon may be 16/20/24px but the invisible tap area is at least 44×44px on all sizes.

**States:** default, hover, focus-visible, active, disabled.

**Tokens consumed:**
- Icon size: `--icon-sm` (16px) inside default button, `--icon-md` (20px) inside lg
- Border radius: `--radius` for default, `--radius-full` for pill/circular icon buttons
- Focus ring: `--ring`

**Notes:**
- Every Icon Button requires an accessible label (`aria-label` or `aria-labelledby`). No exceptions — this is a Principle 6 constraint enforced at the component level.
- Icon Buttons appearing without an obvious meaning (icon isn't universally recognizable) also need a Tooltip.

---

## B. Inputs

### B.1 Input

**Purpose:** Text entry for any typed value.

**Variants:** Text (default), Number, Date/Time, Textarea (multi-line).

**Sizes:** `sm` (32px height), `default` (40px height). No `lg` — inputs don't scale with prominence.

**States:** default, hover, focus, filled, disabled, read-only, error, success.

**Anatomy:** label (above, optional) + icon (left, optional) + input area + icon (right, optional) + helper text or error message (below, optional).

**Tokens consumed:**
- Padding: `space-3` horizontal
- Border: `--border-1` at rest, `--border-2` in focus/error/success
- Border color: `--border` (default), `--ring-color` (focus), `--destructive` (error), `--success-500` (success)
- Border radius: `--radius`
- Background: `--background` (default), `--muted` (disabled)
- Font: `--text-body` for the value, `--text-sm` for the label and helper text

**Notes:**
- The "success" state is used sparingly — only when validation confirmation adds value (a unique-name check, an email-format confirmation). Don't show success on every valid field; it's visual noise.
- Read-only state is visually distinct from disabled — read-only preserves value legibility (foreground color unchanged), disabled dims everything. Per Principle 5, read-only is a designed state.
- Error message text is always paired with an error icon or text-based indicator, not color alone (Principle 6).

---

### B.2 Select / Dropdown

**Purpose:** Choose one or more values from a bounded list.

**Variants:** Single-select, Multi-select, Searchable (typeahead).

**Sizes:** Match Input sizes — `sm`, `default`.

**States:** default, hover, focus, open (menu visible), filled (value selected), disabled, error.

**Anatomy:** label (above) + trigger (looks like an Input with a chevron icon on the right) + menu (dropdown panel with options) + selected value(s) display.

**Tokens consumed:**
- Trigger: same tokens as Input
- Menu: `--shadow-2`, `--radius`, `--background`, `--border`
- Menu z-index: `--z-dropdown`
- Menu appear/disappear: `--duration-default` + `--ease-enter` / `--ease-exit`
- Selected item highlight (in menu): `--accent` background
- Multi-select chips (inside trigger): `--radius-full`, `--muted` background

**Notes:**
- Always use the Searchable variant when option count exceeds ~8. Below that, plain scroll is fine.
- Multi-select shows selected values as chips inside the trigger, up to 3 chips + "and N more" — full list appears on hover/focus.

---

### B.3 Checkbox / Radio / Switch

**Purpose:** Boolean or single-value selection presented inline with a label.

**Variants:** Checkbox (multi-selection or single-boolean), Radio (single-selection from a group), Switch (immediate state toggle).

**Sizes:** `sm` (16px control), `default` (20px control).

**States:** unchecked, checked, indeterminate (Checkbox only), focus, disabled.

**Tokens consumed:**
- Control size follows `--icon-sm` or `--icon-md`
- Border: `--border-2`
- Checked color: `--primary`
- Focus ring: `--ring`
- Label: `--text-body` at regular weight, positioned to the right of the control with `space-2` gap
- Touch target: minimum 44×44px total (control + hitbox around it)

**Notes:**
- Radio requires a group (Radio doesn't exist standalone — that's a Switch).
- Switch is used for immediate-effect toggles (dark mode, notifications on/off). Checkbox is used for form-scope selections that apply on Save.
- Indeterminate state on Checkbox is only for parent checkboxes with mixed child states (e.g., "select all" when some rows are selected).

---

## C. Feedback

### C.1 Toast / Alert

**Purpose:** Non-blocking notification of a system event.

**Variants:** Info, Success, Warning, Danger.

**States:** entering, visible, exiting.

**Anatomy:** icon + title + description (optional) + dismiss button (optional) + action button (optional).

**Tokens consumed:**
- Background: `--info-100` / `--success-100` / `--warning-100` / `--danger-100` per variant
- Border: `--border-2` in matching palette (500 stop)
- Foreground: matching 700 stop
- Border radius: `--radius`
- Shadow: `--shadow-3`
- Z-index: `--z-toast`
- Enter animation: slide from top-right, `--duration-moderate` + `--ease-enter`
- Auto-dismiss (Info, Success): 5 seconds. Warning: 8 seconds. Danger: no auto-dismiss — user must dismiss.

**Notes:**
- Toasts are for **system-initiated** informational messages (Save succeeded, HOD's approval arrived). User-initiated confirmations go through Confirmation Dialog (see C.4).
- Never use Toast for critical errors that block a workflow — that's what inline validation or Confirmation Dialog is for.
- Only one Toast visible at a time. If a second event fires, the first dismisses first (unless the first is Danger with no auto-dismiss).

---

### C.2 Tooltip

**Purpose:** Brief contextual explanation on hover or focus.

**Sizes:** Single size — `--text-sm` label with `space-2` padding, `--radius-sm`.

**States:** hidden, visible.

**Tokens consumed:**
- Background: `--gray-900`
- Foreground: `--gray-50`
- Shadow: `--shadow-2`
- Z-index: `--z-tooltip`
- Delay in: 500ms hover before appearing (immediate on focus)
- Delay out: 100ms
- Animation: fade + subtle scale, `--duration-fast` + `--ease-enter`

**Notes:**
- Tooltips are always **supplementary**, never essential. Meaning conveyed only in a tooltip fails accessibility.
- Tooltips on desktop appear on hover; on mobile, they appear on tap-and-hold (or convert to a bottom sheet on touch devices — decide per component).

---

### C.3 Progress Bar

**Purpose:** Visible indication of task completion state.

**Variants:** Determinate (known percentage), Indeterminate (unknown duration).

**Sizes:** `sm` (4px bar height), `default` (8px), `lg` (12px).

**States:** default, complete (100%).

**Tokens consumed:**
- Track background: `--muted`
- Fill: `--primary`
- Border radius: `--radius-full` on both track and fill
- Animation (determinate updates): `--duration-default` + `--ease-standard`
- Animation (indeterminate): loop, `--ease-standard`

**Notes:**
- Prefer Determinate whenever backend can report progress. Indeterminate is a fallback, not a default (Principle 3).
- Never combine Progress Bar with a Skeleton for the same task — one or the other. Progress Bar tells the user "we're X% done." Skeleton tells them "content is coming."

---

### C.4 Skeleton Loader

**Purpose:** Placeholder shape for content still loading.

**Sizes:** Match the shape of the content it stands in for (text lines, table rows, cards).

**States:** loading (visible, subtle pulse).

**Tokens consumed:**
- Background: `--muted`
- Animation: subtle opacity pulse, 1.5s loop, `--ease-standard`
- Border radius: `--radius-sm` for small blocks, `--radius` for larger blocks

**Notes:**
- Skeleton should approximate the layout of the incoming content — not a generic gray rectangle. If a table is loading, skeleton rows should look like table rows.
- Never combine with a spinner in the same view.

---

### C.5 Confirmation Dialog

See §D.3 below. Confirmation Dialog is technically a specialization of Dialog but treated as its own component due to specific patterns per Principle 2.

---

## D. Overlays

### D.1 Dialog / Modal

**Purpose:** Focused interaction that requires user attention, blocking the underlying page.

**Sizes:** `sm` (400px), `default` (560px), `lg` (720px), `xl` (960px). Bulk Import Stepper uses `xl`.

**States:** hidden, entering, open, exiting.

**Anatomy:** backdrop + container + header (title + close button) + content + footer (actions).

**Tokens consumed:**
- Container background: `--background`
- Container border radius: `--radius-lg`
- Container shadow: `--shadow-4`
- Container max-height: 85vh (content scrolls internally if longer)
- Backdrop: `--backdrop`
- Container z-index: `--z-modal`
- Backdrop z-index: `--z-modal-overlay`
- Enter: `--duration-moderate` + `--ease-enter` (backdrop fades, container fades + subtle scale-up from 96%)
- Exit: `--duration-fast` + `--ease-exit`
- Padding: `space-6`
- Gap between header/content/footer: `space-4`

**Notes:**
- Close via Escape key (Principle 6), close button, or clicking backdrop (unless destructive — see D.3).
- Focus traps inside the modal until dismissed.
- Only one Dialog visible at a time. If a second must appear, the first must dismiss first (except for a Confirmation Dialog spawning from within a Dialog — allowed).

---

### D.2 Drawer / Side Panel

**Purpose:** Contextual editing or detail panel docked to one side of the screen, keeping the underlying content visible.

**Variants:** Right-docked (default — used for Cell Edit Drawer), Left-docked (rare — reserved for future use).

**Sizes:** `sm` (400px wide), `default` (480px), `lg` (600px). Cell Edit Drawer uses `default`.

**States:** hidden, entering, open, exiting.

**Anatomy:** backdrop (optional, transparent — click to dismiss without blocking view) + container + header + content + footer.

**Tokens consumed:**
- Container background: `--background`
- Container border: `--border-1` on the docked edge, `--border` color
- Container shadow: `--shadow-3` (drawer sits lower elevation than modal)
- Container z-index: `--z-drawer`
- Backdrop z-index: `--z-drawer-overlay`
- Backdrop: `hsl(0 0% 0% / 0.2)` — lighter than Dialog backdrop; drawer isn't fully blocking
- Enter: `--duration-moderate` + `--ease-enter` (slides in from docked edge)
- Padding: `space-6`

**Notes:**
- Drawer is used specifically for the cell-edit flow per `INTERACTION_DECISIONS.md` §5. The underlying grid stays visible and interactive-adjacent (mouse-over shows highlight on other cells so Admin can see where conflicts point to).
- Drawer stays open across multiple edits — Admin can click another cell and the drawer updates rather than closing.
- Dismiss via Escape, close button, or clicking outside the drawer.

---

### D.3 Confirmation Dialog

**Purpose:** Explicit user confirmation before an action proceeds — especially destructive or irreversible ones.

**Variants:** Reversible (default), Destructive, Irreversible.

**Sizes:** `sm` (400px). Confirmation dialogs are compact by design.

**Anatomy:** icon (semantic per variant) + title + description + optional content slot + action buttons (Cancel + Confirm).

**Tokens consumed by variant:**

| Variant | Icon | Icon color | Confirm button | Type-to-confirm | Use for |
|---|---|---|---|---|---|
| Reversible | info circle | `--info-500` | **Primary** | No | Non-destructive confirms — Discard changes, HOD "Request changes" (`PATTERNS.md` §6.2) |
| Destructive | warning triangle | `--warning-500` | **Destructive** | No | A bounded removal only Admin sees — Remove Faculty/Subject/Lab, Delete a Draft, Regenerate over edits (`PATTERNS.md` §1.1, §6.3, §8.3) |
| Irreversible | warning triangle | `--danger-500` | **Destructive** | Yes (Publish) | Changes what every user sees, or destroys a term's work — Publish, wipe (`PATTERNS.md` §1.2) |

> **Why three (added 2026-07-17).** This section originally defined two variants, with Reversible taking `--info-500` + Primary. But `PATTERNS.md` §1.1 ("Reversible **destructive** — delete, remove") *also* pointed at the Reversible variant while requiring a warning triangle and a Destructive confirm — so the two documents specified the same variant differently, and a single variant could not serve both a collaborative confirm ("Request changes") and a delete. Splitting **Destructive** out resolves it: Reversible keeps this section's original treatment, Destructive carries §1.1's, and the three now read as a clean escalation — **info → warning → danger**. All three `-500` stops clear 3:1 on the dialog background (info 3.9, warning 3.94, danger 4.01).

**Behavior differences:**
- Reversible / Destructive: backdrop click dismisses; Escape dismisses.
- Irreversible: backdrop click does *nothing*; only explicit Cancel or Confirm proceeds. Escape dismisses.
- Publish variant specifically: description must name the consequence explicitly ("This will replace the currently published timetable. This cannot be undone.").
- If Publish variant includes type-to-confirm: user must type "Publish" into an input field before the Confirm button becomes enabled.

**Notes:**
- Confirmation Dialog is *not* used for validation errors or system messages — it's only for user-initiated actions that need explicit approval.
- Never phrase the description as a question ("Are you sure?"). State the consequence ("This will replace the currently published timetable.") — questions invite reflexive Yes clicks.

---

## E. Containers

### E.1 Card

**Purpose:** Visually grouped block of related content.

**Variants:** Default (border only), Elevated (subtle shadow), Interactive (whole card is clickable).

**States:** default, hover (Interactive only), focus (Interactive only).

**Anatomy:** header (optional) + content + footer (optional).

**Tokens consumed:**
- Background: `--card`
- Border: `--border-1`, `--border` color
- Border radius: `--radius`
- Padding: `space-6`
- Elevated variant shadow: `--shadow-1`
- Interactive hover: `--shadow-2`
- Interactive focus: `--ring`

**Notes:**
- Cards are used sparingly — most content areas don't need card wrapping. Use Cards when content is genuinely a discrete unit worth visually separating.
- Don't nest Cards. If content inside a Card needs sub-grouping, use dividers or `space-6` gaps, not nested Cards.

---

### E.2 Empty State

**Purpose:** Communicate the absence of content in a way that tells the user what's expected.

**Variants:** Empty (nothing yet — with next-action guidance), Filtered-empty (nothing matches current filter), Error (something went wrong — with retry).

**Sizes:** Inline (fits within a container, ~200px min-height), Full-page (fills a route, ~400px min-height).

**Anatomy:** icon or illustration (top, `--icon-xl` or larger) + title (H3) + description (Body) + action button (optional).

**Tokens consumed:**
- Icon color: `--muted-foreground` (Empty), `--muted-foreground` (Filtered), `--danger-500` (Error)
- Title: `--text-h3` at semibold, `--foreground`
- Description: `--text-body`, `--muted-foreground`
- Vertical stack with `space-4` gaps

**Notes:**
- Per Principle 3, every Empty State includes what to do next. "No records yet — click Add Faculty to start" beats "No records yet."
- Empty States are never a placeholder for a loading state — use Skeleton for loading, Empty State only when the data legitimately doesn't exist.
- Don't use decorative illustrations for Empty States unless there's a clear reason. A simple icon is usually better than a stock illustration.

---

## F. Navigation

### F.1 Tab / Tab Group

**Purpose:** Switch between sibling views within a container.

**Variants:** Line (underline indicator), Pill (filled background indicator), Segmented (bordered group).

**Sizes:** `sm`, `default`.

**States (per tab):** default, hover, active (selected), disabled, focus.

**Tokens consumed:**
- Active indicator: `--primary`
- Text: `--muted-foreground` (inactive), `--foreground` (active)
- Transition: `--duration-fast` + `--ease-standard`
- Border radius: `--radius-sm` for Segmented and Pill; none for Line

**Notes:**
- Tabs are for lateral navigation (sibling views), not hierarchical navigation (parent/child).
- Maximum 5 visible tabs at once. More than 5 → use a Select instead, or reconsider the information architecture.
- Pill variant is used inside dense contexts (filters); Line variant is used at page level.

---

### F.2 Breadcrumb

**Purpose:** Show and navigate the hierarchical path to the current view.

**States:** default, hover (on each link segment).

**Tokens consumed:**
- Text: `--muted-foreground` for parent links, `--foreground` for current segment (non-link)
- Separator: `/` or chevron icon in `--muted-foreground`
- Font: `--text-sm`

**Notes:**
- Only used in Admin shell — HOD and Read-Only shells don't have depth requiring breadcrumbs.
- Only two levels typically (e.g., "Setup / Faculty"). Rarely three.

---

## G. Data Display

### G.1 Table

**Purpose:** Structured display of rows and columns of data.

**Variants:** Default, Sortable (columns can sort ascending/descending), Selectable (rows can be selected with checkboxes).

**Sizes:** `sm` (compact row height), `default`, `lg` (spacious). Setup screens use `default`; the timetable grid itself is a specialized component (see `DOMAIN_COMPONENTS.md`).

**States (per row):** default, hover, selected (Selectable variant), disabled.

**Anatomy:** header row + body rows + optional footer + optional pagination.

**Tokens consumed:**
- Row background: `--background` at rest, `--muted` on hover
- Border between rows: `--border-1`, `--border` color (or `--border-0` for compact borderless variant)
- Header background: `--muted`
- Header text: `--text-label` at semibold
- Cell padding: `space-3` (sm), `space-4` (default), `space-6` (lg)
- Sortable column indicator: chevron icon that rotates on sort direction change
- Sticky header shadow when scrolled: `--shadow-2`

**Notes:**
- Per audit §17.5, tables must support column sorting — this is a core requirement, not optional.
- Empty state within a Table uses the Table's own layout (empty row with centered Empty State) rather than replacing the entire Table.
- Loading state: Skeleton rows (default 5 rows).

---

### G.2 Badge / Pill

**Purpose:** Compact label carrying status or metadata (generic — Status Pill for timetable status lives in `DOMAIN_COMPONENTS.md`).

**Variants:** Default, Outline, Solid, Ghost. Semantic variants for feedback: Info, Success, Warning, Danger.

**Sizes:** `sm` (20px height), `default` (24px height).

**Tokens consumed:**
- Border radius: `--radius-full` (default pill shape) or `--radius-sm` (rectangular badge)
- Padding: `space-2` horizontal, `space-0.5` vertical
- Font: `--text-label` at semibold
- Colors: per semantic variant, using 100/700 stop pairing (bg/fg)

**Notes:**
- Use Badge for tags, categories, counts. Use Pill (rounded-full variant) for status.
- Semantic variants share color logic with Toast — same palette pairings.

---

## G.3 Login Form

**Purpose:** Single shared authentication entry point for all five roles (Admin, HOD, Faculty, Lab Coordinator, Student). Supersedes an earlier three-variant model (separate Admin/Faculty/Student logins) — see `DECISION_LOG.md` entry dated 2026-07-13 for the reversal record.

**Context on credentials:** Per confirmed decision, users do not self-register or self-set passwords — credentials are system-generated and issued to users. This means there is **no self-service forgot-password flow** in scope. Instead, the pattern is "contact Admin for credential help."

**Context on login attempts:** No attempt limit or account lockout. Unlimited login attempts are allowed, since passwords are admin-issued with no self-service reset — locking an account after failed attempts would risk permanently stranding a user with no recovery path except contacting Admin anyway, so the lockout mechanism adds friction without adding real protection here.

**One shared form, not variants.** All five roles use the identical screen — same fields, same layout, same visual treatment. The only differentiator is the role dropdown value the user selects.

**Anatomy:**
- Product name / logo (top)
- Heading: "Log In" (role-neutral — the form doesn't presume a role before selection)
- Identifier field (ID / roll number / email — labeled generically, e.g. "ID or Email")
- **Role dropdown** ("Your role") — options: Admin, HOD, Faculty, Lab Coordinator, Student. Uses the Select component (§B.2), single-select, not searchable (only 5 options).
- Password field (with show/hide toggle)
- Submit button ("Log In," Primary variant, full-width)
- Error message area (appears above or below the form on failure)
- Footer: "Trouble logging in? Contact your administrator." — plain text, not a link to a self-service flow

**Critical security note:** The role dropdown is a **UI convenience, not a trust boundary.** The backend must independently validate that the selected role matches the authenticated user's actual role record — a user cannot gain elevated access by simply selecting "Admin" in the dropdown with non-admin credentials. This must be flagged explicitly for the backend developer; it is not a frontend-enforceable constraint.

**States:**
- Default (empty form, no role selected)
- Filled (identifier + password + role all set, submit enabled)
- Submitting (button shows loading state, fields disabled)
- Error — invalid credentials (error message + identifier/password fields flagged, per Pattern 2.1 conventions)
- Error — role mismatch (valid credentials, but selected role doesn't match the account's actual role — distinct message from invalid credentials, since the user needs a different correction: change the dropdown, not their password)
- Error — account issue (e.g., account disabled — distinct message, same visual treatment)

**Tokens consumed:**
- Form container: centered, `--container-sm` (400px) max-width
- Card wrapper: `--card` background, `--radius-lg`, `--shadow-2`, `space-8` padding
- Fields: standard Input component tokens (§B.1)
- Role dropdown: standard Select component tokens (§B.2)
- Submit button: standard Button component tokens (§A.1), full-width, `default` size
- Error message: `--destructive` foreground, `--text-sm`, positioned per Pattern 2.1 (icon + specific message)
- Footer text: `--text-sm`, `--muted-foreground`

**Copy template — invalid credentials error:**
```
Incorrect ID/email or password.
```

**Copy template — role mismatch error:**
```
This account isn't registered as [selected role]. Check your role selection and try again.
```

**Copy template — account disabled/issue:**
```
This account is inactive. Contact your administrator.
```

**Notes:**
- No "Remember me" checkbox unless a session-length decision is made elsewhere — not currently in scope.
- No self-service password reset link, per the credential model above. The footer contact line is the entire recovery path.
- No lockout after repeated failed attempts, per the login-attempts note above — this should be treated as a deliberate decision if questioned later, not an oversight.
- Show/hide password toggle is an Icon Button (eye icon) inside the password field, per standard pattern — improves usability without weakening security posture.
- Post-login routing (which shell/screen a user lands on) is determined by their validated role record, not by the dropdown selection alone — the dropdown selection and the validated role should match by the time routing happens, since a mismatch is caught as an error state before login succeeds.
- This component's single-shared-login model reverses the three-variant model in earlier drafts of this document and in `INFORMATION_ARCHITECTURE.md`'s original role/login table — see `DECISION_LOG.md` for the record and `INFORMATION_ARCHITECTURE.md` for the corrected table.

---

## H. Shells

Shells are the outer frame of the application for each role. Per Principle 4, they share the same tokens but differ in layout and density.

### H.1 Admin Shell

**Purpose:** Dense, workflow-oriented shell for the Admin role. Supports Setup (multi-category workflow) and Timetable (generate/edit/review) work.

**Layout:**
- Left sidebar (240px wide, fixed)
- Top bar (56px height, fixed) — contains breadcrumb + Status Pill (right-aligned) + user menu
- Main content area (fills remaining space, scrolls internally)

**Sidebar contents:**
- Logo / product name (top)
- Primary navigation: Setup, Timetable — as top-level items
- Setup expands to show the 9 setup categories as sub-items, each with completion state indicator
- User info + settings (bottom)

**States:**
- Sidebar: expanded (default at ≥1280px), no collapsed variant (Admin doesn't need mobile — Principle 7)
- Top bar Status Pill: reflects current timetable state (Draft / Pending / Approved / Published / No Timetable Yet)

**Tokens consumed:**
- Sidebar background: `--muted`
- Sidebar border-right: `--border-1`, `--border`
- Top bar background: `--background`
- Top bar border-bottom: `--border-1`, `--border`
- Active nav item: `--primary` background at 10% opacity, `--primary` foreground
- Nav item padding: `space-3` vertical, `space-4` horizontal
- Z-index (sidebar, top bar): `--z-sticky`

**Notes:**
- Sidebar sub-items (setup categories) show a small state icon per row: empty (○), partial (◐), complete (●), blocked (⊘ — with reason on hover).
- Top bar Status Pill is clickable when leading somewhere useful (e.g., Pending Approval → jumps to the preview of what was sent).

---

### H.2 HOD Shell

**Purpose:** Minimal shell for the HOD role, whose job in this system is narrower (approvals + own teaching schedule).

**Layout:**
- Top bar (56px height, fixed) — logo + Approvals + My Timetable as prominent horizontal nav + Status Pill (right, when relevant) + user menu
- Main content area (fills below top bar, single column, max width ~1024px centered)

**No sidebar.** HOD's two destinations are prominent enough for top-bar treatment. Per audit §3.3, HOD needs "a clean review-and-approve experience, not a configuration screen."

**States:**
- Approvals nav item: shows a count badge when items are pending. Hidden entirely when zero.
- Status Pill in top bar: only visible when HOD is viewing a timetable (Approvals detail view, My Timetable).

**Tokens consumed:**
- Top bar: same tokens as Admin's top bar
- Nav items: `--text-body` at medium weight
- Content max-width: `--container-xl` (1280px)
- Content horizontal padding: `space-8`

**Notes:**
- HOD shell is desktop-primary, tablet-usable (per Principle 7). No mobile layout.
- Approvals detail view uses the read-only timetable grid variant from `DOMAIN_COMPONENTS.md`.

---

### H.3 Read-Only Shell

**Purpose:** Mobile-first minimal shell for Faculty, Student, Lab Coordinator, and HOD-as-teacher viewing their own timetable.

**Layout (mobile, ≤640px):**
- Top bar (48px height, fixed) — product name + user avatar (right)
- Below top bar: role greeting ("Hi, [Name]") + "Published — as of [date]" timestamp caption
- Main content: single-column responsive layout of the user's schedule

**Layout (tablet/desktop, ≥768px):**
- Top bar (56px height)
- Same layout as mobile but grid-based schedule view instead of vertical list

**States:**
- No auth-error state (login handles that at the shell root)
- Empty (no assignments this term) — shown as Empty State within main content

**Tokens consumed:**
- Top bar background: `--background`
- Top bar shadow: `--shadow-1` (subtle lift on scroll)
- Content padding: `space-4` mobile, `space-6` tablet, `space-8` desktop
- Timestamp caption: `--text-sm`, `--muted-foreground`
- Content max-width on desktop: `--container-xl`

**Notes:**
- Per Principle 7, this shell is the only one that must be responsive down to 360px viewport.
- View Controls (day/week toggle, filter, export) appear as a compact toolbar above the schedule — sticky on scroll.

---

## Component count

| Category | Count |
|---|---|
| Actions | 2 |
| Inputs | 3 |
| Feedback | 4 |
| Overlays | 3 |
| Containers | 2 |
| Navigation | 2 |
| Data Display | 3 (Table, Badge/Pill, Login Form) |
| Shells | 3 |
| **Total generic components** | **22** |

Combined with 13 domain-specific components (`DOMAIN_COMPONENTS.md`), the full inventory is **35 distinct components**.

---

## What this document does not decide

- Exact pixel values for anything not derivable from `FOUNDATIONS.md` — those values are your Figma craft.
- Timetable-specific components (Grid, Cell, Status Pill, Conflict Badge, etc.) — `DOMAIN_COMPONENTS.md`.
- Cross-component patterns (Publish confirmation flow, validation error patterns, copy templates) — `PATTERNS.md`.
- Detailed accessibility annotations per component — `ACCESSIBILITY.md`.
