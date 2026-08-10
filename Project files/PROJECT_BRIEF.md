# Project Brief — Automated Timetable Generator Redesign

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-12
Last updated: 2026-07-12
Related tasks: TASK-UXA-001
Evidence status: Confirmed

---

## What the product is

An automated timetable generation system for a single department at MVGR College of Engineering. An Admin sets up master data (faculty, subjects, labs, electives), triggers an algorithm to generate a conflict-free timetable, reviews and manually edits it, and — under the current, updated process — sends it to the HOD for approval. HOD approval is what makes the timetable go live. Faculty and Students then view their relevant portion on read-only dashboards.

## Why this project exists

Manually building timetables is slow and error-prone. The system automates conflict-free scheduling across three lecture types (regular, lab, elective) while respecting faculty availability, load limits, and lab/room requirements.

## Current state (confirmed by screenshots + user)

- A working React frontend exists with at least 12 screens, all currently Admin-facing (login, dashboard, add faculty, add subjects, add lab, subject list, elective display, subject-faculty mapping, view timetable, edit timetable, plus the public landing page).
- **No database is connected yet.** This is why several expected screens (Generate Timetable trigger, room/section setup, Publish action) either don't render fully or weren't captured in the screenshot set — a known gap, not necessarily a missing feature.
- Backend and timetable-generation logic are **not complete**.
- A backend developer will join the project **after** the frontend work is finished — meaning backend implementation is out of scope for the current active window.

## Roles

| Role | What they do |
|---|---|
| **Admin** | Sole setup and editing authority. Enters master data, verifies missing-subject and hour-count coverage during setup, triggers generation, edits the draft, **submits it to HOD for review in-app**, and performs the final publish action once HOD approves. *(Was "emails HOD for review" — superseded 2026-07-17, see Publish flow below.)* |
| **HOD** | Approves the first generated timetable, approves changes for the next iteration, and approves the final table. Approval makes it go live. Also teaches classes — logs in through the Faculty flow. Rejection is treated as a rare edge case, not a designed-for path. Approval is granted once per whole timetable (not per section or basket). |
| **Faculty** | Views their own personal schedule (read-only), combining all lecture types they teach. Also the entry point for HOD and Lab Coordinator, who share this login flow. |
| **Lab Coordinator** | Separate pool of people from teaching Faculty. Assigned as the second person present in a lab session alongside one required teaching Faculty member. Roughly 30% of Faculty also serve as Lab Coordinators when their teaching load is lighter. Views the timetable. |
| **Student** | Views their section's timetable (read-only), including elective slots if in 3rd/4th year. |

## Lecture types

| Type | Duration | Applies to | Key rule |
|---|---|---|---|
| Regular | 1 period | Any section, any year | Standard faculty/room availability check |
| Lab | 2–3 consecutive periods | Single section | Needs adjacent free periods, one required teaching Faculty, plus a second person (usually a Lab Coordinator), and a free lab room |
| Elective | 1+ period(s) | 3rd and 4th year only | Cross-section groups; each year has its own basket and shared time slot; each elective gets its own appropriately sized room |

## Publish flow (updated — supersedes earlier "no approval hierarchy" decision)

Admin generates → Admin reviews/edits → **Admin submits for approval in-app (status becomes Pending HOD Approval and the timetable locks on confirm)** → HOD sees it in their Approvals nav on next login and takes an explicit Approve/Reject action in the UI (rejection is rare) → Admin is notified of approval in-app → Admin performs the manual publish action → timetable goes live. Approval and publish are two distinct steps.

> **Updated 2026-07-17 — the flow is now fully in-app.** It previously read: *"Admin **emails HOD requesting review (outside the app)**."* The email hand-off is removed entirely — no mail client, no external step, no round-trip. See `INTERACTION_DECISIONS.md` §11 for the decision and why it also closed a defect (the status transition depended on a "mark it complete" affordance that was never built).
>
> ⚠️ **Broken reference:** this section and `INFORMATION_ARCHITECTURE.md` both cite **`DECISION_LOG.md`**, which **does not exist anywhere in the project**. Pre-existing, not introduced by this change — but it means "the full history of this change" is currently unciteable.

## Technology (locked — not to be revisited without critical reason)

- Frontend: React.js
- Backend: Node.js
- Database: SQL

Improvements should focus on code quality, architecture, performance, scalability, maintainability, accessibility, security, and UX — not stack replacement.

## Constraints on this engagement

- 4 hours/week, 4-week deadline (16 hours total)
- Solo contributor (Prakash) for the current phase; backend developer joins after frontend is complete
- No real access to Faculty, Students, Admin, HOD, or Lab Coordinators for research — all research is AI-assisted assumption (Category B) unless Prakash provides direct input (Category A), with real validation deferred to later (Category C)

## What's explicitly out of scope right now

- Backend implementation (deferred to the incoming backend developer)
- Evolving the existing UI directly — the old UI is a **reference only**; the new design is built from scratch
