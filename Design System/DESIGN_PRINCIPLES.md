# Design Principles

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-DS-001
Evidence status: Mixed — principles derive directly from PS-01/02/03 and specific audit findings (Category A citations noted per principle). The way each principle is stated is a design judgment (Category B).

---

## Purpose

Fix the design principles that guide every downstream decision in Design System Planning and Figma work. These aren't abstract values — each principle traces to a specific problem statement or audit finding, and each has concrete implications for what components exist and how they behave.

## How to use this document

**When designing in Figma:** every component you build should be traceable to at least one principle. If you can't say which principle a design decision serves, that's a signal the decision is arbitrary rather than grounded.

**When reviewing designs later (Claude Design Review stage):** the principles here are the ruler. Deviations must be justified against the source problem or audit finding, not just aesthetic preference.

**When adding to the design system later:** new components need a principle to hang on, or they don't belong.

Each of the seven principles below is stated the same way: what it is, why it exists (grounded in a specific document/audit section), what it means when designing in Figma, and which components exist because of it.

---

## Principle 1 — Status is shown before content

**Statement:** Any surface displaying a timetable-related object shows its state (Draft / Pending HOD Approval / Approved / Published, or Setup progress state) prominently and persistently, before the underlying data.

**Why:** PS-01 (state and trust visibility). Audit §14.2 (dashboard has "no visibility into active, draft, or published timetables"), audit §18.5 (nothing surfaces for "generation completion, publishing, pending approvals"), audit §3.6 (students risk "looking at an outdated timetable without realizing it"). This principle makes status a structural element of every screen, not decorative.

**In Figma, this means:**
- Every screen showing a timetable includes a status pill fixed in the shell header (per `INTERACTION_DECISIONS.md` §3).
- Setup Overview leads with a completion summary, not with any individual category.
- Any read-only view shows an "as of [timestamp]" caption so freshness is answerable at a glance.
- Status pill never lives inside scrollable content — it must remain visible even when the grid is scrolled.

**Components this principle requires:**
- Status Pill (variants: Draft, Pending HOD Approval, Approved, Published, No Timetable Yet)
- Setup Progress Summary
- Timestamp Caption

---

## Principle 2 — Prevent, then warn, then inform

**Statement:** The system distinguishes three responses to problematic actions: what it won't let you do (Blocking), what it'll let you do with acknowledgment (Warning), and what it just tells you about (Informational). Each severity has its own visual language and interaction behavior.

**Why:** PS-02 and `INTERACTION_DECISIONS.md` §1. Audit §20.1: "no pre-generation validation, duplicate prevention, confirmation before critical actions." Audit §11.3: existing conflict handling lacks "type, affected resource, cause, or severity." A single "error" state can't do all three jobs — collapsing them means users either dismiss warnings and miss real blockers, or get stopped by trivial issues and lose trust.

