# Domain Components (Timetable-Specific)

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-DS-001
Evidence status: Category B. These components are custom to this system — none of them exist in shadcn/ui or any general-purpose library, so specifications here are entirely design judgments grounded in `INTERACTION_DECISIONS.md`, `DESIGN_PRINCIPLES.md`, and specific audit findings. Not user-validated.

---

## Purpose

Specify the 13 custom components that are unique to this timetable domain. Unlike `COMPONENTS.md` (generic building blocks that map to shadcn primitives), these components either don't exist in shadcn or require substantial customization to serve this system's needs. This is where the real design work of the project lives.

Every component here references generic components from `COMPONENTS.md` where relevant — Status Pill uses Badge as a base, Timetable Grid uses Table conventions, etc.

---

## 1. Status Pill

**Purpose:** Single most important visual element in the system (Principle 1). Communicates the current state of a timetable at all times, in every shell.

**Variants (5, matching all lifecycle states):**

| Variant | Label | Icon | Color pairing |
|---|---|---|---|
| No Timetable Yet | "No timetable yet" | `--icon-sm` document-outline | `--gray-100` bg, `--gray-700` fg |
| Draft | "Draft" | pencil | `--status-draft-bg`, `--status-draft-fg` |
| Pending HOD Approval | "Pending HOD Approval" | clock | `--status-pending-bg`, `--status-pending-fg` |
| Approved | "Approved" | check-circle | `--status-approved-bg`, `--status-approved-fg` |
| Published | "Published" | globe or radio | `--status-published-bg`, `--status-published-fg` |

**Sizes:** `sm` (used in dense contexts — sidebar rows, table cells), `default` (used in the shell top bar, primary display).

**States:** default, hover (only when clickable — some pills link somewhere, e.g., Pending Approval → preview of what was sent).

