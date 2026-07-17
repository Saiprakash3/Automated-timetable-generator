# Interaction Decisions

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-DS-001
Evidence status: Mixed — audit findings and confirmed decisions are Category A/direct; the interaction patterns proposed to address them are Category B (AI-assisted recommendations, not yet validated with real users). Each decision below is labeled.

---

## Purpose of this document

The workflow calls for a distinct Interaction Design stage between User Flows and Design System Planning. By agreement with Prakash, that stage is folded into Design System Planning rather than run separately, since the two are tightly coupled here — the design system can't be built without first resolving how these interactions behave. This document is where that folded-in work lives.

It resolves:
1. A conflict taxonomy and severity model (expanded scope — see `DECISION_LOG.md` entry dated 2026-07-13)
2. Three decisions `INFORMATION_ARCHITECTURE.md` explicitly deferred: Setup shape, persistent status indicator placement, and HOD shell architecture
3. Two supporting interaction patterns implied but not fully specified in `USER_FLOWS.md`: the edit panel's interaction model, and the bulk import flow's shape

Everything here is upstream input to `FOUNDATIONS.md`, `COMPONENTS.md`, `DOMAIN_COMPONENTS.md`, and `PATTERNS.md`. Nothing here specifies visual design (color, type, spacing) — that's the next documents' job.

---

## 1. Conflict Taxonomy and Severity Model

### 1.1 Why this changed

`PROBLEM_STATEMENTS.md` PS-02 and `USER_FLOWS.md` F-03 were both scoped correctly at the level of "manual edits need conflict feedback," but F-03 only named four example constraint functions (`isFacultyFree`, `isRoomFree`, `hasConsecutiveSlots`, `underLoadLimit`) and modeled conflicts as a single binary: valid (green tick) or invalid (red warning, accept-or-adjust). The UX Audit (`Existing_website_UX_Audit.md`, §11.3) is explicit that the existing system's conflict handling lacks type, affected-resource, cause, and severity detail — and several audit-confirmed pain points (lab maintenance windows, lab capacity/suitability, batch-level scheduling) fall outside the four named checks entirely.

Per the 2026-07-13 decision, the conflict model is now designed to be extensible for the full taxonomy below, even though only a subset of these checks may be implemented in the first backend pass.