**In Figma, this means:**
- Three distinct visual treatments for feedback — not one style at three intensities.
- Blocking states physically prevent progression (save button disabled, form field held open, drawer won't close).
- Warning states allow progression with acknowledgment (explicit "Accept and continue" secondary action).
- Informational states are visible but don't gate anything.
- Publish confirmation is its own pattern (irreversible action) — stronger than a regular confirmation, weaker than blocking.

**Components this principle requires:**
- Conflict Badge (3 variants: Blocking / Warning / Informational)
- Inline Validation Message
- Confirmation Dialog (reversible variant + irreversible variant — Publish specifically)
- Toast / Alert (Informational only)

---

## Principle 3 — Progress is a first-class citizen

**Statement:** Every multi-step or long-running task shows where you are and what's left. This includes Setup completion, generation running, bulk import validation, and the timetable lifecycle from Draft to Published.

**Why:** PS-03 and audit §7.4 ("no indicator of how much setup is done"), §10.3 ("almost no feedback while generation is happening"), §14.1 ("no indication of how much configuration is done"). This is the strongest single UX complaint theme in the audit outside state/trust visibility.

**In Figma, this means:**
- Multi-step processes have visible progress built into their layout — not left to a loading spinner.
- Task lists (Setup categories, bulk import rows, generation summary) show completion state per item.
- Empty states aren't just "nothing here" — they include what's next or what's expected.
- Long-running operations (generation, bulk import validation) have a determinate progress indicator where possible, indeterminate only as a fallback.

**Components this principle requires:**
- Setup Checklist Row (states: empty, partial, complete, blocked-by-dependency)
- Progress Bar (Setup summary, bulk import, generation)
- Empty State (variants for no-data, no-timetable-yet, no-assignments-for-this-user)
- Loading State (skeleton and spinner)

---

## Principle 4 — Consistency across roles, adapted density per role

**Statement:** All roles share the same design tokens, component styles, and visual language. What differs between Admin, HOD, and read-only shells is layout density and navigation structure, not visual identity.

**Why:** Audit §5.9 and §21.7 both call inconsistency out repeatedly ("no real unified visual language yet — layout, type, spacing, and components all vary"). `INTERACTION_DECISIONS.md` §4 confirms HOD's shell is genuinely different in scope, not a scaled-down Admin. This principle keeps the system from fragmenting into three visually distinct products under one roof.

**In Figma, this means:**
- One set of tokens applied across all shells.
- A Button, Input, or Dialog looks and behaves the same in Admin, HOD, and read-only shells.
- Navigation and page density change per shell; the components inside them don't.
- If a component needs a role-specific variant, that's a signal the principle is being violated — revisit whether the difference is real.

**Components this principle requires:**
- Admin Shell (dense multi-item sidebar, top status bar)
- HOD Shell (minimal two-destination layout, top status bar)
- Read-Only Shell (single view, minimal chrome, top status/timestamp only)

---

## Principle 5 — Read-only is a designed state, not a disabled state

**Statement:** Read-only views are designed as first-class experiences, not as edit views with everything grayed out.

**Why:** The flows depend on read-only reliability across three different moments: F-04 (HOD reviewing before approval), F-05 (Approved-state timetable, locked from Admin edits), F-08 (Faculty/Student/Lab Coordinator viewing published). Audit §3.2 explicitly notes "Faculty mostly consume the timetable rather than build it." A read-only view that feels like a broken edit view silently disrespects the people who use the system most.

**In Figma, this means:**
- Read-only variants of the timetable grid are designed intentionally — cell hover behavior, click-to-drill-down where useful, no faded editing affordances that would just be disabled.
- The Approved-state grid (visible to Admin between HOD approval and Publish) uses the same read-only variant, not a disabled edit view.
- Read-only doesn't mean feature-poor — filtering, print/export, day/week toggles are read-only affordances that belong here.

**Components this principle requires:**
- Timetable Grid — edit variant + read-only variant (two distinct designs, not one variant with disabled fields)
- Timetable Cell — edit variant + read-only variant
- View Controls (day/week toggle, filter, print/export)

---

## Principle 6 — Accessibility is a build constraint, not a review checklist

**Statement:** Every component meets WCAG 2.2 AA baseline as part of its definition. Focus states, keyboard behavior, contrast ratios, and ARIA patterns are specified before build, not retrofitted after.

**Why:** Audit §22 lists accessibility as "one of the least developed areas... contrast, keyboard access, focus visibility, accessible forms and errors, responsive interaction, and accessible tables all need attention." Retrofitting accessibility onto a shipped library is significantly more expensive than including it from the start.

**In Figma, this means:**
- Every interactive component includes a focus-visible state as a designed variant, not an afterthought.
- Interactive elements meet minimum touch target size (44×44px) — this applies to icon buttons on desktop shells too.
- Color pairings for text and background pass contrast checks at design time, not at code review.
- State changes have a text or icon indicator, not color alone (a red border is not enough — the message text or icon must communicate the state too).

**Components this principle requires:**
- No new components — this principle applies to every component in the system. Per-component accessibility annotations appear in `COMPONENTS.md` and `ACCESSIBILITY.md`.

---

## Principle 7 — Device use matches role reality

**Statement:** Admin editing is desktop-primary and doesn't need to work on mobile. Personal timetable views (Faculty, Student, Lab Coordinator) must work on mobile because that's where they'll actually be used.

**Why:** Audit §3.2 lists "hard to read on a phone" as a Faculty pain point. §3.6 says students are "generally comfortable with digital tools, especially mobile" and flags "poor mobile readability" as a pain point. Meanwhile, Admin editing is a table-dense, dual-panel task that would degrade badly on mobile — trying to make it responsive would either cripple the desktop experience or produce a mobile experience nobody uses.

**In Figma, this means:**
- Admin shell: designed at desktop breakpoints only (1280px minimum), no mobile responsive requirement.
- HOD shell: desktop-primary, tablet-usable — HOD might review on a tablet, but doesn't need a mobile layout.
- Read-only shell (Faculty / Student / Lab Coordinator): mobile-first, works down to ~360px viewport, adapts up to desktop.
- Don't spend time designing an "Admin edit on mobile" state — it's explicitly out of scope.

**Components this principle requires:**
- Timetable Grid — edit variant is desktop-only.
- Timetable Grid — read-only variant is responsive, including a mobile-adapted layout (likely a vertical day-list format below a certain breakpoint rather than trying to fit the grid).

---

## Color palette (confirmed)

Seven palettes — six as originally planned, plus a Teal accent palette confirmed separately for domain-category identification. Full token values and contrast verification live in `FOUNDATIONS.md` §10; this section records the decision and roles.

### Seven palettes

| # | Palette | Seed | Purpose |
|---|---|---|---|
| 1 | **Neutral** | `#5B6472` (600) | Text, backgrounds, borders, dividers, disabled states |
| 2 | **Primary** | `#3454D1` (600) | Primary action buttons, active/selected states, links, focus rings |
| 3 | **Teal** (your "Secondary") | `#537977` (500) | Domain-category identification only — marking lab sessions/lab-coordinator content. **Not used for action buttons** — see naming note below |
| 4 | **Success** | `#2F9E5B` (600) | Valid cell state, setup-complete, Approved status |
| 5 | **Warning** | `#D98C2B` (400) | Warning-severity conflicts, Pending HOD Approval state |
| 6 | **Danger** | `#D94A4A` (500) | Blocking-severity conflicts, Publish confirmation, Destructive actions |
| 7 | **Info** | `#3B82C4` (500) | Informational-severity conflicts, neutral system messages |

### Naming note: Teal vs. shadcn's `--secondary`

You named your teal palette "Secondary," which happens to collide with shadcn's own `--secondary` token — the neutral gray "Cancel/Back" button variant already defined in `COMPONENTS.md` §A.1. These are unrelated. In the token files, your teal palette is named `--teal-*` to keep this unambiguous; shadcn's `--secondary` semantic alias stays mapped to neutral gray. Teal is reserved strictly for the domain-identification role confirmed earlier — never for a filled action button.

### Contrast finding worth knowing

When checked against WCAG AA, four of the seven seed values — Success (600), Warning (400), Danger (500), Info (500) — don't clear the 4.5:1 threshold for white text on a solid fill at their given stop (they range 2.7–4.2:1). This doesn't affect your badge/toast/pill components, which use a light-background + dark-text pattern that tests well above AA (5.3–8.2:1) across all four. It only matters for solid fills with white text — the Destructive button and Publish confirmation specifically now reference the 600/700 stop instead of the raw seed for that reason. Full detail in `FOUNDATIONS.md` §10.3–10.4 and `ACCESSIBILITY.md`.

Total color tokens: 77 base (7 palettes × 11 stops) + ~40 semantic aliases.

---

## Typography scale planning

Same principle: you pick the font; this section fixes how many type roles exist. Every text style in Figma should map to one of these roles.

### Seven type roles

| # | Role | Where it appears | Notes |
|---|---|---|---|
| 1 | **H1 — Page title** | Top of each main view (Setup Overview, Timetable, My Timetable) | One per page, sets orientation. |
| 2 | **H2 — Section header** | Panel headers, category sections, dialog titles | Frequent. |
| 3 | **H3 — Subsection header** | Grouped fields, secondary panels within a section | Less frequent. |
| 4 | **Body — Default paragraph** | The default reading size | Prioritize legibility — this is a reading-heavy tool. |
| 5 | **Body Small** | Table cells, secondary text, captions, most timetable cell content | ~85% of Body. Most of the interface actually uses this. |
| 6 | **Label** | Form labels, table column headers, status pill text | Distinguished from Body by weight or letter-spacing. |
| 7 | **Mono (optional)** | Timestamp captions, IDs if shown | Skip entirely if you don't need to visually distinguish structured data. |

### Font decision: confirmed

**DM Sans** (headings, labels, UI — H1/H2/H3/Label roles) + **Inter** (body content — Body/Body Small roles). Type scale: **Major Third (1.25 ratio)**, anchored at 16px Body — H1 32px, H2 24px, H3 20px, Body Small 14px, Label 12px. Weights: DM Sans Medium + Semibold, Inter Regular + Medium (4 font files total). See `FOUNDATIONS.md` §11 for full token structure — everything here is now fully specified, nothing left open.

### One constraint (still applies)

**This is a reading-heavy admin tool, not a marketing site.** Inter carrying the Body/Body Small roles directly serves this — it stays legible at small sizes, which matters since most table cells and timetable content will use it.

---

## Full component inventory implied by these principles

Consolidated across all seven principles. This is the shopping list Figma work should produce over the coming stages. Detailed specs come in `COMPONENTS.md` (generic) and `DOMAIN_COMPONENTS.md` (timetable-specific).

### Generic components (→ `COMPONENTS.md`)

- **Button** (variants: primary, secondary, tertiary, destructive, ghost; sizes: sm, default, lg)
- **Icon Button**
- **Input** (text, number, date/time, textarea)
- **Select / Dropdown** (single, multi, searchable)
- **Checkbox / Radio / Switch**
- **Dialog / Modal**
- **Drawer / Side Panel** (used for the cell-edit drawer per `INTERACTION_DECISIONS.md` §5)
- **Toast / Alert** (info, success, warning, danger)
- **Tooltip**
- **Card**
- **Table** (with sortable columns — addresses audit §17.5)
- **Tab / Tab Group**
- **Breadcrumb**
- **Badge / Pill** (generic — Status Pill sits under Domain)
- **Progress Bar**
- **Skeleton Loader**
- **Empty State**
- **Confirmation Dialog** (reversible + irreversible variants)

### Shell components (→ `COMPONENTS.md`)

- **Admin Shell** (dense sidebar layout, top status bar, desktop-only)
- **HOD Shell** (minimal two-destination layout, top status bar, desktop-primary)
- **Read-Only Shell** (single view, mobile-first, top status/timestamp only)

### Domain-specific components (→ `DOMAIN_COMPONENTS.md`)

- **Status Pill** (Draft, Pending HOD Approval, Approved, Published, No Timetable Yet)
- **Setup Progress Summary** (top-of-Setup completion display)
- **Setup Checklist Row** (empty / partial / complete / blocked-by-dependency)
- **Timestamp Caption** ("Published — as of [date/time]")
- **Timetable Grid — edit variant** (desktop only)
- **Timetable Grid — read-only variant** (responsive, includes mobile-adapted layout)
- **Timetable Cell** (edit + read-only variants)
- **Conflict Badge** (Blocking / Warning / Informational)
- **Inline Validation Message**
- **Cell Edit Drawer** (docked side panel per `INTERACTION_DECISIONS.md` §5)
- **Post-Generation Summary Panel**
- **Bulk Import Stepper** (contained modal per `INTERACTION_DECISIONS.md` §6)
- **View Controls** (day/week toggle, filter, print/export)

### Component count summary

- **Generic:** ~18
- **Shells:** 3
- **Domain-specific:** 13
- **Total:** **approximately 34 distinct components, each with variants and states**

That's the total Figma build scope for the design system. Some will be simple (Button, Badge), some will be substantial (Timetable Grid, Cell Edit Drawer). Ordering the build queue for you when Figma work starts is a Design Review stage decision.

---

## What this document does not decide

- Specific color hex values, font family, exact type sizes — you are deciding those.
- Spacing units, border radii, shadow definitions, motion timing — `FOUNDATIONS.md`.
- Exact visual design and states of individual components — `COMPONENTS.md` and `DOMAIN_COMPONENTS.md`.
- Per-component accessibility annotations — `ACCESSIBILITY.md`.
- Copy templates and messaging tone — `PATTERNS.md`.
