# Research Insights — AI-Assisted, Scoped to Confirmed In-Scope Items

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-UXR-001
Evidence status: Assumption-based (Category B) — see `ASSUMPTION_LOG.md`. None of this is validated with real Faculty, Students, HOD, or Lab Coordinators. Every point below should be read as "likely, based on comparable systems and UX principles," not as confirmed user need.

---

## How to read this document

Per Section 11.6/11.7 of the project rules: this is AI reasoning used as a research assistant, not evidence. Every pain point is a hypothesis, not a finding. Where a comparable pattern from similar systems informs a point, it's named. Nothing here should be quoted elsewhere as if it came from a real user.

Scoped strictly to the 6 confirmed in-scope items — not a general audit re-run.

---

## 1. Version history / draft–approval–published state clarity

**Likely pain point (Admin):** Without a visible state (Draft / Sent for HOD Review / Approved / Published), Admin has no way to tell at a glance whether a timetable currently on screen is the live one or a work-in-progress edit. This is a common failure mode in tools that added an approval step onto a system that didn't originally have one — the UI can lag behind the new process. *(Comparable pattern: most document-approval tools — e-signature platforms, CMS drafts — solve this with a persistent status badge, not a separate screen.)*

**Likely pain point (Faculty/Student):** If Admin edits after HOD approval but before republishing, Faculty/Students may see a timetable that looks final but isn't yet reflected everywhere consistently (e.g., cached views, printed schedules). A visible "last published" timestamp is a common mitigation.

**Likely pain point (HOD):** Since rejection is rare, HOD may not carefully distinguish between "reviewing a new timetable" and "reviewing what's essentially the same one again after a minor tweak." Some visual diff or "what changed since last review" cue reduces rubber-stamping risk — though this could also be considered scope creep beyond what's needed; flagging as optional.

**Design implication for IA/User Flows:** A single, unambiguous status indicator ("Draft," "Pending HOD Approval," "Published — [date]") should exist wherever a timetable is viewed by any role, not just on the Admin's edit screen.

---

## 2. Visible conflict-review workflow during manual edit

**Confirmed context:** The existing UI does not detect conflicts on manual edit at all (confirmed by Prakash) — this is a new capability being introduced, not a refinement.

**Likely pain point (Admin):** Manually resolving a flagged gap without any conflict feedback risks introducing a *new* conflict while fixing an old one (e.g., moving a class into a slot where the same faculty already teaches elsewhere). This is a well-documented failure mode in manual scheduling tools generally. *(Comparable pattern: calendar apps and room-booking systems typically show an inline warning at the moment of the conflicting action, not just on save.)*

**Design implication:** Real-time or on-save conflict feedback (inline, not requiring a separate "check conflicts" step) would likely reduce errors more than a passive report. This is a design decision for Interaction Design, not something to over-build in Research — noting the direction, not the full spec.

---

## 3. Post-generation summary

**Likely pain point (Admin):** After the priority-greedy + repair-pass algorithm runs, Admin currently has to infer what happened by scanning the whole grid. A short summary — subjects placed successfully, unresolved gaps needing manual attention, any repairs the system made — saves that scanning effort. *(Comparable pattern: build/CI tools that show a pass/fail/warnings summary before the full log.)*

**Likely pain point (HOD):** If HOD is expected to trust the system enough that rejection is rare, a summary of what the algorithm did/traded off may build that trust more than the raw grid alone — HOD isn't necessarily going to manually verify every cell.

**Design implication:** This pairs naturally with item 1 (state clarity) — a post-generation summary and a status badge could live in the same review screen rather than as separate features.

---

## 4. Bulk import (setup)

**Likely pain point (Admin):** Entering faculty, subjects, and labs one-by-one (as the current Add Faculty/Add Subject/Add Lab forms require) doesn't scale well at the start of each term, when most data entry happens at once rather than incrementally. *(Comparable pattern: most admin tools with recurring bulk setup — HR systems, LMS course rosters — offer CSV/spreadsheet import specifically for the initial bulk-entry moment, while keeping single-item forms for ongoing edits.)*

**Design implication:** Bulk import likely matters most for the *initial* term setup, less for ongoing edits — the existing single-entry forms probably don't need to be replaced, just supplemented.

---

## 5. Guided onboarding (setup)

**Likely pain point (Admin, first use):** The current setup order (Add Faculty → Add Subjects → Add Lab → Map Faculty-Subject → Generate) isn't self-evident from the sidebar alone — a new Admin could plausibly try to generate a timetable before completing prerequisite setup steps, and only find out it's incomplete when generation fails. *(General UX principle: systems with a required setup sequence benefit from either enforcing the order or making it visible, rather than allowing free navigation with silent prerequisites.)*

**Design implication:** This overlaps meaningfully with item 6 (progress visibility) — a setup checklist could serve both onboarding and progress-tracking purposes in one component, worth designing together rather than separately.

---

## 6. Setup progress visibility

**Likely pain point (Admin):** No current way to see, at a glance, "faculty added, subjects added, labs added, mapping done, ready to generate" — Admin has to check each section individually. *(Comparable pattern: setup wizards and onboarding checklists in most SaaS admin panels.)*

**Design implication:** As noted above, likely combinable with guided onboarding (item 5) into a single setup-status component rather than two separate features.

---

## Cross-cutting observation (not tied to one item)

Items 1, 2, and 3 all relate to **system status visibility** around the review/approval moment. Items 4, 5, and 6 all relate to **setup-phase visibility**. This suggests two natural groupings for Interaction Design rather than six independent features — worth carrying forward into `INFORMATION_ARCHITECTURE.md`.

## What this document does not cover

The four deferred categories (generation-progress detail, drag-and-drop/undo editing, a dedicated dashboard, granular permissions/audit trail) and the still-open elective-enrollment policy question are intentionally excluded here — see `OPEN_QUESTIONS.md`.

## Recommended next task

Move into Research Synthesis / Problem Statements — converting the two groupings above into 2–3 concise problem statements to anchor Information Architecture, rather than treating all 6 items as independent design problems.