*Evidence: audit findings are Category A (Prakash's direct audit). The taxonomy structure and severity tiering below are Category B — a reasonable design response, not a validated one.*

### 1.2 Full conflict taxonomy

| # | Conflict type | Source | Severity |
|---|---|---|---|
| 1 | Faculty double-booking (already teaching/coordinating elsewhere, same slot) | F-03, audit §11.1 | **Blocking** |
| 2 | Faculty marked unavailable for that slot | audit §3.1 (outdated availability) | **Blocking** |
| 3 | Faculty overload (exceeds max weekly/daily teaching load) — **does not apply to the HOD**, who is governed by #17 instead (§9.3) | F-03, audit §4.2 | **Warning** |
| 4 | Room double-booking | F-03, audit §11.1 | **Blocking** |
| 5 | Lab double-booking | F-03, audit §11.1 | **Blocking** |
| 6 | Lab under maintenance / marked unavailable | audit §3.4 | **Blocking** |
| 7 | Lab capacity exceeded by section/batch size | audit §3.4 | **Warning** |
| 8 | Lab unsuitable for subject (equipment/type mismatch) | audit §3.4 | **Warning** |
| 9 | Batch double-booking within a lab session | audit §3.4 | **Blocking** |
| 10 | Consecutive-period requirement not met (labs) — a lab is always 2 consecutive periods **and must stay inside one block**: pre-lunch (P1–P3) or post-lunch (P4–P6). Valid: 9:00–11:00, 10:00–12:00, 1:00–3:00, 2:00–4:00. Invalid: any span crossing the 12:00–1:00 lunch. Slot model: `DOMAIN_COMPONENTS.md` §5.1 | F-03, audit §3.4, Prakash 2026-07-16 | **Blocking** |
| 11 | Section double-booked (e.g., elective basket slot collides with a regular class for a contributing section) | F-06 (implied) | **Blocking** |
| 12 | Elective basket time-slot collision (same year, two baskets) | F-06 | **Blocking** |
| 13 | Elective content/subject overlap across baskets (business-rule, not physical) | audit §3.8 | **Informational** |
| 14 | Lab-pair conflict — second person (Coordinator/Faculty-as-coordinator) double-booked | F-07 | **Blocking** |
| 15 | No available second person for a lab in that slot | F-07 | **Informational** (surfaces a setup gap, not an edit error) |
| 16 | **HOD assigned to a lab session** — the HOD teaches lectures and electives only (§9.2) | §9, Prakash 2026-07-17 | **Blocking** |
| 17 | **HOD lecture count outside range** — **3–4 per day**, 15–20 per week; catches under-load *and* over-load; electives count toward the total (§9.2/§9.3) | §9, Prakash 2026-07-17 | **Warning** |

Items 2, 7, 8, 9, 13, and 15 are new relative to `USER_FLOWS.md` and are flagged for the backend developer as extensions to the constraint-check layer, not yet detailed at the data-model level here. **Items 16 and 17 are also new** — see §9.3 for why one is Blocking and the other Warning, and note that #17 is the first check in this taxonomy with a **floor** as well as a ceiling.

### 1.3 Severity model (replaces F-03's binary)

Three tiers, each with a distinct interaction behavior:

- **Blocking (Critical):** A physically impossible state — the same person, room, lab, or batch committed twice in one slot, or a hard unavailability (maintenance, marked-unavailable). **Cannot be saved as-is.** The edit panel keeps the field open and requires a valid alternative before the cell can close. No "accept and continue" option — this is a hard stop, not a warning.
- **Warning (Soft):** A policy or resource-fit issue where a human might reasonably override it (overload, capacity slightly exceeded, technically-usable-but-unsuited lab). This preserves F-03's original "accept or adjust" pattern: Admin can accept and the cell saves, marked as conflicted for later review.
- **Informational:** Doesn't block or require a decision — it's a flag worth Admin's attention (content-overlap between electives, a lab-pairing gap that reflects a setup shortfall rather than an edit mistake). Shown, not gated. No accept/reject action attached.

This tiering is the single biggest addition Design System Planning makes to the interaction model established in User Flows. It will be visualized concretely (colors, iconography, message layout) in `DOMAIN_COMPONENTS.md`.

### 1.4 What this does not resolve here

Exact visual treatment (color per severity, icon set), exact message copy templates, and the constraint-check function names/signatures for the new checks are deferred to `DOMAIN_COMPONENTS.md` and the backend developer's scope, respectively. This section only fixes the taxonomy and severity logic so downstream work has firm ground.

---

## 2. Setup Shape: Checklist vs. Wizard vs. Free Navigation

### 2.1 The deferred question

`INFORMATION_ARCHITECTURE.md` left open whether Setup's nine categories should appear as a checklist, a wizard, or free navigation with progress shown.

### 2.2 Recommendation: Guided Checklist (not a wizard)

**Decision:** A checklist-with-soft-ordering — every category is visible and reachable at all times, each shows a completion state (empty/partial/complete) and a dependency note when blocked, but Admin is never forced through a fixed step sequence.

**Why not a wizard:** Audit §7.2 and §5.6 both describe the *lack of visible order* as the problem — not the ability to jump around. A wizard would over-correct: it removes flexibility the audit never flagged as a problem, and F-01 already describes Admin freely choosing which category to tackle next ("Order is Admin's choice, but dependencies are enforced softly"). Locking that down now would contradict a flow already documented and reviewed.

**Why not pure free navigation without structure:** Audit §7.4 and §14.1 are explicit that progress visibility is currently absent entirely ("no indicator of how much setup is done") — so a completion summary has to be persistent and prominent, not just available if Admin thinks to check.

*Evidence: Category B — matches F-01's already-documented behavior and directly answers audit §7.2/§7.4/§14.1, but the specific checklist-vs-wizard choice hasn't been shown to a real Admin.*

### 2.3 What this means going forward

- Setup Overview is a persistent, always-reachable screen (not a one-time onboarding modal that disappears after first use) — because Admin usage is described as spiking each term (audit §3.1), the same Admin needs this view again next term, not just once.
- Each category row shows: name, state icon (empty/partial/complete), and, if blocked, an inline one-line reason.
- The "N of 9 complete" summary is fixed at the top of Setup, not buried in a sidebar badge — this is the concrete answer to audit §14.1 ("no indication of how much configuration is done").

---

## 3. Persistent Status Indicator: Placement and Behavior

### 3.1 The deferred question

`INFORMATION_ARCHITECTURE.md` established that a status indicator (Draft / Pending HOD Approval / Approved / Published) must exist wherever a timetable is viewed, but left exact placement to this stage.

### 3.2 Recommendation: Fixed in the shell header, not the page body

**Decision:** The status indicator lives in the persistent shell chrome — a fixed position at the top of the Timetable area and My Timetable view, outside the scrollable content region — rather than as a banner inside the page content.

**Why:** Audit §14.2 and §18.5 both describe timetable status as something Admin currently has to "dig into individual modules" to find, and Faculty/Students risk "looking at an outdated timetable without realizing it" (audit §3.6). A status element embedded in scrollable page content gets scrolled out of view during exactly the moment it matters most — when someone is deep in a long grid. Fixing it in the shell header keeps it visible regardless of scroll position, matching the "comparable pattern" your own `INSIGHTS.md` (item 1) already identified: persistent status badges in document-approval and CMS tools.

**Behavior:**
- Admin/HOD view: status pill (Draft / Pending HOD Approval / Approved / Published) plus, once published, a "Published on [date/time]" caption directly beside it.
- Faculty/Student/Lab Coordinator view (F-08): same pill, simplified to "Published — as of [date/time]" only, since those roles never see Draft/Pending/Approved states.
- The pill is clickable where it leads somewhere (e.g., Admin clicking "Pending HOD Approval" could jump to a read-only preview of what was sent) — deferred as a nice-to-have, not required for v1.

*Evidence: Category B. Placement logic follows directly from audit-confirmed pain points; the specific "fixed in shell chrome" mechanism is a design judgment, not user-tested.*

---

## 4. HOD Shell Architecture

### 4.1 The deferred question

`INFORMATION_ARCHITECTURE.md` left open whether HOD's Approvals shell reuses Admin's shell chrome or is a visually distinct environment.

### 4.2 Recommendation: Distinct, minimal shell — shares tokens, not layout

**Decision:** HOD gets its own shell: no persistent multi-item sidebar like Admin's. Two entry points only — Approvals (shown only when non-empty, per the IA) and My Timetable — presented as large, simple destinations rather than nav items in a dense sidebar.

**Why:** Audit §3.3 states plainly that HOD "doesn't live in the full admin interface — needs a clean review-and-approve experience, not a configuration screen," and separately flags "too much data to review at once, no department filter" as a pain point. Reusing Admin's dense, nine-category sidebar chrome for a role that only ever does two things would reintroduce that exact complaint. The IA itself already describes HOD's shell as narrower in scope than Admin's — this decision just makes that concrete: not a scaled-down copy of Admin's shell, but a genuinely separate, minimal one.

**What's shared:** Design tokens (color, type, spacing, component styles) are identical across shells — this is still one design system, one product. What differs is layout density and navigation structure, not visual language.

*Evidence: Category B, directly grounded in audit §3.3's explicit statement of HOD's needs.*

---

## 5. Edit Panel Interaction Model

### 5.1 Context

F-03 describes a "side panel" opening when Admin clicks a cell, without specifying whether that's a docked side panel, a modal overlay, or an inline expansion.

### 5.2 Recommendation: Docked side panel (drawer), not a modal

**Decision:** The edit panel is a drawer docked to one side of the screen — the timetable grid remains visible and interactive-adjacent behind it, not obscured.

**Why:** F-03's own step 5 depends on this — "the post-generation summary panel updates to reflect any new conflicts" while Admin is still editing, and step 6 has Admin "repeat for other cells as needed" without describing a close-and-reopen cycle. A modal that covers the grid would force exactly that close-reopen friction audit §15.6 already flags ("some workflows involve more clicking and navigating than they need to"). A docked drawer keeps grid context visible, which also directly supports the Blocking-severity behavior in §1.3 above — Admin needs to see where else in the grid the conflict originates without losing their current edit.

*Evidence: Category B, inferred from F-03's described behavior rather than an explicit UI directive in that document.*

---

## 6. Bulk Import Flow Shape

### 6.1 Context

F-01 describes bulk import's steps (download template → upload → validate → preview → fix/accept) but not its container — full-screen flow, modal stepper, or inline expansion within the category screen.

### 6.2 Recommendation: Contained modal stepper

**Decision:** Bulk import runs as a bounded, multi-step modal overlay (template download → upload → validation preview → confirm), separate from the persistent category screen underneath it, closing back to an updated Setup Overview on completion.

**Why:** Unlike editing (which is exploratory and long-running), bulk import is a linear, one-directional task with a clear start and end — audit §7.8 notes bulk entry "hasn't gotten much attention" but doesn't suggest it needs to coexist with other work happening at the same time. A contained stepper matches the linear steps F-01 already documents and avoids the ambiguity of an inline expansion competing for space with the category screen's own content.

*Evidence: Category B.*

---

## Summary: what's now settled vs. what still isn't

**Settled by this document:**
- Full conflict taxonomy (15 types) and a 3-tier severity model (Blocking / Warning / Informational)
- Setup shape: guided checklist, soft ordering, persistent Overview
- Status indicator: fixed in shell chrome, not page content
- HOD shell: distinct minimal shell, shared tokens
- Edit panel: docked drawer, not modal
- Bulk import: contained modal stepper

**Still open, carried forward to later Design System documents:**
- Exact colors/icons per severity tier → `DOMAIN_COMPONENTS.md`
- Conflict message copy templates → `PATTERNS.md`
- Backend constraint-check functions for the 6 newly-added conflict types → flagged for backend developer, outside this stage's scope
- Elective low-enrollment policy and lightweight version history → still open per `OPEN_QUESTIONS.md`, untouched by this document

## What this document does not decide

Visual tokens (color values, type scale, spacing units), the generic component inventory (buttons, inputs, dialogs), and copywriting for specific messages are not addressed here — those are `FOUNDATIONS.md`, `COMPONENTS.md`, and `PATTERNS.md` respectively.

---

## 7. Draft Lifecycle Decisions

### 7.1 Context

During the Claude Design Review stage (2026-07-16), several decisions were made about how timetable drafts are created, limited, deleted, and counted. These are recorded here because they affect generation gating, UI state management, and backend field requirements — all upstream of Frontend Documentation.

### 7.2 Generation is gated, not always available

**Decision:** Admin can only generate a new timetable:
1. When no timetable exists yet and Setup is complete (first generation), or
2. After HOD has requested changes and status has returned to Draft

**Generation is explicitly blocked** while status is Pending HOD Approval or Approved. This prevents Admin from creating a new draft while the HOD is actively reviewing an existing one — the content HOD is reviewing must remain stable until they respond.

**UX surface:** A Toast fires if Admin attempts generation in a blocked state: *"Can't generate a new timetable — waiting for HOD's response."* The Generate action is also visually disabled in the Pending HOD Approval and Approved states. See `PATTERNS.md` §8.1.

*Evidence: Category A — confirmed by Prakash (2026-07-16).*

### 7.3 Draft limit: 2 drafts, soft warning on 3rd

**Decision:** Admin can hold up to 2 drafts at a time within a timetable cycle:
- **Draft 1:** the original generated timetable
- **Draft 2:** the post-HOD-changes revision (kept alongside Draft 1 so Admin can compare/reference the original while working)

A 3rd draft is technically allowed (not hard-blocked) but treated as a rare edge case — it would only occur if HOD requests changes twice in the same cycle. When a 3rd draft is generated, a **persistent warning banner** appears on the Draft screen: *"This is your final draft. Review all changes carefully before resubmitting — HOD has already reviewed two versions."*

**Why soft, not hard:** Hard-blocking Admin from a 3rd draft in a genuine edge case creates a worse outcome than a well-surfaced warning. The warning surfaces the rarity of the situation without removing Admin's ability to act.

See `PATTERNS.md` §8.2.

*Evidence: Category A — confirmed by Prakash (2026-07-16).*

### 7.4 Draft deletion: available at finalization and post-publish

**Decision:** Admin can delete drafts at two points in the lifecycle:
1. **At publish time:** the Publish confirmation flow offers Admin the option to delete existing drafts as part of finalizing ("clean up drafts before making this live")
2. **After publishing:** Admin can return to the Timetable area post-publish and delete any remaining drafts as a cleanup action

**Deletion is explicitly NOT available** while status is Pending HOD Approval or Approved — drafts are preserved as an audit trail during the active review cycle and cannot be removed mid-review.

**Reversal of earlier decision:** An earlier review note (Claude Design Review V1, 2026-07-16) recorded that "delete only becomes available post-publish." This was corrected in the same session to allow deletion at publish time as well. The current documented decision (at publish time OR post-publish) supersedes that note.

See `PATTERNS.md` §8.3.

*Evidence: Category A — confirmed by Prakash (2026-07-16).*

### 7.5 Draft count resets on deletion

**Decision:** When Admin deletes all drafts (at publish time or post-publish), the draft count resets to 0. If a new timetable cycle begins after deletion, Admin starts fresh with no draft history and no warning banner.

**Practical implication:** The count tracks how many drafts exist in the current active cycle, not a lifetime total. The backend draft count field should be reset — not decremented — when all drafts for a cycle are removed.

*Evidence: Category A — confirmed by Prakash (2026-07-16).*

### 7.6 Faculty stays read-only; no in-system feedback mechanism

**Decision:** Faculty have no mechanism to request changes through the system. If Faculty identify issues with a timetable, they communicate them to the HOD directly outside the system (in person, email, etc.). The HOD then uses the existing "Request changes" flow if they agree a revision is needed.

**No new screens, flows, or components are required** to support faculty feedback. Faculty role remains read-only throughout.

*Evidence: Category A — confirmed by Prakash (2026-07-16).*

---

## 8. College-Wide Time Slot Structure

### 8.1 Decision

**Confirmed (2026-07-16, Prakash):** The daily schedule is a fixed college-wide constant — not configurable by Admin through the Time Slot Grid setup screen. The structure is:

| Slot | Time | Type |
|---|---|---|
| Period 1 | 9:00 – 10:00 | Class |
| Period 2 | 10:00 – 11:00 | Class |
| Period 3 | 11:00 – 12:00 | Class |
| — | 12:00 – 1:00 | Lunch break (no classes scheduled) |
| Period 4 | 1:00 – 2:00 | Class |
| Period 5 | 2:00 – 3:00 | Class |
| Period 6 | 3:00 – 4:00 | Class |

6 periods per day, Monday–Friday. This aligns with the confirmed faculty constraint of max 6 periods/day.

### 8.2 Lab scheduling constraint

Labs span exactly 2 consecutive periods and must stay entirely within one half of the day — they cannot cross the lunch break. Valid lab slots:

- **Pre-lunch:** 9:00–11:00 (Periods 1–2), 10:00–12:00 (Periods 2–3)
- **Post-lunch:** 1:00–3:00 (Periods 4–5), 2:00–4:00 (Periods 5–6)
- **Invalid:** any 2-period span crossing 11:00–1:00 (e.g. 11:00–1:00 straddles lunch)

This constraint is enforced at the algorithm level and as conflict type #10 in the taxonomy (§1.2). The lunch-break crossing check is a sub-case of the consecutive-period requirement.

### 8.3 Impact on the Timetable Grid

The grid's time-axis labels should reflect the actual period start times: **9:00, 10:00, 11:00, 1:00, 2:00, 3:00** — with a visually distinct lunch break column between 12:00 and 1:00. The Figma grid previously showed 12:00 as a period slot and jumped to 2:00, which skipped the 1:00 period and misrepresented the schedule.

> ✅ **Done in Figma (2026-07-17).** Both `Timetable Grid — Read-Only` and `— Edit` now run `9:00 · 10:00 · 11:00 · [Lunch] · 1:00 · 2:00 · 3:00`, with a non-interactive 48px `--muted` Lunch column that can never hold a session. The Setup › Time Slot Grid screen was rebuilt to the table above (its 50-minute periods and a stray 10:50 break were removed, and Periods 5–6 — previously missing despite the "6 teaching periods/day" subtitle — were added). Relabelling also **fixed an illegal lab**: Friday's DBMS Lab had been sitting at 12:00+2:00, straddling lunch — exactly the §8.2 violation.

### 8.4 Impact on the Time Slot Grid setup screen

Since the time structure is fixed and not configurable, the Time Slot Grid setup screen's purpose needs clarification. Two options:
- **Remove it from Setup** — if Admin has nothing to configure there, it adds noise to the checklist
- **Keep as read-only reference** — Admin can see the fixed structure but cannot edit it

This is an open question to resolve before Frontend Documentation. Logged in `OPEN_QUESTIONS.md`.

---

## 9. HOD Teaching Load

### 9.1 Context

The HOD is both the approver of a timetable and a teacher inside it. Their load is deliberately lighter than a regular faculty member's, and narrower in what kinds of session they can take — the approval role has to leave room, and the HOD must not end up reviewing a timetable they are heavily entangled in.

### 9.2 Decision

**Confirmed (2026-07-17, Prakash):**

| Rule | Value |
|---|---|
| **Lectures per day** | **Minimum 3, maximum 4 — every teaching day** |
| **Teaching days** | **All 5** (Mon–Fri) |
| **Labs** | **Never** — a HOD is not assigned to lab sessions |
| **Electives** | **Allowed** — and **exactly 2 of the 5 days carry one elective session each** |
| **Elective counting** | An elective **counts inside** that day's 3–4. A 4-lecture day with an elective is 3 regular lectures + 1 elective — **not** 4 + 1. |
| **Distribution** | Must vary day to day. **Do not** schedule 4 lectures on three days and 3 on the other two. |

**The bound is per day, not per week** — so the weekly total lands between **15 and 20**, with the reference schedule at **17 (3/4/3/4/3)**.

> ✅ **Per-day is intended and confirmed** (Prakash, 2026-07-17 — re-confirmed after being explicitly queried). The HOD is a **teaching-heavy** role, not a light one: 15–20 lectures/week is at or above the regular-faculty overload threshold in audit §4.2 (~18 hrs), and that is deliberate. Recorded here because it inverts the intuitive assumption — anyone reading "the HOD approves timetables" will expect a *reduced* teaching load, and the generator/backend must not optimise toward one.

This replaces the regular faculty load limits for the HOD specifically. The max-6-periods/day constraint in §8.1 still applies and now genuinely binds: a 4-lecture day fills 4 of 6 periods, leaving only 2 free.

> 🔴 **Consequence — conflict #3 must exclude the HOD.** Because the HOD legitimately runs at 15–20 lectures/week, the regular **faculty overload** check (#3, Warning above the faculty limit) would fire on every compliant HOD schedule — while **#17 simultaneously reports the same schedule as in range**. Two checks would contradict each other on the same person. **#17 supersedes #3 for the HOD; #3 must skip them entirely.** This is a silent-failure risk: nothing breaks, Admin just sees a permanent, meaningless overload warning on the HOD and learns to ignore warnings.

### 9.3 Constraint-check impact

Two new conflict types, added to the taxonomy in §1.2:

- **#16 — HOD assigned to a lab session → Blocking.** Categorical, not a matter of degree, so there is nothing for a human to weigh: it is refused outright, exactly like a double-booking.
- **#17 — HOD lecture count outside range → Warning.** Deliberately *not* Blocking, for consistency with **#3 (faculty overload)**: a load-range breach is a policy judgement Admin may knowingly accept, not a physically impossible state (§1.3). The asymmetry between #16 and #17 is intentional — one is a rule about *kind*, the other about *quantity*.

**#17 checks two bounds:**

| Scope | Bound | Notes |
|---|---|---|
| **Per day** | 3–4 lectures | The primary check. Fires on any single day outside the range. |
| **Per week** | **15–20** | Derived from 5 × (3–4). Catches a schedule that passes every day individually but is lopsided overall. |

The weekly figure is **derived, not independently specified** — if a tighter weekly ceiling is wanted (e.g. exactly 17), it must be stated, because 15–20 follows automatically from the per-day rule and adds nothing on its own.

Three things the backend must not get wrong:
1. **#17 catches under-load as well as over-load** — a 2-lecture day flags exactly like a 5-lecture day. This is the first check in the taxonomy with a **floor** as well as a ceiling, so it cannot reuse the `underLoadLimit` shape.
2. **Electives count toward the per-day total.** The check counts *sessions taught*, not *regular lectures* — otherwise a day with 4 lectures + an elective would pass at 4 while actually running 5.
3. **#3 (faculty overload) must skip the HOD.** #17 replaces it. Run both and every compliant HOD schedule throws a permanent overload Warning while #17 calls the same schedule fine — see the note in §9.2.

### 9.4 Impact on the generator

The algorithm must:
- exclude the HOD from the lab-assignment pass **entirely** (not merely deprioritise them);
- apply the 3–4 **per-day** bound instead of the regular faculty load limits;
- place **exactly 2 elective sessions** across the week, on 2 different days, counting each inside its day's total;
- **vary the per-day counts** rather than emitting a 4/4/4/3/3 block.

### 9.5 Who the HOD is

**Confirmed (2026-07-17, Prakash): the HOD is Dr. Iyer** — an existing faculty member in the published III-CSE-A grid.

The HOD used to be **"Dr. A. Varma"**, a name invented to fit the HOD Shell avatar's pre-existing "AV" initials. Varma appeared in no faculty list and no grid, which made every session on their My Timetable unfalsifiable: nothing in the file could contradict it, and nothing could confirm it either.

**Why Dr. Iyer.** Of the five faculty in the grid, Dr. Iyer is the only one who already satisfies §9.2 without touching any published data:

| Faculty | Labs? | Elective? | Eligible |
|---|---|---|---|
| Dr. Sharma | DS Lab (Wed) | — | ✗ §9.2 forbids labs |
| Dr. Gupta | DBMS Lab (Fri) | ML, Tue 1:00 | ✗ labs |
| Dr. Nair | Networks Lab (Mon) | — | ✗ labs |
| Dr. Rao | none | — | ✗ no elective |
| **Dr. Iyer** | **none** | **Prof. Elective, Thu 2:00** | ✅ |

That the fit is exact is not luck — it is evidence that §9.2 and the sample grid were written from the same intuition about what a HOD teaches.

**Five sessions are now pinned.** The published grid is authoritative, so wherever it shows Dr. Iyer, HOD My Timetable must agree:

| Slot | Session |
|---|---|
| Mon 10:00 | Operating Sys. · III-CSE-A · Room 305 |
| Tue 9:00 | Operating Sys. · III-CSE-A · Room 305 |
| Wed 3:00 | Operating Sys. · III-CSE-A · Room 305 |
| Thu 2:00 | Prof. Elective · III-CSE-A · Room 210 |
| Fri 11:00 | Operating Sys. · III-CSE-A · Room 305 |

The other 12 of the 17 are IV-CSE-A / IV-CSE-B sessions and **remain invented — which is now correct rather than a gap.** A 3–4 *per-day* load cannot be sourced from one section's grid; III-CSE-A can only ever account for a slice of a departmental load. What changed is that the invented part is now **constrained**: every one of those 12 sits in a slot where the grid leaves Dr. Iyer free, so none can contradict published data.

🔴 **One clash surfaced by the change.** The HOD's second elective was *ML (Elective)* at Tue 1:00 — the exact subject and slot the grid gives to **Dr. Gupta**. Two teachers cannot own one class. It became **NLP (Elective) · Basket A · Room 212** (Room 210 is Dr. Gupta's ML at that hour). This is the whole value of naming a real person: the clash was invisible while the HOD floated free of the data.

