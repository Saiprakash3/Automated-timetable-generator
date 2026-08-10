# User Flows

Status: Draft
Version: v0.2
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-IA-001
Evidence status: Partial — grounded in `INFORMATION_ARCHITECTURE.md`, confirmed decisions in `DECISION_LOG.md`, and problem statements PS-01/02/03.

---

## Purpose of this document

Describe the step-by-step paths people take through the redesigned system, in plain language. This is the written-out companion to the flow diagrams in `FLOW_DIAGRAMS.md`. Each flow covers:

- **Who** the user is (role)
- **What** they're trying to do (goal)
- **Where** they start (entry point)
- **What has to be true first** (preconditions)
- **What they do, step by step**, including decisions they make and errors they might hit
- **How the system responds** at each step
- **What happens if something goes wrong** and how they recover
- **What "done" looks like** (completion state)
- **What the backend needs** to make this work — noted for the backend developer joining later

Only flows that are new or changed compared to the existing UI are covered. Flows that clearly haven't changed (basic login, viewing a single form) are not re-documented for their own sake.

## Scheduling constraints referenced across all flows

These are college-wide constants (uniform for every faculty/coordinator, not per-person). They're logged in `DECISION_LOG.md` and drive the constraint checks in F-03 and F-07:

- **Working week:** Monday–Friday (5 teaching days).
- **Faculty**: max 6 periods/day, max 25 periods/week, minimum 4 periods on any day they do teach (days off are allowed and expected), max 2 lab days/week.
- **Lab Coordinator**: max 6 periods/day, max 4 assigned days/week.
- **Leisure periods within a teaching day are permitted** for both roles.
- **Lab coordination work does not count toward a Faculty member's teaching load** (a Faculty acting as coordinator has that time excluded from their 25-period limit).

Because these are constants, the setup form does not need per-faculty limit fields — the constraint check functions reference the constants directly.

## Flows in this document

- **F-01** — First-time term setup (Admin) — covers PS-03
- **F-02** — Generate, review, and send timetable for approval (Admin) — covers PS-01
- **F-03** — Manually edit a timetable with conflict detection (Admin) — covers PS-01 and PS-02
- **F-04** — HOD reviews and approves a timetable (HOD)
- **F-05** — Admin publishes the approved timetable (Admin) — covers PS-01
- **F-06** — Configure an elective basket (Admin)
- **F-07** — Lab session assignment: teaching Faculty + Lab Coordinator (Admin, inside F-02/F-03)
- **F-08** — View personal timetable (Faculty, Student, Lab Coordinator)

---

## F-01 — First-time term setup (Admin)

