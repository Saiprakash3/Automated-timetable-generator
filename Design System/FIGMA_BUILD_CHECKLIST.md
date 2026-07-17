# Figma Build Checklist — Automated Timetable Redesign

Owner: Sai Prakash
Created: 2026-07-13
Purpose: Step-by-step working checklist for building the design system and all screens in Figma
Sources: All 7 documents in `design-system/` folder + `USER_FLOWS.md`

---

## How to use this checklist

- Work top to bottom — items are ordered by dependency (later items rely on earlier ones being built)
- Check off items as you complete them
- Each phase ends with a verification step — don't skip these; catching gaps early is cheaper than fixing them after screens are assembled
- Every phase references specific documents. When in doubt, the source doc is authoritative — this checklist just operationalizes it
- Suggested cadence at the end is rough; adapt to your own working sessions

---

## Prerequisites — before opening Figma

- [ ] Six color palette values decided (per `DESIGN_PRINCIPLES.md` color planning section)
- [ ] Font family + type scale ratio decided (per `DESIGN_PRINCIPLES.md` typography planning section)
- [ ] Figma account with variables access (variables need Professional plan or the free-tier subset)
- [ ] All 7 design system docs open in tabs for reference
- [ ] `USER_FLOWS.md` and `FLOW_DIAGRAMS.md` open for reference
- [ ] Lucide icon library set up (`lucide.dev` — you can import via Figma plugin)

---

## Phase 0 — Figma file structure

Set up file organization before building anything. Named pages make everything findable later.

- [ ] Create new Figma file: "Timetable Redesign — Design System v1"
- [ ] Create page: **📋 Cover** (project overview, version, changelog)
- [ ] Create page: **📚 Foundations** (tokens, swatches, type samples)
- [ ] Create page: **🧩 Components — Generic**
- [ ] Create page: **🎯 Components — Domain**
- [ ] Create page: **🖼 Shells** (Admin, HOD, Read-Only chromes)
- [ ] Create page: **🖥 Admin Screens**
- [ ] Create page: **📋 HOD Screens**
- [ ] Create page: **📱 Read-Only Screens**
- [ ] Create page: **🚧 WIP** (scratchpad — anything in progress lives here)
- [ ] Create page: **📦 Archive** (deprecated versions)

---

## Phase 1 — Foundations setup

Reference: `FOUNDATIONS.md`

### 1.1 Variables (Figma → Local Variables panel)

- [ ] Create variable collection: "Tokens"
- [ ] Create mode: "Light" (default)

#### Base color variables

- [ ] Neutral 50 → 950 (11 stops)
- [ ] Primary 50 → 950 (11 stops)
- [ ] Success 100, 300, 500, 700, 900 (5 stops)
- [ ] Warning 100, 300, 500, 700, 900 (5 stops)
- [ ] Danger 100, 300, 500, 700, 900 (5 stops)
- [ ] Info 100, 300, 500, 700, 900 (5 stops)

#### Semantic color aliases (reference base tokens above)

- [ ] `--background`, `--foreground`
- [ ] `--card`, `--card-foreground`
- [ ] `--popover`, `--popover-foreground`
- [ ] `--primary`, `--primary-foreground`
- [ ] `--secondary`, `--secondary-foreground`
- [ ] `--muted`, `--muted-foreground`
- [ ] `--accent`, `--accent-foreground`
- [ ] `--border`, `--input`, `--ring-color`
- [ ] `--destructive`, `--destructive-foreground`
- [ ] Status pill pairs: `--status-draft-bg/fg`, `--status-pending-bg/fg`, `--status-approved-bg/fg`, `--status-published-bg/fg`
- [ ] Conflict badge triples: `--conflict-blocking-bg/fg/border`, `--conflict-warning-bg/fg/border`, `--conflict-info-bg/fg/border`

#### Non-color variables