✅ **CORRECTION (2026-07-17) — "R." was never invented, and the claim above was my error.** This section originally read *"Still invented — the initial 'R.' No document gives any faculty a first name."* **That was wrong.** `Admin — Setup Faculty` has always carried a full faculty table: **Dr. A. Sharma · Prof. R. Iyer · Dr. M. Nair · Dr. S. Gupta · Prof. K. Rao**. I missed it because I truncated my own search at 60 results and the table fell past the cutoff — then reported the absence of evidence as evidence of absence. The initial matching by luck does not make the method sound.

✅ **The real finding was the honorific — swept 2026-07-17.** The faculty record says **Prof.** R. Iyer, not Dr. The file used to disagree with itself systemically, and this predated the HOD decision:

| Name | Setup Faculty (the record) | Was, elsewhere | Now |
|---|---|---|---|
| Iyer | **Prof. R. Iyer** | `Dr. R. Iyer` ×4 · `Dr. Iyer` ×95 | `Prof. R. Iyer` ×12 · `Prof. Iyer` ×104 |
| Rao | **Prof. K. Rao** | `Dr. K. Rao` ×4 · `Dr. Rao` ×57 | `Prof. K. Rao` ×9 · `Prof. Rao` ×63 |

**195 nodes corrected across the Prototype and Domain Components pages** (the grid components themselves carried the error, so instances alone would not have been enough). Sharma / Gupta / Nair are correctly `Dr.` per the record and were left alone. Three things were deliberately protected by word-boundary anchoring: **`Prof. Elective`** (a *subject* — Professional Elective — not a person, ×20 intact) and the Lab Coordinators **`Mr. K. Rao` / `Ms. A. Iyer` / `Mr. R. Nair`**.