**Role:** Admin
**Goal:** Enter all the master data required before a timetable can be generated for a new academic term.
**Entry point:** Admin lands on the Setup → Overview screen immediately after logging in for the term.
**Preconditions:** Admin has a valid account; no timetable exists yet for the term (or the previous term's data is being cleared/reused per college practice).

### Steps

1. Admin lands on Setup Overview. The screen shows a checklist of every setup category (Faculty, Lab Coordinators, Subjects, Labs, Rooms, Sections, Time Slot Grid, Subject–Faculty Mapping, Elective Baskets) with a completion state next to each: **empty**, **partial**, or **complete**. A summary at top says something like "3 of 9 categories complete — generation not yet available."
2. Admin picks the first empty category, e.g. Faculty. The system doesn't enforce an order, but the checklist suggests a sensible one (data-that-others-depend-on first).
3. On the Faculty screen, Admin sees two options: **Add one** (single form, matches the existing UI's Add Faculty form) and **Import bulk** (upload a CSV/spreadsheet with all faculty). The single-entry form is preserved from the existing UI because it validates in the frontend today and doesn't need replacement — bulk import supplements it.
4. If bulk import: Admin downloads a CSV template, fills it, uploads it. The system validates rows (required fields, duplicates against existing data, format) and shows a preview: N rows will be added, M rows have errors highlighted with reasons. Admin fixes and re-uploads, or accepts the valid rows and handles errors separately.
5. Admin returns to Setup Overview. Faculty is now marked **complete**. The summary updates: "4 of 9 categories complete."
6. Admin repeats steps 2–5 for each remaining category. Order is Admin's choice, but dependencies are enforced softly: e.g. Subject–Faculty Mapping cannot be attempted before both Subjects and Faculty are complete — its checklist row shows "unavailable, needs Subjects + Faculty" instead of a normal link.
7. Once all 9 categories are complete, the top summary changes to "Setup complete — timetable generation ready." A prominent action to go to Timetable → Generate appears.

### Decisions Admin makes along the way

- Whether to enter data one-by-one or bulk-import (per category, independently).
- What order to complete categories in (soft-suggested, not enforced).
- Whether to fix bulk-import errors immediately or accept partial data.

### System feedback

- Completion state updates in real time in the Overview as data is added.
- Any dependency-blocked category shows an inline explanation of what it's waiting on.
- Bulk-import errors are shown inline against the specific rows, with plain-language reasons.

### Errors and recovery

- **Bulk import file wrong format:** clear inline error naming what's expected (CSV, specific columns). Admin re-downloads the template.
- **Duplicate in bulk import:** row highlighted, existing record shown, Admin chooses to skip, update, or cancel.
- **Dependency-blocked category clicked:** system doesn't hide it, but shows why it's not yet available.

### Completion state

Setup Overview shows all 9 categories complete; the "Generate Timetable" action becomes available.

### Backend requirements (for the backend developer)

- Master data tables for each category, with validation rules mirroring the frontend validation the existing UI already does.
- Faculty record does **not** need per-person load-limit fields — limits are college-wide constants (see `DECISION_LOG.md`).
- Faculty record does need a `can_serve_as_lab_coordinator` boolean (for the ~30% of faculty who can double as coordinators, per F-07).
- Bulk import endpoint accepting CSV, returning a per-row validation result.
- Setup-progress endpoint returning completion state for each category (used by the Overview).
- Dependency logic (which categories require which others) — belongs in the shared constraint layer, not hardcoded into UI.

---

## F-02 — Generate, review, and send timetable for approval (Admin)

**Role:** Admin
**Goal:** Turn completed setup data into a draft timetable, review it, and get it in front of HOD for approval.
**Entry point:** Admin navigates to Timetable area after Setup Overview shows complete.
**Preconditions:** All setup categories complete (F-01).

### Draft lifecycle rules (applies across all F-02 runs)

- **First generation:** available any time Setup is complete and no timetable exists yet.
- **Subsequent generations:** only available when HOD has requested changes (status has returned to Draft). Generation is blocked while status is Pending HOD Approval or Approved — a Toast fires if Admin attempts it (see `PATTERNS.md` §8.1).
- **Draft limit:** Admin can hold up to 2 drafts at a time (Draft 1 = original; Draft 2 = post-HOD-changes revision kept for reference). A 3rd draft is possible in rare edge cases (HOD requests changes twice) but triggers a persistent warning banner on the Draft screen (see `PATTERNS.md` §8.2).
- **Draft deletion:** available at publish time or after publishing. Not available during Pending HOD Approval or Approved states. Deleting all drafts resets the count to 0 (see `PATTERNS.md` §8.3).

### Steps

1. Admin lands on the Timetable area. Because no timetable exists yet, the screen shows a single prominent action: **Generate Timetable**. A visible status indicator at the top says "No timetable yet" (this is the empty state for PS-01's status display).
2. Admin clicks Generate. The system runs the priority-based greedy algorithm (electives → labs → regular) with the repair pass, per the requirements doc.
3. When generation completes, the screen shows the draft timetable with the status indicator now reading **Draft**. A post-generation summary panel appears at the top: "N of M subjects placed. K unresolved gaps requiring manual attention. J placements adjusted by repair pass." This directly answers the PS-01 need for a summary.
4. Admin reviews the draft. Unresolved gaps are visually highlighted in the grid. Admin can click any gap to see what constraints prevented placement.
5. Admin either resolves gaps manually (this leads into F-03) or, if satisfied, clicks **Send for Approval**.
6. On clicking Send for Approval, a dialog appears with an optional note to HOD and a reminder that sending locks the timetable. Admin confirms.
7. On confirm, the status indicator changes from **Draft** to **Pending HOD Approval**. **The timetable locks immediately — edits and new generation are both disabled from this moment** until HOD approves or requests changes. The item appears in HOD's Approvals nav on their next login (F-04 step 1).

> ⚠️ **Superseded 2026-07-17 — the email hand-off is removed.** Steps 6–8 used to route the submission through Admin's own mail client: confirm the HOD's email address → *"The system opens Admin's email client … **This is the confirmed external email trigger** — the system doesn't send email directly on Admin's behalf; it prepares it"* → Admin sends it externally, returns, and marks the in-app action complete, which was what actually moved Draft → Pending.
>
> That framing is withdrawn (Prakash). **There is no email anywhere in this flow.** Confirming the dialog is the whole action: it sets the status and locks the timetable in one step. Recorded because the old wording said "confirmed", so anyone finding it in git history will reasonably assume it still holds — it does not. See `INTERACTION_DECISIONS.md` §11 and `PATTERNS.md` §6.1.
>
> **This removed a defect, not just a step.** The old step 8 made the status transition depend on Admin "marking the in-app action complete" — an affordance that was never designed or built. Draft → Pending therefore had **no trigger**. The confirm is now the trigger.

### Decisions Admin makes

- Whether to resolve gaps manually before sending, or send with unresolved gaps flagged.
- Whether to include a note to HOD explaining specific decisions.

### System feedback

- Progress indication during generation (even simple — spinner + "generating..." — since detailed progress feedback was deferred).
- Post-generation summary panel highlights outcomes clearly.
- Status indicator updates persistently, visible on every subsequent visit to Timetable.

### Errors and recovery

- **Generation fails** (algorithm can't produce any valid assignment): system shows a clear failure state, names the likely cause (e.g. "faculty load limits too tight for available time slots"), and offers Admin to return to Setup to adjust.
- **Send-for-approval action attempted while status is not Draft:** action is disabled with an explanation of current status.
- **Generate attempted while status is Pending HOD Approval:** Toast fires — "Can't generate a new timetable — waiting for HOD's response." (see `PATTERNS.md` §8.1).

### Completion state

Timetable status is **Pending HOD Approval**. Admin sees a success Toast — *"Sent for HOD review. Waiting for approval."* (`PATTERNS.md` §4.2) — and can navigate away. *(Was: "a confirmation that the email was sent" — superseded 2026-07-17, see step 7.)*

### Backend requirements

- Generation endpoint that runs the algorithm and returns the draft + summary metrics (placed/unplaced/repaired counts).
- Generation gating: endpoint rejects generation requests while status is `pending_approval` or `approved`, returning a 409 with reason.
- Timetable status field on the timetable record, with valid transitions: `none → draft → pending_approval → approved → published`, plus the reverse edge `pending_approval → draft` (only when HOD requests changes).
- Draft count field on the timetable record: increments on each successful generation, resets to 0 on full draft deletion.
- Submit-for-approval endpoint: accepts the optional note, transitions `draft → pending_approval`, and applies the lock — **one atomic call**. ~~Endpoint to trigger the pre-composed email (or provide the mailto content for the frontend to open).~~ **Removed 2026-07-17** — no mail service, no mailto content, no separate "mark as sent" endpoint (see step 7).
- Note storage: the optional note is persisted on the timetable record and returned with the approval payload (F-04 step 3 shows it to HOD).
- Locking mechanism: while `pending_approval` or `approved`, edit endpoints and generation endpoint reject writes.

---

## F-03 — Manually edit a timetable with conflict detection (Admin)

**Role:** Admin
**Goal:** Adjust the draft timetable (resolve a gap, move a class, swap faculty) without unknowingly creating a new conflict.
**Entry point:** Admin is on the Timetable Review & Edit screen with a draft.
**Preconditions:** Timetable status is **Draft** (not yet sent for approval).

### Steps

1. Admin sees the timetable grid with unresolved gaps highlighted. Admin clicks any cell (an existing placement or a gap).
2. A side panel opens showing the cell's current state: subject, faculty, room, section, time slot. Admin can change any of these via dropdowns/pickers.
3. As soon as Admin changes a value, the system runs constraint checks in the background — no separate "check conflicts" button. Results appear inline:
   - Green tick + summary if the change is valid.
   - Red warning + specific reason if a conflict is detected ("Faculty X already assigned to Subject Y in Section 2, Monday 10 AM"). This is the direct answer to PS-02: conflict feedback lives at the moment of the edit, not on save.
4. Admin can either accept the conflict warning and continue (the system saves it anyway, but marks the cell as conflicted for later review) or adjust to something valid.
5. Admin's edit is saved locally. The post-generation summary panel updates to reflect any new conflicts introduced or gaps resolved.
6. Admin repeats for other cells as needed.
7. When done, Admin either navigates back to Send for Approval (F-02 step 5 onwards) or leaves; unsaved changes are auto-saved with a "last edited" indicator.

### Decisions Admin makes

- Whether to accept a conflict warning and save anyway, or adjust to a valid state.
- Whether an unresolved gap is genuinely unresolvable and needs a note to HOD, versus needing more editing effort.

### System feedback

- Inline conflict warnings appear as Admin makes changes, before saving.
- The overall summary panel updates in real time as edits accumulate.
- Cells with active conflicts are visually distinct from clean placements.

### Errors and recovery

- **Constraint check fails (backend unreachable):** system shows an inline warning that live conflict-checking is unavailable and the edit will be checked on save instead. Not blocking.
- **Admin closes the screen with pending edits:** auto-save ensures nothing is lost; a "last edited N minutes ago" indicator is visible on return.

### Completion state

Admin has made all desired edits. Timetable status is still **Draft**. Cells are either valid or explicitly marked conflicted.

### Backend requirements

- Cell-level edit endpoint that accepts a proposed change and returns constraint-check results (list of violations, or none).
- The constraint checks must be callable per-edit, not only during batch generation. This aligns with the "reusable standalone functions" architecture noted in the original requirements doc. The required set now includes:
  - `isFacultyFree(faculty, slot)` — no double-booking against existing assignments.
  - `isRoomFree(room, slot)` — same, for rooms.
  - `hasConsecutiveSlots(slots)` — for labs requiring 2–3 adjacent periods.
  - `underDailyLimit(faculty, day)` — faculty ≤ 6 periods that day.
  - `overDailyMinimum(faculty, day)` — if faculty has any assignment that day, they have ≥ 4 periods (checked at the point where a full day's schedule is finalized, not on every single edit).
  - `underWeeklyLimit(faculty)` — faculty ≤ 25 periods that week.
  - `underLabDaysLimit(faculty)` — faculty runs labs on ≤ 2 days that week.
  - `underCoordinatorDaysLimit(coordinator)` — coordinator assigned on ≤ 4 days that week.
  - `underCoordinatorDailyLimit(coordinator, day)` — coordinator ≤ 6 periods that day.
- Auto-save with optimistic concurrency (if the backend rejects an edit, frontend shows the reason and reverts).

---

## F-04 — HOD reviews and approves a timetable (HOD)

**Role:** HOD
**Goal:** Look at the timetable Admin submitted and decide whether it's good to publish.
**Entry point:** HOD logs in via the Faculty login flow and lands on the Approvals area, which appears in their nav because something is pending. *(Was: "HOD receives Admin's email, follows the link to the app…" — **superseded 2026-07-17**, the email hand-off is removed; see F-02 step 7. Step 1 below already described this in-app path, so nothing else in F-04 depended on the email.)*
**Preconditions:** A timetable exists with status **Pending HOD Approval**.

### Steps

1. HOD logs in. Because there's a pending approval, the Approvals area appears in HOD's navigation. HOD clicks it.
2. Approvals shows a single pending item (the current model is one active timetable at a time, so a queue of one is expected). HOD clicks it.
3. HOD sees the full timetable grid, read-only, with the same post-generation summary Admin saw. Any conflicts Admin left in are visually marked. Admin's optional note is shown at the top.
4. HOD has two actions: **Approve** and **Reject**. Reject is available but described as rare — it opens a required text field for reason, since rejection kicks the timetable back to Admin's Draft state.
5. HOD picks Approve (expected case). The system confirms the action.
6. Timetable status changes from **Pending HOD Approval** to **Approved**. Admin receives an in-app indication next time they load Timetable. *(The "and, optionally, an email" clause is dropped — 2026-07-17, there is no mail service in the system at all; see F-02 step 7. Admin is expected to check status, which the flow already assumed.)*
7. HOD's Approvals list is now empty; the area hides itself from HOD's nav until something new arrives.

### Decisions HOD makes

- Approve (typical) or Reject (rare — requires a written reason).

### System feedback

- The action's effect on status is immediate and visible.
- The timetable is locked to Admin edits from the moment it is submitted for approval (status transitions to Pending HOD Approval), not from the point of approval. This lock is released only if HOD requests changes (status returns to Draft).

### Errors and recovery

- **HOD tries to approve but network fails:** action stays available; retry succeeds.
- **HOD accidentally rejects:** the reject flow includes a confirmation step and requires typing a reason, which reduces accidental clicks.

### Completion state

Timetable status is **Approved**. Admin can now publish.

### Backend requirements

- Approve endpoint transitioning `pending_approval → approved`.
- Reject endpoint transitioning `pending_approval → draft`, storing the rejection reason.
- Approvals-list endpoint returning pending items for the logged-in HOD.

---

## F-05 — Admin publishes the approved timetable (Admin)

**Role:** Admin
**Goal:** Make the approved timetable live so Faculty, Students, and Lab Coordinators see it.
**Entry point:** Admin returns to Timetable area after HOD approves.
**Preconditions:** Timetable status is **Approved**.

### Steps

1. Admin loads Timetable. The status indicator now reads **Approved — ready to publish**. A prominent **Publish** action is available. The timetable content is visible but read-only in this state (edits require reverting to Draft, which invalidates the approval).
2. Admin clicks Publish. The system asks for confirmation, showing what will happen: "This will replace the currently published timetable (if any) and make this version visible to all Faculty, Students, and Lab Coordinators. This cannot be undone."
3. Admin confirms. The timetable status changes from **Approved** to **Published**. A "Published on [date/time]" label is added persistently.
4. Read-only views (F-08) now reflect this timetable for all applicable users.

### Decisions Admin makes

- Whether to publish immediately, or delay (approved timetable can sit until Admin is ready).

### System feedback

- Confirmation dialog explicitly names the "cannot be undone" consequence — critical for PS-01, since republishing overwrites.
- Success confirmation and the timestamp are visible after publish.

### Errors and recovery

- **Publish fails mid-way:** timetable stays in **Approved** state, Admin can retry. There's no half-published state.
- **Republishing a later version:** same flow, but the confirmation is stronger — it names the previous published version's date and reinforces that history is not kept (which matches the confirmed decision to defer version history).

### Completion state

Timetable status is **Published**. All read-only views reflect it.

### Backend requirements

- Publish endpoint transitioning `approved → published`, atomically replacing any previous published timetable.
- Read-only view endpoints filter by role and by user's own assignments (Faculty sees only their own; Student sees only their section; Lab Coordinator sees only their labs).

---

## F-06 — Configure an elective basket (Admin)

**Role:** Admin
**Goal:** Define an elective basket for 3rd or 4th year — which electives it contains, which sections contribute students, which time slot it occupies.
**Entry point:** Setup → Elective Baskets.
**Preconditions:** Subjects, Faculty, Sections, and Time Slot Grid are complete (dependency).

### Steps

1. Admin lands on Elective Baskets. The screen shows any existing baskets for both 3rd and 4th year (initially empty). Admin picks a year to work in.
2. Admin creates a new basket, naming it (e.g. "3rd Year — Semester 5 Elective Basket A"). The system assigns it to the chosen year.
3. Admin picks the time slot the basket will occupy. Only slots not already taken by another basket for the same year are selectable.
4. Admin adds elective subjects to the basket: picking from Subjects marked as elective-type, assigning a faculty to each, and assigning a room sized appropriately (per the requirements doc rule that each elective needs its own room).
5. Admin flags which sections contribute students. All flagged sections will be blocked off from regular classes during the basket's time slot when the timetable is generated.
6. Admin saves. The basket is now stored and will be honored by the generation algorithm (F-02).

### Decisions Admin makes

- Which time slot to assign the basket.
- Which subjects, faculty, and rooms belong to each elective in the basket.
- Which sections contribute students.

### System feedback

- The time slot picker only shows valid options.
- If a chosen faculty is already assigned elsewhere in a conflicting way, the system warns inline (same constraint check as F-03).

### Errors and recovery

- **Attempting to save with missing required fields:** inline validation, save is blocked until fixed.
- **Elective with no enrolled students** (open question — low enrollment policy): out of scope for this flow until the policy is decided.

### Completion state

Basket is saved. Setup Overview reflects Elective Baskets as complete (or partial, if other baskets remain to configure).

### Backend requirements

- Elective basket entity with year, time slot, contributing sections, and a list of electives.
- Elective entity with subject, faculty, and room references.
- Validation that time slots don't collide across baskets for the same year.

---

## F-07 — Lab session assignment: teaching Faculty + Lab Coordinator (Admin, embedded in F-02/F-03)

**Role:** Admin
**Goal:** When editing or reviewing a lab session, assign the required primary teaching Faculty plus the second person (Lab Coordinator or Faculty acting as coordinator).
**Entry point:** Inside F-03, when Admin edits a cell that represents a lab.
**Preconditions:** Lab Coordinators and Faculty (with the "can also serve as coordinator" flag on ~30% of records) are set up.

### Steps

1. Admin clicks a lab cell. The edit panel shows the lab requires two people: a teaching Faculty (required) and a second person (Lab Coordinator or Faculty-as-coordinator).
2. Admin picks the teaching Faculty from a dropdown showing Faculty available in this time slot (constraint check applied).
3. Admin picks the second person from a combined list of Lab Coordinators (primary pool) and Faculty flagged as coordinator-capable, filtered to those available in this time slot.
4. The system validates the pair against constraints: neither person can already be teaching or coordinating elsewhere in this slot; both must be available.
5. If the constraint check passes, the assignment saves. If it fails, the specific violation is shown (same pattern as F-03).

### Decisions Admin makes

- Which teaching Faculty and which second person.

### System feedback

- Dropdowns are pre-filtered to available people.
- Inline conflict warnings if the pair creates a violation.

### Errors and recovery

- **No available second person:** system shows this state clearly — Admin either adjusts the time slot or adds more Lab Coordinators to setup.

### Completion state

Lab cell has both people assigned; the cell is no longer flagged as incomplete.

### Backend requirements

- Lab session entity supporting two-person assignment (primary teaching Faculty + second person).
- Constraint check extended to validate the pair: both must be free, both must not double-book, and the Faculty side must not exceed the 2-lab-days-per-week limit, while the Coordinator side must not exceed 4 assigned days or 6 periods that day.
- Faculty record has a `can_serve_as_lab_coordinator` boolean (used to include coordinator-capable faculty in the second-person picker).

---

## F-08 — View personal timetable (Faculty, Student, Lab Coordinator)

**Role:** Faculty / Student / Lab Coordinator (HOD too, in their teaching capacity)
**Goal:** See the current published timetable, filtered to what applies to them.
**Entry point:** After logging in, user lands on My Timetable.
**Preconditions:** A timetable is Published.

### Steps

1. User logs in. The system routes to My Timetable based on role.
2. User sees a read-only timetable grid showing only their own commitments:
   - Faculty: classes and labs they teach.
   - Lab Coordinator: labs they're coordinating.
   - Student: classes for their section, including elective slot if 3rd/4th year.
   - HOD: their own teaching (HOD as Faculty).
3. The status indicator at the top shows **Published — as of [date/time]** so users know how current the view is.
4. User can view the grid, filter by day/week, and **export or print their timetable**.

### Viewport (confirmed 2026-07-17 — see `INTERACTION_DECISIONS.md` §10)

All three roles have **two views of the same published data**:

- **Mobile (375px, primary)** — vertical day-list with a Mon–Fri day selector, per Principle 7.
- **Desktop (1280px)** — full week grid with **View Controls**: Day/Week toggle, filter, **Export**, **Print**.

The two must show the same schedule; the desktop view is the wider expression of it, not a different one.

> Step 4 previously read *"print/export (basic functions; not the focus of the redesign)"*. **That was wrong and is superseded** — a personal timetable is something people print, pin up and check on a laptop. Export/print are a stated capability of every read-only role. They are still **not edit affordances** (they produce a copy and change nothing), so Principle 5 holds.

**Student is deliberately unfiltered.** Faculty and Lab Coordinators are *assigned to* sessions, so their view is a filter over the timetable. A Student is a member of a **section**, and that section's timetable *is* theirs — there is nothing to filter out. See §10.3.

### Decisions users make

- View options (day, week, filter, export, print). No editing decisions — this is read-only.

### System feedback

- Status indicator makes the "when was this published" question answerable at a glance (PS-01 for non-Admin roles).

### Errors and recovery

- **No timetable published yet:** empty state explaining nothing has been published, no error framing.
- **User has no assignments in the current timetable:** empty state explaining they aren't assigned to any classes/labs/sections this period, not an error.

### Completion state

User has seen their schedule. Session ends when they log out or close the app.

### Backend requirements

- Role-filtered timetable endpoints:
  - `GET /my-timetable/faculty/{id}` — returns classes/labs where this faculty is teaching.
  - `GET /my-timetable/coordinator/{id}` — returns labs where this person is coordinating.
  - `GET /my-timetable/student/{id}` — returns classes for this student's section + their elective if applicable.
  - `GET /my-timetable/hod/{id}` — returns the HOD's own teaching (lectures + electives; never labs, per `INTERACTION_DECISIONS.md` §9).
- All read-only; no write endpoints for these roles.
- **Desktop views need no new endpoints.** The mobile day-list and the desktop week grid render the *same* role-filtered payload — the difference is presentation only. Export/print operate on data the client already has.

---

## Flows explicitly not documented (and why)

- **Login and logout** — behavior isn't changing meaningfully; existing patterns work.
- **Adding a single faculty/subject/lab record via the single-entry form** — behavior is preserved from the existing UI; bulk import supplements it (F-01).
- **A dedicated status/overview dashboard for non-Admin roles** — deferred per scope decisions.
- **Version history browsing** — deferred; PS-01 covers current-state visibility only, not historical.
- **HOD rejection re-work loop** — treated as a rare edge case per the confirmed decision; the mechanics (F-04 step 4) are documented but a separate flow is unnecessary given rejection is expected to be uncommon.

## What this document does not decide

Flows describe *what* happens and *why*, not exact screen layouts, component choices, visual language, or specific interaction patterns (e.g. exactly how the setup progress checklist looks, or exactly how the conflict warning is styled). Those are Design System and high-fidelity Figma decisions in later stages.