- [ ] Spacing scale (`space-0` through `space-24` — Tailwind default, per §2.1)
- [ ] Border radii (`radius-none`, `radius-sm`, `radius`, `radius-lg`, `radius-xl`, `radius-full`)
- [ ] Border widths (`border-1`, `border-2`, `border-4`)
- [ ] Shadow effects (5 elevation levels + focus ring + backdrop — as Figma effect styles)
- [ ] Motion durations (5 values) — stored as number variables for use in prototype
- [ ] Icon sizes (5 values)
- [ ] Container widths (6 values)
- [ ] Breakpoint markers (5 values — for reference; used to size frames)
- [ ] Z-index tokens (documented on Cover page for team reference; Figma doesn't natively use z-index)

#### Typography variables

- [ ] Font family (`font-sans`, optionally `font-mono`)
- [ ] Font sizes (`text-h1`, `h2`, `h3`, `body`, `sm`, `label`, optionally `mono`)
- [ ] Font weights (regular, medium, semibold; optionally bold)
- [ ] Line heights (tight, normal, loose)
- [ ] Letter spacing (tight, normal, wide)

### 1.2 Figma Text Styles

Create text styles that compose the typography variables above.

- [ ] `H1 — Page Title`
- [ ] `H2 — Section Header`
- [ ] `H3 — Subsection`
- [ ] `Body`
- [ ] `Body Small`
- [ ] `Label`
- [ ] `Mono` (optional — only if you're using it)

### 1.3 Figma Effect Styles

- [ ] `Shadow 0` (none)
- [ ] `Shadow 1` (subtle lift)
- [ ] `Shadow 2` (dropdowns, popovers)
- [ ] `Shadow 3` (drawer)
- [ ] `Shadow 4` (modal)
- [ ] `Focus Ring` (2px ring using `--ring-color`)
- [ ] `Backdrop` (used for modal/drawer scrims)

### 1.4 Foundations visual reference (on Foundations page)

Build proof sheets that show every token visually. These serve as the reference the whole team uses.

- [ ] Color palette section
  - [ ] Neutral scale — 11 swatches side by side with hex codes
  - [ ] Primary scale — 11 swatches
  - [ ] Success, Warning, Danger, Info — 5 stops each
  - [ ] Semantic aliases — sample pairings (bg + fg contrast pairs)
- [ ] Typography section
  - [ ] All 7 type roles with sample text
  - [ ] Weight variations shown
  - [ ] Line height examples
- [ ] Spacing scale — labeled boxes at each stop
- [ ] Border radii — six radius options side by side
- [ ] Elevation — five shadow levels shown on cards
- [ ] Icon sizes — five sizes shown with sample Lucide icon
- [ ] Motion — reference table (Figma doesn't animate reference sheets; document values in text)

### 1.5 Phase 1 verification

- [ ] Every token in `FOUNDATIONS.md` has a corresponding Figma variable
- [ ] Every text/effect style is created and named per convention
- [ ] Contrast check: use Figma's Contrast plugin (or "A11y — Color Contrast Checker") to verify every text/bg pair passes WCAG AA (4.5:1 for body, 3:1 for large text)
- [ ] Cover page has file version + date + link to design system docs

---

## Phase 2 — Generic components

Reference: `COMPONENTS.md` (section headings match A/B/C/D/E/F/G below)

### 2.1 Actions (§A)

- [ ] **Button**
  - [ ] Variants: variant (Primary/Secondary/Destructive/Ghost/Link), size (sm/default/lg), state (Default/Hover/Focus/Active/Disabled/Loading), icon (None/Left/Right/Only)
  - [ ] Wire all fills, borders, text colors to token variables
  - [ ] Verify focus ring visible on Focus state
- [ ] **Icon Button**
  - [ ] Variants: variant (Ghost/Primary/Destructive), size (sm/default/lg), state (Default/Hover/Focus/Active/Disabled)
  - [ ] Ensure 44×44 tap area even at sm size

### 2.2 Inputs (§B)

- [ ] **Input (Text)** — sizes (sm/default), states (default/hover/focus/filled/disabled/read-only/error/success), with/without label + helper + icon
- [ ] **Input (Number)** — extend Text with number-specific styling
- [ ] **Input (Date/Time)** — with calendar affordance
- [ ] **Textarea** — multi-line variant
- [ ] **Select / Dropdown**
  - [ ] Trigger (looks like Input with chevron)
  - [ ] Menu overlay with option items
  - [ ] Variants: single, multi, searchable
- [ ] **Checkbox** — states (unchecked/checked/indeterminate/focus/disabled), sizes (sm/default)
- [ ] **Radio** — same states as Checkbox
- [ ] **Switch** — states (off/on/focus/disabled)

### 2.3 Feedback (§C)

- [ ] **Toast / Alert** — variants (Info/Success/Warning/Danger), with/without title/action/dismiss
- [ ] **Tooltip** — positioned variants (top/bottom/left/right)
- [ ] **Progress Bar** — variants (Determinate/Indeterminate), sizes (sm/default/lg)
- [ ] **Skeleton Loader** — shapes (text line/block/avatar)

### 2.4 Overlays (§D)

- [ ] **Dialog / Modal** — sizes (sm/default/lg/xl)
- [ ] **Drawer / Side Panel** — sizes (sm/default/lg), right-docked
- [ ] **Confirmation Dialog**
  - [ ] Reversible variant
  - [ ] Irreversible variant (destructive confirm button)
  - [ ] Publish variant (with type-to-confirm input)

### 2.5 Containers (§E)

- [ ] **Card** — variants (Default/Elevated/Interactive), states for Interactive
- [ ] **Empty State** — variants (Empty/Filtered-empty/Error), sizes (Inline/Full-page)

### 2.6 Navigation (§F)

- [ ] **Tab / Tab Group** — variants (Line/Pill/Segmented), sizes (sm/default)
- [ ] **Breadcrumb** — 2-3 level examples

### 2.7 Data Display (§G)

- [ ] **Table**
  - [ ] Row sizes (sm/default/lg)
  - [ ] Sortable column header with sort direction indicator
  - [ ] Row states (default/hover/selected)
  - [ ] Empty state within table
  - [ ] Skeleton loading state
- [ ] **Badge / Pill** — variants (Default/Outline/Solid/Ghost), semantic (Info/Success/Warning/Danger), sizes (sm/default)
- [ ] **Login Form** — single shared screen for all 5 roles, no per-role variants
  - [ ] Role dropdown (Admin/HOD/Faculty/Lab Coordinator/Student) — uses Select component
  - [ ] States: Default, Filled, Submitting, Error (invalid credentials), Error (role mismatch), Error (account disabled)
  - [ ] Show/hide password toggle (Icon Button)
  - [ ] Footer "Contact your administrator" line — no forgot-password link (per credential model)
  - [ ] No lockout state — unlimited attempts by design, don't build a locked-out variant

### 2.8 Phase 2 verification

- [ ] Every component in `COMPONENTS.md` §A–G is built
- [ ] Every component uses token variables (no hardcoded hex, spacing, or radii)
- [ ] Component names in Figma match doc names exactly
- [ ] Every interactive component has a Focus state variant

---

## Phase 3 — Shell components

Reference: `COMPONENTS.md` §H

### 3.1 Admin Shell (§H.1)

- [ ] Create frame at 1440×900 (primary)
- [ ] Left sidebar (240px wide)
  - [ ] Logo/product name area
  - [ ] Primary nav: Setup, Timetable
  - [ ] Setup expanded state with 9 sub-items and completion state indicators
  - [ ] User info at bottom
- [ ] Top bar (56px height)
  - [ ] Breadcrumb (left)
  - [ ] Status Pill placeholder (right) — actual pill built in Phase 4
  - [ ] User menu (far right)
- [ ] Main content area (empty, to be filled with screen-specific content)
- [ ] Create additional frame at 1280×800 (minimum desktop) — verify layout still works
- [ ] Create additional frame at 1920×1080 (large monitor) — verify content doesn't stretch awkwardly

### 3.2 HOD Shell (§H.2)

- [ ] Create frame at 1024×768 (primary)
- [ ] Top bar with:
  - [ ] Logo (left)
  - [ ] Approvals nav item (with count badge when applicable)
  - [ ] My Timetable nav item
  - [ ] Status Pill placeholder (right, when viewing a timetable)
  - [ ] User menu
- [ ] Main content area (max-width `--container-xl` centered)
- [ ] Create additional frame at 768×1024 (tablet) — verify layout adapts

### 3.3 Read-Only Shell (§H.3)

- [ ] Create mobile frame at 375×812 (primary)
  - [ ] Top bar (48px) with product name + user avatar
  - [ ] Greeting row: "Hi, [Name]" + timestamp caption
  - [ ] Main content area (single column)
- [ ] Create tablet frame at 768×1024
- [ ] Create desktop frame at 1280×800

### 3.4 Phase 3 verification

- [ ] All three shells use the same tokens (side-by-side comparison — button and text styles should look identical)
- [ ] Only layout density and navigation differ between shells
- [ ] Admin shell doesn't have a mobile layout (correct per Principle 7)
- [ ] Read-Only shell works at 360px viewport (test with a 360×640 frame)

---

## Phase 4 — Domain-specific components

Reference: `DOMAIN_COMPONENTS.md`

### 4.1 Status system (§1, §4)

- [ ] **Status Pill**
  - [ ] Variant: state (No Timetable Yet / Draft / Pending HOD Approval / Approved / Published)
  - [ ] Variant: size (sm / default)
  - [ ] Distinct icon per state (not color alone — Principle 6)
  - [ ] Published variant shows inline timestamp
- [ ] **Timestamp Caption**
  - [ ] Format examples: "Published today at 2:30 PM", "Published Wednesday at 2:30 PM", "Published Mar 15, 2026 at 2:30 PM"

### 4.2 Setup system (§2, §3)

- [ ] **Setup Progress Summary**
  - [ ] Variant: state (Zero-state 0/9 / In-progress e.g. 6/9 / Complete 9/9)
  - [ ] Progress ring with filled + unfilled portions
  - [ ] Contextual action button that changes label per state
- [ ] **Setup Checklist Row**
  - [ ] Variant: state (Empty / Partial / Complete / Blocked-by-dependency)
  - [ ] State icon per state
  - [ ] Partial state has warning border-left accent
  - [ ] Blocked state has dependency reason text + no chevron
  - [ ] Hover state (except Blocked)

### 4.3 Conflict system (§9)

- [ ] **Conflict Badge — Inline size** (used in Cell Edit Drawer)
  - [ ] Variant: severity (Blocking / Warning / Informational)
  - [ ] Distinct icon per severity
  - [ ] Warning variant includes "Accept and continue" action button
- [ ] **Conflict Badge — Overlay size** (used on grid cells)
  - [ ] Same 3 severity variants, dot format
  - [ ] Stack pattern for multiple conflicts (show "3+" when overflow)
- [ ] **Conflict Badge — Summary size** (used in Post-Generation Summary)
  - [ ] Same 3 severity variants, row format
  - [ ] Shows count of instances + "jump to first" action

### 4.4 Timetable Cell (§7, §8)

- [ ] **Timetable Cell — Read-Only Variant**
  - [ ] Variant: session type (Regular / Lab / Elective / Cross-section Elective / Free)
  - [ ] Distinct treatment per type (color accent + icon)
- [ ] **Timetable Cell — Edit Variant**
  - [ ] All Read-Only variants
  - [ ] Additional states: Empty / Filled / Selected / Has-conflict / Recently-changed
  - [ ] Hover state with editability affordance
  - [ ] Selected state uses `--primary-100` bg + `--primary-500` border-2

### 4.5 Timetable Grid (§5, §6)

- [ ] **Timetable Grid — Read-Only Variant**
  - [ ] Desktop full-week view
  - [ ] Desktop single-day view (via View Controls toggle)
  - [ ] Mobile vertical day-list variant
  - [ ] Sticky column headers (time slots)
  - [ ] Sticky row headers (days)
  - [ ] Empty state within grid
- [ ] **Timetable Grid — Edit Variant**
  - [ ] Desktop full-week view (no mobile variant)
  - [ ] Conflict summary indicator ("3 conflicts remaining")
  - [ ] Empty cells styled distinctly (dashed border or "click to fill" indicator)

### 4.6 Complex domain components (§10, §11, §12, §13)

- [ ] **Cell Edit Drawer**
  - [ ] Default state (fields at current cell values)
  - [ ] Editing state (dirty fields, Save enabled)
  - [ ] Conflict-blocked state (Save disabled)
  - [ ] Conflict-warning state (Save requires "Accept and continue")
  - [ ] Saving state (button loading spinner)
  - [ ] Lab variant (shows second person selector + batch identifier)
  - [ ] Elective variant (shows basket + elective-within-basket selector)
- [ ] **Post-Generation Summary Panel**
  - [ ] Success block (count of placed sessions)
  - [ ] Gaps block (list with jump-to-cell links)
  - [ ] Conflict block (grouped Conflict Badge Summary rows)
  - [ ] Actions: Review Grid + Regenerate
- [ ] **Bulk Import Stepper**
  - [ ] Step 1: Template download
  - [ ] Step 2: Upload (with drag-drop area, file constraint messaging)
  - [ ] Step 3: Validation preview table (valid + error rows visible)
  - [ ] Step 4: Confirm summary
  - [ ] Step indicator at top showing progress through the 4 steps
  - [ ] Upload error state
  - [ ] Import-in-progress state
- [ ] **View Controls toolbar**
  - [ ] Full desktop variant (Day/Week toggle + Filter + Export inline)
  - [ ] Compact tablet variant (Export collapsed into More menu)
  - [ ] Mobile variant (single Filters button opens a Drawer)

### 4.7 Review Note (§14) — added post-build, confirmed in v3

- [ ] **Review Note — Changes Requested variant** ✅ Built in v3 (screen `182:4501`)
  - [ ] Warning color treatment (`--warning-100` bg · `--warning-700` text · `--warning-500` left border)
  - [ ] Shows HOD's verbatim reason text + attribution date
  - [ ] ARIA role `alert` set
- [x] **Review Note — Final Draft Warning variant** ✅ Built in v4 (variant `221:44`)
  - [x] Danger color treatment (`--danger-100` bg · `--danger-700` text · `--danger-500` left border) — 3.62:1, passes
  - [x] System copy: "This is your final draft. Review all changes carefully before resubmitting — HOD has already reviewed two versions." (split Title/Body per §14)
  - [x] No attribution line (system-generated, not from a person) — Meta node removed structurally
  - [x] ARIA role `alert` set
- [x] **Review Note — Approved variant** ✅ Built in v4 (variant `221:6082`) — §14 claimed this was already built; it was **hand-drawn on the Approved screen, not a component**. Screen `130:1647` retrofitted onto the real instance.
  - [x] ⚠️ **Deviation:** accent/icon uses `--success-700` (5.5:1), **not** §14's `--success-500` — which measures **2.05:1** and fails `ACCESSIBILITY.md`'s 3:1 floor. See review doc §7.2.

### 4.8 Phase 4 verification


- [ ] All 13 domain components exist
- [ ] Meaning-not-color rule: each Status Pill state has icon + label; each Conflict Badge severity has icon + label
- [ ] Conflict severity behaviors match `INTERACTION_DECISIONS.md` §1.3 (Blocking prevents save, Warning allows with acknowledgment, Informational is passive)
- [ ] Cell Edit Drawer is docked (not full modal) per `INTERACTION_DECISIONS.md` §5

---

## Phase 5 — Admin Screens

Reference: `USER_FLOWS.md` F-01, F-02, F-03, F-05, F-06

### 5.1 Auth and landing

- [ ] Shared Login screen (one screen serving all 5 roles — see Phase 0.1 note; do not duplicate per role)
- [ ] Post-login routing landing (empty — this is a route decision, not a designed screen)

### 5.2 Setup screens (F-01)

- [ ] **Setup Overview** — the primary Setup landing
  - [ ] Setup Progress Summary at top
  - [ ] 9 Setup Checklist Rows below (show variety of states — some Empty, some Partial, some Complete, at least one Blocked)
- [ ] **Faculty** screen (list + add + bulk import affordances)
- [ ] **Lab Coordinators** screen
- [ ] **Subjects** screen
- [ ] **Labs** screen
- [ ] **Rooms** screen
- [ ] **Sections** screen
- [ ] **Time Slot Grid** screen
- [ ] **Subject–Faculty Mapping** screen
- [ ] **Elective Baskets** screen (see F-06 for the specific configuration flow)
- [ ] **Add Single Record modal** (used by each setup screen — one component instance)
- [ ] **Bulk Import Stepper** open on each of its 4 steps
- [ ] **Elective Basket configuration** dedicated screen (F-06 flow)

### 5.3 Timetable screens (F-02, F-03, F-05)

- [ ] **Timetable — No Timetable Yet** state (empty + Generate CTA)
- [ ] **Timetable — Generating** state (loading with progress if measurable, else spinner)
- [ ] **Timetable — Generation Failed** state (failure reason + retry option)
- [ ] **Timetable — Draft state, post-generation** (with Post-Generation Summary Panel visible)
- [x] **Timetable — Draft state, Review and Edit** (Edit Grid, no summary panel) ✅ Built 2026-07-17 — screen `321:7724`. This is the state Admin actually works in: full Edit Grid, Regenerate + Send for approval, no Post-Generation Summary Panel, no Review Note.
  - [x] Carries the **"Last edited today at 2:47 PM"** indicator (Timestamp Caption instance) that `USER_FLOWS.md` F-03 step 7 requires — *"unsaved changes are auto-saved with a 'last edited' indicator"*. No Draft screen had one.
- [ ] **Timetable — Draft (regenerate warning)** ✅ Built 2026-07-17 — screen `319:8901`, Confirmation Dialog (Destructive) per `PATTERNS.md` §6.3. Every Draft screen has a `Regenerate` button; this is the confirmation behind it.
- [ ] **Cell Edit Drawer open on a cell** — captured in these states:
  - [ ] Clean (no changes yet)
  - [ ] Dirty with no conflicts (Save enabled)
  - [ ] Dirty with Blocking conflict (Save disabled)
  - [ ] Dirty with Warning conflict (Accept and continue path)
- [x] **Send for Approval modal** — Dialog `default` (560px) `122:1204` with the optional note. ~~(with HOD email + optional note)~~ **The HOD email field is removed** (2026-07-17) — the email hand-off is gone entirely; confirming sets Pending HOD Approval directly. See `INTERACTION_DECISIONS.md` §11 and `PATTERNS.md` §6.1.
- [ ] **Timetable — Pending HOD Approval** state (locked, read-only for Admin)
- [ ] **Timetable — Approved** state (read-only, Publish CTA visible)
- [ ] **Publish confirmation modal** (irreversible variant with type-to-confirm input)
- [ ] **Timetable — Draft (changes requested)** ✅ Built in v3 (screen `182:4501`) — Review Note (Changes Requested) visible, showing HOD's reason; visually distinguishes returned Draft from a fresh one
- [x] **Timetable — Draft (3rd draft / final warning)** ✅ Built in v4 (screen `222:6078`) — Review Note (Final Draft Warning) persistent banner at top; subtitle marks "Draft 3"
- [x] **Timetable — Published** state
  - [x] Add Delete Draft CTA (available here and at publish-time — per `INTERACTION_DECISIONS.md` §7.4) — Ghost Button instance `227:10`, placed leftmost so the destructive action sits away from Republish
- [x] **Delete Draft confirmation dialog** ✅ Built in v4 — screen `228:6334` + backdrop + dialog `228:6321`
  - [x] Copy: "Delete this draft? / This will permanently remove Draft 2 from the timetable history. This cannot be undone. / [Cancel] [Delete draft]"
  - [x] Uses existing Confirmation Dialog (Reversible variant) — no new component needed
  - [x] ✅ Uses the **Destructive** variant (`PATTERNS.md` §1.1/§8.3), added 2026-07-17.
  - [x] ❌ **My v4 note here was wrong** and is corrected for the record: I claimed the Reversible variant "had to be fixed first — it was an info circle + primary-blue confirm, contradicting `PATTERNS.md` §1.1". It was **not** contradicting anything — an info circle + Primary confirm is exactly what `COMPONENTS.md` **D.3** specifies for Reversible. I checked PATTERNS and never opened D.3. The two docs genuinely disagreed; resolved 2026-07-17 by splitting Reversible / **Destructive** / Irreversible (D.3's escalation table).
- [x] **Delete drafts at publish time** ✅ Built in v4 — `Content` SLOT added to Confirmation Dialog; Publish `132:2359` + Republish `132:2647` now carry "Clean up drafts before making this live"
- [x] **Timetable — Pending HOD Approval (generation blocked state)** ✅ Built in v4 (screen `236:5334`) — Toast (danger) `236:10` with §8.1 copy; Regenerate visibly disabled. Toast sits below the header actions row, not the literal top-right corner, because Danger toasts never auto-dismiss (`COMPONENTS.md` C.1) and would otherwise permanently cover the button they explain.
- [ ] **Republish confirmation** (with warning about overwriting current published)

### 5.4 Phase 5 verification

- [ ] Every user-facing screen in F-01, F-02, F-03, F-05, F-06 is represented
- [ ] Screens use Shell components consistently (no shell-drift)
- [ ] Status Pill in top bar reflects each state correctly across screens

---

## Phase 6 — HOD Screens

Reference: `USER_FLOWS.md` F-04

- [ ] HOD lands on the shared Login screen (built in Phase 5.1) — no separate HOD login screen needed
- [ ] **HOD Landing / Approvals list**
  - [ ] Empty state (no pending approvals — copy: "No approvals pending")
  - [ ] With 1 pending item
  - [ ] With 3+ pending items (verify list layout works)
- [ ] **Approval Detail view**
  - [ ] Read-only timetable grid
  - [ ] Admin's note displayed prominently
  - [ ] Approve action + Request-changes action
- [ ] **Request Changes modal** (with required reason textarea)
- [ ] Post-approval confirmation state (Toast or transient state)
- [x] **HOD's My Timetable view** ✅ Built 2026-07-17 — screen `333:9556`. HOD's own teaching schedule: read-only grid filtered to their 5 sessions, `Published` pill, "Published — as of…" caption, nav highlighted on My Timetable.
  - ⚠️ **Built in the HOD shell, not the Read-Only shell**, despite this line's wording. `INTERACTION_DECISIONS.md` §4.2 defines My Timetable as one of the HOD shell's **two entry points** — dropping HOD into the mobile Read-Only shell would strip the nav and leave no way back to Approvals. Read "uses Read-Only shell" as "uses the read-only *presentation*" (Principle 5). Flag if that reading is wrong.
  - [x] Required componentising the HOD shell's status pill first — it was a hand-built `Status Pill (placeholder)` hardcoded to "Pending Approval". Now a real **`TopbarStatus`** Status Pill instance, matching the Admin shell (Phase 5). This screen needs `Published`; Approval Detail needs `Pending HOD Approval` — one hardcoded pill could not serve both.

---

## Phase 7 — Read-Only Screens

Reference: `USER_FLOWS.md` F-08

### 7.1 Mobile screens (375px primary)

- [ ] Faculty, Lab Coordinator, and Student all land on the shared Login screen (built in Phase 5.1) — no separate login screens needed here
- [ ] **Faculty My Timetable**
  - [ ] Empty state ("No assignments this term")
  - [ ] With assignments (vertical day list)
- [ ] **Student My Timetable**
  - [ ] Empty state
  - [ ] With assignments (including elective slot for 3rd/4th year)
- [ ] **Lab Coordinator My Timetable** (own coordination schedule)
- [ ] **Session detail view** (drill-down when a session is tapped)

### 7.2 Tablet screens (768px)

- [ ] Same screens adapted to a compact grid layout

### 7.3 Desktop screens (1280px)

- [x] Same screens with wider grid layout ✅ Built 2026-07-17 — band *3 · Desktop — 1280* on `📱 Read-Only Screens`:
  - [x] **Student My Timetable (desktop)** `340:573` — their whole section's week, unfiltered (a student attends everything)
  - [x] **Faculty My Timetable (desktop)** `341:573` — filtered to Dr. Sharma's own sessions
  - [x] **Lab Coordinator My Timetable (desktop)** `341:593` — filtered to Mr. Rao's coordinated labs, carrying the *"not counted toward teaching load"* note from the mobile screen
  - [x] **Viewing + downloading:** each carries **View Controls (Full)** — Day/Week toggle, faculty filter, **Export**, **Print**. Export/Print are not edit affordances, so Principle 5 holds.
  - [x] All three schedules are **derived from the published III-CSE-A grid**, not invented.
  - [x] ✅ **Mobile ↔ desktop reconciled 2026-07-17.** The flagged inconsistency is closed. The mobile Faculty screen put Dr. Sharma's DS Lab at Monday 10:00–12:00 for **III-CSE-A**, a slot the grid gives to Operating Sys./Dr. Iyer. The error turned out to be the **section, not the slot** — that lab is **IV-CSE-B's**. Reassigning it cleared the contradiction on both the Faculty and Lab Coordinator screens without moving a single session. Mobile Student's Monday was rebuilt to the grid row exactly (OS 10:00, DBMS 11:00, Networks Lab 14:00–16:00). Desktop Faculty + Lab Coordinator grids extended to match. See review doc §3.26.

### 7.4 Phase 7 verification

- [ ] All Read-Only screens work at 360px minimum viewport
- [ ] Timestamp caption visible on every My Timetable screen
- [ ] No edit affordances anywhere in Read-Only shell (per Principle 5)

---

## Phase 8 — Cross-cutting states

Screens covering states that appear across many flows.

### 8.1 Empty states across the system

- [ ] Setup: empty state per category screen (variation on same template)
- [ ] Timetable: No Timetable Yet (already in Phase 5)
- [ ] HOD: no pending approvals (already in Phase 6)
- [ ] Read-only: no assignments (already in Phase 7)
- [ ] Filtered empty state (search returns nothing — one example screen)

### 8.2 Loading states

- [ ] Skeleton loaders for tables (Setup screens)
- [ ] Generation loading state (already in Phase 5)
- [ ] Bulk import validation loading state
- [ ] Save action loading (button spinner state — captured via component variant)
- [ ] Initial page load skeleton (Admin shell + skeleton content)

### 8.3 Error states

- [ ] Generic error toast (Toast Danger variant)
- [ ] Save failure with reason
- [ ] Generation failure (already in Phase 5)
- [ ] Backend unavailable state during cell edit (F-03 mentions this — degraded mode)
- [ ] Network offline state

---

## Phase 9 — Verification and quality checks

### 9.1 Design system compliance

- [ ] Every component in `COMPONENTS.md` + `DOMAIN_COMPONENTS.md` exists in Figma
- [ ] Every component uses token variables (spot-check: pick 5 random components, verify no hardcoded colors)
- [ ] Component naming matches document naming exactly
- [ ] Focus states present on every interactive component (walk through Components — Generic page and check every one)
- [ ] Read through `ACCESSIBILITY.md` per-component annotations and verify each

### 9.2 Accessibility

- [ ] Run Contrast plugin on every text-and-bg pair — all pass WCAG AA (4.5:1 body, 3:1 large text)
- [ ] Focus rings visible on every interactive element
- [ ] Touch target sizes: 44×44 minimum on mobile screens (verify on Read-Only shell screens)
- [ ] Meaning-not-color rule verified: every color-distinguished state also has icon or text distinguishing it (walk through Status Pill and Conflict Badge specifically)
- [ ] Error states have text + icon indicators, not just red borders

### 9.3 Interaction decisions verification

Walk through `INTERACTION_DECISIONS.md` and verify each decision is reflected in the designs.

- [ ] Setup shown as a checklist (not a wizard, not free-nav) — §2
- [ ] Status Pill in shell header, never inside scrollable content — §3
- [ ] HOD shell genuinely minimal (not just a scaled-down Admin) — §4
- [ ] Cell Edit is a docked drawer, grid remains visible — §5
- [ ] Bulk Import is a contained modal stepper — §6
- [ ] Conflict severity: 3 tiers with distinct behavior per §1.3
- [ ] Reject action labeled "Request changes" throughout UI — `PATTERNS.md` §6.2
- [ ] Publish uses type-to-confirm — `PATTERNS.md` §1.2
- [x] Draft lifecycle decisions (`INTERACTION_DECISIONS.md` §7) — **all verified node-by-node in v4:**
  - [x] Generate button visually disabled on Pending HOD Approval and Approved screens — §7.2. *Note: neither screen had a Generate action at all, so one was added (`Regenerate`, `State=Disabled`) to both — "visually disabled" was previously unrepresentable.*
  - [x] Review Note (Final Draft Warning) appears on 3rd-draft Draft screen — §7.3
  - [x] Delete Draft CTA appears on Published screen and at publish time — §7.4
  - [x] Delete Draft confirmation dialog uses Reversible variant with correct copy — `PATTERNS.md` §8.3
  - [x] No delete affordance on Pending HOD Approval or Approved screens — §7.4 (both confirmed clean)

### 9.4 Flow coverage

Walk through each flow in `USER_FLOWS.md` and verify every step has a corresponding screen.

- [ ] F-01 (Setup) — all steps covered
- [ ] F-02 (Generate, review, send) — all steps covered
- [ ] F-03 (Manual edit with conflict detection) — all steps covered including all conflict severity paths
- [ ] F-04 (HOD review and approve) — all steps covered including Request Changes path
- [ ] F-05 (Admin publishes) — all steps covered
- [ ] F-06 (Configure elective basket) — all steps covered
- [ ] F-07 (Lab session assignment) — verified in F-03 context (Cell Edit Drawer lab variant)
- [ ] F-08 (View personal timetable) — all Read-Only screens covered

---

## Phase 10 — Prototype and handoff prep

### 10.1 Prototype key flows (optional but valuable for review)

Not every screen needs to be prototyped, but a few key flows help reviewers understand the interaction model.

- [ ] Prototype F-01: Setup Overview → click Faculty → add first Faculty → back to Overview (see progress update)
- [ ] Prototype F-03: click a cell → Drawer opens → change Faculty → Blocking conflict appears → change again → no conflict → Save
- [ ] Prototype F-05: Publish flow with type-to-confirm
- [ ] Prototype F-04: HOD Approvals list → open pending → Approve

### 10.2 Handoff readiness

- [ ] Cover page: project name, version, date, changelog
- [ ] Contact info for questions (on Cover page)
- [ ] Export critical screens as PNG for stakeholders without Figma access
- [ ] Document any deviations from design system spec (with rationale) — should be zero deviations ideally

### 10.3 Ready for Claude Design Review

- [ ] Share Figma link (or PNG exports of screens)
- [ ] List any deviations from spec with rationale (if any)
- [ ] List any open questions or uncertainties
- [ ] Prepare a walkthrough narrative (which flow to review first, what to pay attention to)

---

## Suggested working cadence

Rough grouping — you'll pace based on your available hours and how much focused time each session gives you. This is an estimate, not a mandate.

| Session | Phases | Focus |
|---|---|---|
| 1 | 0 + 1 | File setup + Foundations |
| 2 | 2.1 – 2.3 | Actions, Inputs, Feedback (foundational primitives) |
| 3 | 2.4 – 2.7 | Overlays, Containers, Nav, Data Display |
| 4 | 3 | Three Shells |
| 5 | 4.1 – 4.3 | Status system, Setup system, Conflict system |
| 6 | 4.4 – 4.5 | Timetable Cell + Grid variants |
| 7 | 4.6 | Complex domain components (Drawer, Summary, Stepper, View Controls) |
| 8 | 5.2 | Setup screens |
| 9 | 5.3 | Timetable screens |
| 10 | 6 | HOD screens |
| 11 | 7 | Read-Only screens |
| 12 | 8 | Cross-cutting states |
| 13 | 9 | Verification and quality |
| 14 | 10 | Prototype + handoff |

That's a rough 14-session block. Adjust to your reality — some sessions will take longer than others.

---

## Handy Figma plugins for this project

- **Contrast** or **A11y — Color Contrast Checker** — verify WCAG AA compliance
- **Lucide** — icon library that matches your design system (per `FOUNDATIONS.md` §9)
- **Auto Layout** (built-in) — use for every component; makes responsive behavior possible
- **Variables** (built-in) — for all tokens
- **Component Playground** (optional) — testing variant combinations
- **Iconify** (backup icon source) — if Lucide is missing something specific

---

## Tips while building

- **Build smallest usable size first, then scale up variants.** Start with a working default Button, then add sm and lg — not the other way around.
- **Test focus states as you go.** Retrofitting focus rings across 34 components is painful.
- **Use Component Property Inspector** to verify variant coverage before moving to the next component.
- **Name layers meaningfully.** Future you (and the code developer) will spend hours in these files; clear naming saves everyone.
- **Commit components before assembling screens.** Screens are much easier to build when the components underneath are stable and won't change.
- **Keep the WIP page for exploration.** If you're trying an alternative, put it there rather than modifying the canonical component.

---

## What comes next (after this checklist)

Per your project workflow:
1. **Claude Design Review** — I review your Figma work against these specs and flag inconsistencies, accessibility gaps, or missed decisions
2. **Prototype Review** — validate that flow prototypes work end-to-end for the four key flows
3. **Frontend Documentation** — I write code-time handoff docs based on your final Figma designs
4. **Claude Code Development** — I build the React implementation
5. **Testing** — verify against usability criteria
6. **Portfolio Case Study** — document the project
7. **Final Project Audit** — retrospective + gaps for future iteration

Save this checklist somewhere you can update it — check items off as you go. If you hit gaps or contradictions with the design system docs, flag them; that's how we catch mistakes early.