> **The docs were already right about Iyer.** `PATTERNS.md` §2.2 reads *"Try: **Prof. Iyer** is available"* — so the written spec had the honorific correct all along and only the Figma file drifted. That is corroboration the sweep went the right way, not a coincidence.

⚠️ **Still inconsistent — `PATTERNS.md` calls Sharma "Prof."** (*"Remove Prof. Sharma?"* §1.1, *"Prof. Sharma is already teaching…"* §2.2, and `ACCESSIBILITY.md` §282, `DOMAIN_COMPONENTS.md` §396). The record says **Dr. A. Sharma**. Left alone because those are *copy templates* demonstrating a pattern, not assertions about the sample data — but if anyone treats them as data, they will contradict the file.

⚠️ **`Mr. K. Rao` vs `Prof. K. Rao`.** Defensible: `PROJECT_BRIEF.md` makes coordinators *"a separate pool of people from teaching Faculty"*, so they are two people. But sharing an initial *and* surname guarantees a reader assumes they are one — worth renaming one of them.

✅ **Built 2026-07-17** — HOD Shell avatar `81:195` **AV → RI** (main component; propagated to all 8 HOD screens). Attribution updated on `HOD — Approval Detail` and `Admin — Timetable Draft (changes requested)`. `HOD — My Timetable` `333:9556` rebuilt and re-audited: **3/4/3/4/3 = 17**, zero labs, exactly 2 elective days (Tue, Thu), all 5 pinned slots present.