> ✅ **Clickable destination pinned down 2026-08-01.** This spec left "some pills link somewhere" open. As built, the pill links to exactly one place: **draft history** (the Timetable screen's "Manage drafts" panel, `PATTERNS.md` §8.3). It becomes interactive *only* when there is history to open — archived drafts exist AND the timetable isn't mid-review (Pending/Approved), which is the same condition that governs whether the panel renders at all, so the two can't disagree.
>
> **The element type follows the behaviour**, deliberately: with no destination the pill renders as a plain `<span>`, not a disabled-looking button. A pill that looks clickable and does nothing is the exact dead-click this resolved — it was reported as a bug ("I can't click the draft button") precisely because a status badge read as an affordance.
>
> The Pending-Approval → preview link suggested above is **not built** — there is no separate "what was sent" preview screen; the Approval Detail view already serves that purpose for HOD.
>
> **In Figma (`90:57`), 2026-08-01:** the variant set gained an `Interactive` boolean, taking it to **20 variants** (5 States × 2 Sizes × 2 Interactive). `Interactive=true` underlines the label — the same delta as the code's `hover:underline`. The matrix is deliberately **complete rather than scoped to the states that can actually be clickable** (realistically only Draft and Published, and only at `default` size): an incomplete variant set trips Figma's "missing combinations" warning and makes the component awkward to pick from, and a filled cell costs nothing but documents the treatment if the interactive rule ever widens.
>
> **The hover underline is scoped to the label, not the pill.** On Published it would otherwise swallow the timestamp too — underlining the whole "Published — Mar 15, 2:30 PM" string reads as a rule struck through the pill rather than as an affordance on the thing you click through to. `StatusPill.tsx` therefore wraps the label in its own `<span>` and puts `group-hover/pill:underline` on that span, leaving the ` — {timestamp}` suffix as a sibling text node outside it. Verified in the browser under real hover: the button and the wrapper both compute `text-decoration-line: none`, only the 79px label box underlines, and the 146px timestamp does not. The group is **named** (`group/pill`) so an ancestor's unnamed `group` can never trigger it.
>
> ⚠️ **Figma `90:57` still diverges here.** Its `Interactive=true` Published variants underline the full string, because the underline was applied with `findAllWithCriteria({types:['TEXT']})` across every text node in the variant. Figma should follow the code: underline the label text node only.

**Anatomy:** icon (left, 16px) + label + timestamp suffix (only for Published — "Published — Mar 15, 2:30 PM").

**Tokens consumed:**
- Border radius: `--radius-full`
- Padding: `space-2` horizontal, `space-1` vertical
- Font: `--text-label` at semibold, `tracking-wide`
- Height: 28px (default), 20px (sm)
- Transition: `--duration-fast` + `--ease-standard` on state changes
- Focus ring (when clickable): `--ring`

**Critical placement rules per Principle 1:**
- Always visible in the shell top bar when viewing a timetable — never inside scrollable content.
- On mobile (Read-Only shell), the Status Pill appears below the top bar in the greeting row, but still fixed / non-scrolling.
- The Published variant is the *only* one that shows a timestamp inline — because "how current is this" is the question this variant specifically answers.

**Meaning-not-color rule (Principle 6):** every variant has a distinct icon and distinct label text. A colorblind user reading the label + icon alone can distinguish all five states without color at all.

---

## 2. Setup Progress Summary

**Purpose:** Persistent visual answer to "how much of setup is done" (Principle 3, addresses audit §7.4, §14.1).

**Location:** Fixed at the top of the Setup Overview screen — always visible when Admin is anywhere in Setup.

**Anatomy:**
- Left: progress ring or bar showing "N of 9 categories complete"
- Middle: text summary — "6 of 9 categories complete. 3 remaining before generation is available."
- Right: contextual action button — "Generate Timetable" (enabled when all 9 complete) or "Continue Setup" (jumps to next incomplete category)

**Variants:** Zero-state (0/9), In-progress (1-8 of 9), Complete (9/9).

**Tokens consumed:**
- Container: `--card` background, `--radius-lg`, `--shadow-1`, `space-6` padding
- Progress ring: `--primary` for filled, `--muted` for unfilled, 8px stroke
- Text: `--text-h3` for the count ("6 of 9"), `--text-body` for the description
- Complete-state accent: `--success-500` for the ring when 9/9

**Behavior:**
- Ring animates on completion state change: `--duration-moderate` + `--ease-emphasized`
- The action button changes label and destination as state changes:
  - 0/9: "Start Setup" → jumps to Faculty (first category)
  - 1–8: "Continue Setup" → jumps to next incomplete category
  - 9/9: "Generate Timetable" → moves to Timetable area

**Notes:**
- Do not show this component anywhere except Setup Overview. It's not a top-bar element — it belongs where Setup work happens.
- Position it at the top of Setup, above the checklist of categories.

---

## 3. Setup Checklist Row

**Purpose:** Individual row for each of the 9 setup categories, showing state and providing entry point.

**States (per row):**

| State | Icon | Icon color | Row treatment |
|---|---|---|---|
| Empty (no data) | empty-circle | `--muted-foreground` | Default |
| Partial (some data, incomplete) | half-circle | `--warning-500` | Default with subtle warning border-left |
| Complete | filled-check-circle | `--success-500` | Default |
| Blocked by dependency | lock icon | `--muted-foreground` | Dimmed background, inline dependency reason |

**Anatomy:** state icon (24px, left) + category name (H3-sized) + short description + record count if any ("12 faculty added") + chevron (right, indicates navigation).

**Tokens consumed:**
- Padding: `space-4` vertical, `space-6` horizontal
- Border-bottom between rows: `--border-1`, `--border`
- Hover background: `--muted`
- Blocked-state background: `--muted` (rest state)
- Border-left accent (Partial state): `--border-4` with `--warning-500`
- Font — name: `--text-h3` at semibold
- Font — description/count: `--text-sm`, `--muted-foreground`

**Behavior:**
- Clickable (except Blocked state) — navigates to the category screen.
- Blocked state: showing an inline reason ("Requires Faculty to be added first"), no chevron, click does nothing.
- Hover reveals a hint like "Click to add records" or "Click to review" per state.

**Notes:**
- Per `INTERACTION_DECISIONS.md` §2, ordering is enforced softly through this Blocked state — the row is visible and in place, but not enterable until its dependency is satisfied.
- The Partial state's border-left accent is a subtle "keep going here" signal, not a warning — its color is `--warning-500` but the tone is more informational than alarming.

---

## 4. Timestamp Caption

**Purpose:** Communicate freshness for read-only timetable views ("how current is this").

**Usage:** Directly beside or beneath the Published Status Pill; also in the Read-Only shell's greeting row.

**Format templates:**
- Recent (within 24h): "Published today at 2:30 PM"
- Recent (within 7 days): "Published Wednesday at 2:30 PM"
- Older: "Published Mar 15, 2026 at 2:30 PM"

**Tokens consumed:**
- Font: `--text-sm`, `--muted-foreground`
- Weight: regular

**Notes:**
- Never combined with a Draft, Pending, or Approved Status Pill — freshness only matters for Published state.
- On mobile, this often becomes the primary way users answer "am I looking at the current one" — larger relative importance in the mobile Read-Only shell than desktop.

---

## 5. Timetable Grid — Read-Only Variant

**Purpose:** The primary view of a published timetable for Faculty, Student, Lab Coordinator, HOD-as-teacher. Also used for HOD reviewing (F-04) and Admin viewing Approved-state (F-05) — same read-only design serves all three, per Principle 5.

**Layout:**
- Columns: the 6 teaching periods **plus a non-selectable Lunch column** (see §5.1)
- Rows: days (Monday through Saturday, typically — **every built screen uses Mon–Fri**; see the open question in the review doc)
- Cells: contain the assigned class/lab/free slot

### 5.1 Time slot model (confirmed by Prakash, 2026-07-16)

| Slot | Time | Type |
|---|---|---|
| Period 1 | 9:00 – 10:00 | Class |
| Period 2 | 10:00 – 11:00 | Class |
| Period 3 | 11:00 – 12:00 | Class |
| **—** | **12:00 – 1:00** | **Lunch break** |
| Period 4 | 1:00 – 2:00 | Class |
| Period 5 | 2:00 – 3:00 | Class |
| Period 6 | 3:00 – 4:00 | Class |

Periods are **60 minutes**. There is no mid-morning break.

**Lunch column:** rendered in both grid variants between Period 3 and Period 4 — a narrow (72px) `--muted` column labelled "Lunch". It is **not a cell**: it has no fill/hover affordance in the Edit variant and can never hold a session.

**Lab placement rules:**
- A lab is **always 2 consecutive periods**.
- It must stay **inside one block** — pre-lunch (Periods 1–3) or post-lunch (Periods 4–6).
- **Valid lab slots:** 9:00–11:00 (P1–P2), 10:00–12:00 (P2–P3), 1:00–3:00 (P4–P5), 2:00–4:00 (P5–P6).
- **Invalid:** any lab spanning 11:00–1:00 — it would cross lunch. This extends conflict #10 in `INTERACTION_DECISIONS.md` §1.2 (Blocking).

**Slot selection:** wherever Admin picks a time slot (Cell Edit Drawer, Elective Basket config), the **12:00–1:00 lunch slot is never offered** — only the 6 teaching periods appear.

**A time slot is a period, not a day+period.** Pickers read `Period N · H:MM–H:MM` (e.g. `Period 5 · 2:00–3:00`) with **no day component**. This applies to the Elective Basket's slot (`USER_FLOWS.md` F-06: *"Admin picks the time slot the basket will occupy"*) and the Cell Edit Drawer's `Time slot` field. Both pickers therefore offer exactly 6 options.

> A **day** is only named where the UI is identifying a *specific cell* rather than selecting a slot — e.g. the Cell Edit Drawer header (`Period 3 · Monday`) and the Post-Generation Summary Panel's gap list (`Monday · Period 4 · III-CSE-A`). Those stay day-qualified.

*Evidence: Category A — confirmed by Prakash (2026-07-16). Day-vs-period model confirmed 2026-07-16.*

**Sizes:** Desktop (≥1024px), Tablet (768–1023px), Mobile (<768px — ~~becomes a vertical day list rather than grid, per Principle 7~~ **keeps the grid and scrolls horizontally; see Mobile adaptation below, revised 2026-08-01**).

**Variants:**
- Full-week view (default on desktop)
- Single-day view (toggle-available via View Controls; **no longer the mobile default** as of 2026-08-01 — mobile shows the full week and scrolls)
- Print/export view (separate stripped-down variant)

**Anatomy:**
- Sticky top row with time slot labels
- Sticky left column with day labels
- Cell area (main content)
- Optional: legend showing color coding for regular/lab/elective
- Filter controls above (day/week toggle, filter by subject or faculty)

**Tokens consumed:**
- Grid background: `--background`
- Cell borders: `--border-1`, `--border`
- Sticky headers: `--muted` background, `--shadow-2` on scroll
- Font — headers: `--text-label` semibold
- Font — cell content: `--text-sm`
- Cell padding: `space-2`
- Cell radius: `--radius-none` (per `FOUNDATIONS.md` §3.2 — grid cells stay sharp)

**Mobile adaptation:**

> 🔄 **Superseded 2026-08-01 (Prakash).** Mobile now renders **the same day×period grid as desktop**, scrolling horizontally when it doesn't fit, rather than reflowing into a vertical day-list. The day column is pinned (`sticky left-0`) so the row stays identifiable while scrolling sideways, and the column headers compress to start times only (`9:00`) since the period *number* carries no meaning for a read-only viewer.
>
> **Why the reversal:** the day-list and the grid had drifted into two different mental models of the same data — a phone user and a desktop user reading "their timetable" were looking at genuinely different artifacts, and only the grid shows the shape of a week (gaps, back-to-back blocks, free afternoons). Horizontal scroll is the honest trade: a day×period matrix cannot reflow to 375px without becoming something else, so it keeps its real proportions instead.
>
> The original day-list spec is preserved below as the superseded design.

- ~~Below 768px, grid becomes a vertical list: each day is a section header, sessions listed as cards underneath, chronologically.~~
- ~~Card-per-session shows: time, subject, faculty, room, and lab-coordinator (if lab).~~
- ~~Sticky day-section headers as the user scrolls.~~

**Notes:**
- No hover state on cells in this variant — no editing affordances (Principle 5).
- Cell click on desktop can drill down to a detail view (subject description, faculty full name and email). Optional; not required in v1.
- Empty cells (no class) show a subtle "Free" indicator, not blank — helps confirm the view is loading correctly.

---

## 6. Timetable Grid — Edit Variant

**Purpose:** Admin's editable view of a Draft timetable (F-02, F-03). Includes conflict indicators, hover affordances, click-to-edit interaction.

**Layout:** Same as Read-Only variant, but designed at Admin desktop breakpoints only (≥1280px, per Principle 7). No mobile layout for this variant.

**Key visual differences from Read-Only:**
- Cells show hover state (visual affordance for editability)
- Cells with conflicts show Conflict Badge overlays (see §9)
- Empty cells are visibly distinct — dashed border or subtle icon indicating "click to fill"
- Selected/focused cell highlighted with `--ring`
- Right-docked Cell Edit Drawer (see §10) opens when a cell is clicked

**Anatomy additions vs. Read-Only:**
- "Regenerate Section" button on section headers (optional feature — allows Admin to re-run the algorithm just on one section rather than the whole timetable)
- Conflict summary indicator at grid level ("3 conflicts remaining") — clickable, jumps to first unresolved

**Tokens consumed (additions to Read-Only):**
- Hover background: `--muted`
- Focus ring: `--ring`
- Empty cell dashed border: `--border` at 50% opacity
- Selected cell: `--primary-100` background, `--primary-500` border via `--border-2`

**Behavior:**
- Click a cell → Cell Edit Drawer opens on the right, grid stays interactive on the left. Grid does not dim or defocus.
- While drawer is open, hovering other cells in the grid can highlight where the current-drawer's assignments conflict (e.g., "this faculty is also teaching here" — that other cell gets a highlight ring).
- Escape closes drawer.

**Notes:**
- Grid width is intentionally wide — desktop breakpoint allows full week + all time slots without horizontal scroll at 1280px+.
- Vertical scrolling within grid is expected for sections with many rows.

---

## 7. Timetable Cell — Read-Only Variant

**Purpose:** Individual cell in the read-only grid.

**Variants by session type:**

| Type | Visual treatment |
|---|---|
| Regular class | Neutral background, subject label prominent |
| Lab | Teal accent (`--teal-bg` / `--teal-fg`) + lab icon — per confirmed decision, teal is reserved for domain-category identification, and lab sessions are the primary use case |
| Elective | Accent from `--warning-100` + basket indicator |
| Free slot | Blank cell with faint "Free" text in `--muted-foreground` |
| Cross-section elective (3rd/4th year) | Same as Elective but with basket name shown |

**Anatomy:**
- Subject name (top, bold, `--text-sm`)
- Faculty name (middle, `--text-sm`, `--muted-foreground`)
- Room/lab identifier (bottom, `--text-label`, `--muted-foreground`)
- Optional: lab-coordinator second person (Labs only)

**Tokens consumed:**
- Padding: `space-2`
- Border: `--border-1`, `--border` (except in Read-Only grid where cells share borders)
- Text: as per Anatomy

**Notes:**
- Text truncation with ellipsis for long names; full name in tooltip on desktop hover, in a detail sheet on mobile tap.

---

## 8. Timetable Cell — Edit Variant

**Purpose:** Editable cell in the Admin's edit grid.

**States (in addition to Read-Only Cell states):**
- Empty (not yet filled)
- Filled (has data)
- Selected (currently open in the Edit Drawer)
- Has-conflict (one or more Conflict Badges visible)
- Recently-changed (subtle highlight indicating this cell was just edited in this session)

**Anatomy additions vs. Read-Only Cell:**
- Conflict Badge overlays (positioned top-right of cell, stacked if multiple)
- Recently-changed indicator: subtle `--primary-100` background flash on save, fades over 3 seconds

**Tokens consumed (additions):**
- Selected state: `--primary-100` background, `--border-2` in `--primary-500`
- Recently-changed flash: `--primary-100` → transparent, `--duration-slow` + `--ease-exit`
- Has-conflict state: no specific cell-level style; the Conflict Badge carries the visual

**Notes:**
- Cell always shows current values, even while Drawer is open and being edited — changes appear on Save, not live-as-you-type.
- Conflict Badges appear as soon as the backend responds to the edit (per `INTERACTION_DECISIONS.md` §1.3 — severity comes from backend).

---

## 9. Conflict Badge

**Purpose:** The single most important custom component in the system after Status Pill. Visualizes the 3-tier severity model from `INTERACTION_DECISIONS.md` §1.3 across 15 conflict types.

**Variants (3 severity tiers):**

| Variant | Color pair | Icon | Behavior |
|---|---|---|---|
| Blocking | `--conflict-blocking-bg` / `--conflict-blocking-fg` / `--conflict-blocking-border` | X-circle or ban | Prevents save; drawer holds field open |
| Warning | `--conflict-warning-bg` / `--conflict-warning-fg` / `--conflict-warning-border` | triangle-alert | Allows save with explicit "Accept and continue" acknowledgment |
| Informational | `--conflict-info-bg` / `--conflict-info-fg` / `--conflict-info-border` | info-circle | No gating; purely surface visibility |

**Sizes:**
- Inline (used within Cell Edit Drawer next to specific fields — 24px height)
- Overlay (used on Cell surface in the grid — 20px diameter, positioned top-right corner)
- Summary (used in the Post-Generation Summary Panel — full-width row-height row)

**Anatomy (Inline size):**
- Severity icon (left, 16px)
- Short problem statement (single line, `--text-sm`)
- Details link ("View" — expands to show the full conflict message)

**Anatomy (Overlay size, on grid cell):**
- Just the severity icon on a colored background dot, no text
- Tooltip on hover shows the full message

**Anatomy (Summary size, in Post-Generation Summary):**
- Severity icon + type label + count of instances + jump-to-first action

**Tokens consumed:**
- Border radius: `--radius-sm` (inline, summary), `--radius-full` (overlay)
- Font: `--text-sm` (inline, summary), no text (overlay)
- Border: `--border-2` in matching palette 500 stop
- Animation: `--duration-default` + `--ease-emphasized` on appear
- Shadow (overlay only, sits above cell): `--shadow-1`

**Meaning-not-color enforcement (Principle 6):**
- Each severity has both a distinct color AND a distinct icon shape.
- The text label of the conflict message names the severity ("Cannot save: faculty already teaching in this slot" for Blocking; "Warning: exceeds faculty load limit" for Warning; "Note: overlapping subject with another elective" for Informational).

**Notes:**
- Multiple conflicts on the same cell: badges stack in overlay position, showing count if more than 2 ("3+" chip).
- The Blocking badge is the strongest visual moment in the entire system — its color, weight, and animation are intentionally emphatic. Do not soften it.

---

## 10. Cell Edit Drawer

**Purpose:** The docked side panel where Admin edits a single cell's assignments, with live conflict feedback (`INTERACTION_DECISIONS.md` §5).

**Layout:**
- Right-docked drawer, `default` size (480px wide)
- Grid remains visible on the left, interactive

**Anatomy:**
- Header: cell identifier (e.g., "Monday, Period 3 — CSE-A Section")
- Close button (top-right)
- Content sections:
  - Subject selector (Select component from `COMPONENTS.md`)
  - Faculty selector (Select, filtered to available faculty at that slot)
  - Room selector (Select, filtered to available rooms)
  - For labs only: Second person selector (Coordinator or Faculty-acting-as-coordinator), Batch identifier
  - For electives only: Basket selector, Elective within basket
- Live Conflict Badges (Inline variant) appearing between fields whenever a change triggers backend feedback
- Footer: Save button + Cancel button

**States:**
- Default (fields at their current cell values)
- Editing (fields differ from current cell values, Save enabled)
- Conflict-blocked (has Blocking conflicts, Save disabled)
- Conflict-warning (has Warnings, Save requires "Accept and continue")
- Saving (Save button shows loading state)
- Saved (transient — briefly shows "Saved" confirmation before drawer closes or Admin moves to next cell)

**Behavior:**
- Live conflict check: every field change triggers a backend call, response returns conflict list with severity, badges appear/disappear as user edits
- Escape closes drawer without saving (with unsaved-changes confirmation if fields are dirty)
- Save button state depends on conflict state (see §9)
- Clicking another cell in the grid while drawer is open: prompts to save/discard current, then loads new cell into drawer (does not open a second drawer)

**Tokens consumed:**
- All from Drawer component in `COMPONENTS.md` §D.2
- Field spacing: `space-4` between form sections
- Conflict Badge appears/disappears: `--duration-default` + `--ease-emphasized`

**Notes:**
- The Faculty selector's dropdown shows available Faculty AND, on hover per option, shows why the others were excluded (e.g., "Prof. Sharma — already teaching CSE-B in this slot"). This transparency addresses audit §11.3 — showing type/affected resource/cause.
- Save is always explicit — no auto-save. Cell only updates when Admin confirms.

---

## 11. Post-Generation Summary Panel

**Purpose:** After a fresh generation runs (F-02), Admin sees a summary of what happened before reviewing the grid in detail. Addresses `INSIGHTS.md` item 3 and directly serves Principle 3.

**Layout:** Full-width panel below the Timetable Grid on first landing after generation, dismissible.

**Anatomy:**
- Header: "Generation complete" with timestamp
- Success block: "X sessions placed successfully" (green accent)
- Gaps block: "Y unresolved gaps" (warning accent) — list of gaps with jump-to-cell links
- Conflict block: Any conflicts introduced by the algorithm — grouped by Conflict Badge Summary variant
- Actions: "Review Grid" (primary, dismisses summary) + "Regenerate" (secondary, re-runs)

**Tokens consumed:**
- Container: `--card`, `--radius-lg`, `--shadow-2`, `space-6` padding
- Sections separated by `space-6` gaps, dividers `--border-1`
- Success indicator: `--success-500`
- Gaps indicator: `--warning-500`
- Conflict Badges as in §9 Summary variant

**States:**
- Default (visible)
- Dismissed (hidden — Admin has clicked "Review Grid" or the close button)

**Notes:**
- This panel appears only after a fresh generation. Editing a cell later does not re-show this panel — that would be noisy.
- Dismissing the panel doesn't dismiss the underlying data — unresolved gaps and conflicts remain visible via badges on the grid itself.

---

## 12. Bulk Import Stepper

**Purpose:** Contained modal for uploading, validating, and committing bulk data (F-01, per `INTERACTION_DECISIONS.md` §6).

**Layout:** Modal (Dialog `xl` size — 960px wide), multi-step stepper inside.

**Steps:**
1. **Template**: Download the CSV template with column headers explained
2. **Upload**: File input, accepts .csv only, size limit shown
3. **Validate**: Preview table of parsed rows with per-row status (valid ✓, error ✗ with reason)
4. **Confirm**: Summary — "N valid rows will be added, M skipped rows have errors"; explicit Confirm action

**Anatomy:**
- Dialog header with step title and step indicator (e.g., "Step 3 of 4: Validate")
- Content area varies per step
- Footer: Back + Continue (or Confirm on final step) + Cancel

**States (per step):**
- Step 1: static content, Continue enabled
- Step 2: default (no file), file selected, upload in progress, upload failed
- Step 3: parsing, showing validation results, allow re-upload if errors
- Step 4: showing summary, awaiting Confirm

**Tokens consumed:**
- Modal from `COMPONENTS.md` §D.1
- Step indicator: Progress Bar variant + step count text
- Validation table: Table component from `COMPONENTS.md` §G.1
- Per-row status: Badge component with success or danger variant

**Behavior:**
- Cannot advance past Step 3 if the "valid rows" count is 0 — nothing to import.
- On Confirm (Step 4), progress bar shows import happening; Modal closes only after all rows are committed; Setup Overview updates completion.
- Errors from server during import: stay in Modal, show error state, allow retry.

**Notes:**
- Template CSV includes example rows to reduce format guesswork.
- Per audit §7.8, bulk import is critical but currently absent — this is a substantial upgrade to Admin experience.

---

## 13. View Controls

**Purpose:** Toolbar above the timetable grid providing view options (day/week toggle, filter, print/export).

**Layout:** Horizontal toolbar, sticky beneath the shell top bar when the grid is scrolled.

**Anatomy:**
- Left: Day/Week toggle (Segmented Tab variant)
- Middle: Filter dropdown (Select with searchable variant)
- Right: Export/Print action buttons (Ghost variant)

**Variants:**
- Full (desktop): all controls visible
- Compact (tablet): filter and export collapsed into a "More" menu
- Mobile: sticky bar collapses to a single "Filters" button that opens a Drawer

**Tokens consumed:**
- Bar background: `--background`
- Bar border-bottom: `--border-1`, `--border`
- Bar shadow when scrolled: `--shadow-1`
- Padding: `space-3` vertical, `space-6` horizontal
- Height: 56px

**Notes:**
- Filter options vary by role (Admin can filter by any dimension; Faculty can only filter by day/week).
- Export currently a stub (PDF export deferred to future scope). Print is CSS-based, uses print stylesheet.
- Day/Week toggle is the mobile default = Day; desktop default = Week.

> **As built, 2026-08-01 — scope is narrower than the three variants above.**
>
> - **Only the Full variant exists.** Compact and Mobile aren't built because the Grid this toolbar sits above is desktop-only by design (§6), so there is no breakpoint where a collapsed toolbar would have a grid to control.
> - **Export renders disabled**, matching the "stub" note. Print is real and drives `window.print()`; shell chrome and action buttons carry `print:hidden` so the printout is the schedule alone.
> - **The filter is the section selector**, not a faculty/subject filter — "any dimension" collapses to one dimension in the built product, since a day×period grid is inherently per-section.
> - **It only appears on the Admin and HOD screens**, not on the Read-Only My Timetable screens — a personal schedule has a single section and one week, so every control on the bar would be inert there. The three Figma read-only desktop screens (`340:573`, `341:573`, `341:593`) drew one; **removed 2026-08-01 (Prakash's call)** so Figma and code agree.
> - **Day/Week toggle has no mobile default to speak of** — see §5's 2026-08-01 revision: mobile shows the full week and scrolls.

---

## 14. Review Note

**What it is:** A persistent, non-dismissible callout banner that appears on the Timetable Draft screen to surface contextual information Admin needs to act on before resubmitting. Unlike a Toast (which is transient and dismissible), a Review Note stays visible for the duration of the session because the information it carries is decision-critical.

**When it is shown:** Only on the Draft screen. Removed when the timetable transitions out of Draft state.

**Variants (by severity):**

| Variant | When used | Color treatment |
|---|---|---|
| Approved | HOD approved — timetable is ready to publish. Shows approver name + timestamp. | `--success-100` bg · `--success-700` text · `--success-500` left border |
| Changes Requested | HOD requested changes — Draft was returned with a reason. Shows HOD's exact reason text. | `--warning-100` bg · `--warning-700` text · `--warning-500` left border |
| Final Draft Warning | Admin is on their 3rd draft (rare edge case — HOD requested changes twice in one cycle). No reason text; system-generated. | `--danger-100` bg · `--danger-700` text · `--danger-500` left border |

**Structure:**

```
[Icon] [Title]
[Body text — 1–3 lines max]
[Optional: attributed source — "HOD requested on [date]"]
```

**Approved variant — copy template:**
```
Icon: check circle (--success-500)
Title: Approved — ready to publish
Body: The HOD approved this timetable. Publishing makes it visible to all faculty, students and lab coordinators.
Attribution: Approved by HOD · [date, time]
```

**Changes Requested variant — copy template:**
```
Icon: warning triangle (--warning-500)
Title: HOD requested changes
Body: [HOD's verbatim reason text, pulled from the Request Changes submission]
Attribution: Requested on [date]
```

**Final Draft Warning variant — copy template:**
```
Icon: warning triangle (--danger-500)
Title: This is your final draft
Body: Review all changes carefully before resubmitting — HOD has already reviewed two versions.
Attribution: [none — system-generated, not attributed to a person]
```

**Behavior:**
- Not dismissible by the user — it stays until the Draft state changes
- Does not prevent any actions (not a blocker, just context)
- If both variants would show at the same time (HOD requested changes AND this is also the 3rd draft), show only the Final Draft Warning — it subsumes the other since the 3rd-draft context is more urgent than the reason text at that moment

**Accessibility:**
- Role: `alert` (ARIA) — screen readers announce it on appearance
- Color is not the only signal — icon + title text carry the meaning independently

**Figma node:** Built during v3. Approved variant confirmed on `Admin — Timetable Approved` screen (subtitle: "Approved by HOD · Mar 16, 10:15 AM" + green Review Note banner). Changes Requested variant on screen `182:4501`. Final Draft Warning variant needs to be added.

**References:** `INTERACTION_DECISIONS.md` §7.3, `PATTERNS.md` §8.2, `USER_FLOWS.md` F-02 draft lifecycle rules.

---

## Component count

| Component | Complexity |
|---|---|
| 1. Status Pill | Medium |
| 2. Setup Progress Summary | Medium |
| 3. Setup Checklist Row | Medium |
| 4. Timestamp Caption | Simple |
| 5. Timetable Grid (Read-Only) | High |
| 6. Timetable Grid (Edit) | High |
| 7. Timetable Cell (Read-Only) | Medium |
| 8. Timetable Cell (Edit) | Medium |
| 9. Conflict Badge | High (3 variants × 3 sizes) |
| 10. Cell Edit Drawer | High |
| 11. Post-Generation Summary Panel | Medium |
| 12. Bulk Import Stepper | High (4-step flow) |
| 13. View Controls | Medium |
| 14. Review Note | Simple (2 variants) |

**Total:** 14 domain-specific components. Combined with 21 generic components in `COMPONENTS.md`, the full inventory is **35 distinct components**.

---

## What this document does not decide

- Specific pixel measurements and layout details — Figma craft.
- Copy templates for messages and states — `PATTERNS.md`.
- Per-component accessibility annotations (ARIA roles, keyboard behavior in detail) — `ACCESSIBILITY.md`.
- Backend API shape for cell edits, conflict returns, bulk import — flagged for backend developer.