---

## 10. Read-Only Desktop Views and Download

### 10.1 Context

F-08 was written around a mobile-first read-only experience — Principle 7 makes the Read-Only shell 375px primary, and the built screens are mobile day-lists. But Faculty, Lab Coordinators and Students routinely open their timetable on a laptop, and F-08 step 4 previously dismissed print/export as *"basic functions; not the focus of the redesign"*. Neither position survives contact with the actual use: a personal timetable is something people **pin up, print, and check on a bigger screen**.

### 10.2 Decision

**Confirmed (2026-07-17, Prakash):** All three read-only roles get a **desktop view of their own timetable, with download** — built to the same pattern as the HOD's My Timetable.

| Role | Desktop view shows | Filtered? |
|---|---|---|
| **Faculty** | Own classes and labs, week grid | Yes — their sessions only |
| **Lab Coordinator** | Labs they coordinate, week grid | Yes — their labs only |
| **Student** | Their section's full week grid | **No** — a student attends everything, so their personal view *is* the section timetable |
| *(HOD)* | Own teaching, week grid | Yes — §9 |

**Presentation:** Read-Only shell at **1280**, greeting + `Published — as of [date/time]`, then **View Controls (Full)** — Day/Week toggle, filter, **Export**, **Print** — above the read-only week grid.

**Mobile is not replaced.** The 375px day-list stays the primary experience (Principle 7); desktop is the wider expression of the same published data. The two must agree.

**Download is not an edit affordance.** Export/Print produce a copy; they change nothing. Principle 5's "no edit affordances in the Read-Only shell" is intact.

### 10.3 Why Student is unfiltered

The other roles are *assigned to* sessions, so their view is a filter over the timetable. A student is a member of a **section**, and the section's timetable is by definition their timetable. Filtering it would remove nothing. This is the only role where "my timetable" and "the timetable" are the same artifact — worth stating because it looks like a missing filter otherwise.

### 10.4 Impact

- **F-08 step 4** is upgraded: export/print are a stated capability, not an aside.
- **Backend:** the role-filtered endpoints in F-08 already return exactly what these views need — no new endpoints. Export/print operate on the client's already-fetched data.
- **Line 2 of a personal grid cell carries `section · room`, not the faculty name** — on a personal view the faculty is always the viewer. (Lab Coordinator differs: it names the teaching faculty, `Lab 204 · Dr. Nair`, since the coordinator is the second person, not the teacher.)

*Evidence: Category A — confirmed by Prakash (2026-07-17).*

---

## 11. Removing the Email Hand-Off

### 11.1 Context

Send for Approval was designed as a **hybrid** flow: Admin confirmed the HOD's address, the system composed a message and opened Admin's own mail client, Admin sent it externally, then returned to the app and marked the action complete — and *that* return trip was what moved Draft → Pending HOD Approval.

This was not a loose end. It was recorded as settled in three separate places: `USER_FLOWS.md` F-02 step 7 (*"This is the **confirmed** external email trigger"*), `RESEARCH_SYNTHESIS.md` (*"a hybrid flow, not a fully in-app one"*, filed under **Confirmed**), and `INFORMATION_ARCHITECTURE.md`, which used the email as the **reason** the IA needs no notification centre.

### 11.2 Decision

**Confirmed (2026-07-17, Prakash): the email hand-off is removed. There is no email anywhere in the system.**

| | Before | After |
|---|---|---|
| Admin confirms | To: field + note + **[Prepare email]** | Note + **[Send for approval]** |
| What the click does | Opens Admin's mail client with a pre-composed message | Sets **Pending HOD Approval** and locks the timetable |
| Status trigger | Admin returns and "marks it complete" | **The confirm itself** |
| HOD is notified by | Admin's email, with a link into the app | The Approvals item appearing in their nav |
| Backend | An endpoint to compose the mail / serve mailto content | One atomic submit-for-approval call |

### 11.3 This closed a defect

The old model made the status transition depend on Admin *"marking the in-app action complete"* — **an affordance that was never designed or built.** Draft → Pending therefore had **no trigger at all**: the flow described a button that did not exist, and the gap survived precisely because it was split across an app boundary, where each side could assume the other handled it. Collapsing the flow into one confirm removes the seam and the defect with it.

### 11.4 The notification centre stays out — but for a different reason

`INFORMATION_ARCHITECTURE.md` excluded a notification centre **because** approval was triggered by an external email. That justification is now void, and the obvious inference — *no email, so the HOD needs an inbox* — is **wrong**.

The HOD never needed one. F-04 step 1 has always said the **Approvals area appears in HOD's navigation when something is pending**, and hides itself when the queue is empty (step 7). That nav item *is* the notification: it is scoped to the one thing a HOD is asked to do, and the model is one active timetable at a time, so the queue is never longer than one. An inbox would be a more general mechanism than the problem requires. Conclusion unchanged, reasoning replaced.

### 11.5 What this does not change

- **The note to HOD survives.** It is still optional, still on the dialog, and now reaches the HOD in-app on Approval Detail (F-04 step 3 already showed it there). Backend persists it on the timetable record.
- **The lock still applies at submission**, not at approval — see §7 / F-02.
- **Rejection is unaffected** (§6.2). It was always fully in-app.

### 11.6 A research finding is *not* overturned by this

`RESEARCH_SYNTHESIS.md` lists the out-of-app email under **"Confirmed (Prakash's direct audit + answers)"**. That entry has been annotated, **not deleted**, and deliberately so: it records something about how approvals happen *in the real department today*, and a design decision cannot make a past observation untrue. What §11 changes is that **the product no longer models that step** — the hybrid flow becomes fully in-app. If people still email each other about timetables, that now happens entirely outside the product's awareness, which is a choice, not an oversight.

*Evidence: Category A — confirmed by Prakash (2026-07-17).*

*Evidence: Category A — confirmed by Prakash (2026-07-17).*

*Evidence: Category A — confirmed by Prakash (2026-07-16).*
