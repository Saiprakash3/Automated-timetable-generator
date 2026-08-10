# Information Architecture

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-IA-001
Evidence status: Partial — grounded in confirmed decisions from `DECISION_LOG.md` and problem statements PS-01/02/03; some naming and grouping choices are design proposals to be validated at design review.

---

## Purpose of this document

Describe *how the redesigned system is organised*: what top-level areas exist, what lives inside each, how the five roles enter and move through it, and where the three problem statements land in the structure. This is the map. User flows (`USER_FLOWS.md`) describe the paths people take across that map, and the flow diagrams (`FLOW_DIAGRAMS.md`) show those paths visually.

## Core principles guiding this IA

Three principles come out of the problem statements and evidence. Every structural choice below traces back to one of them:

1. **State should be visible before content.** Because PS-01 (state/trust visibility) says people don't know if what they're looking at is draft, pending, or live, status has to be a top-level, persistent piece of the layout — not something buried on a settings screen.
2. **Setup is a workflow, not a menu.** Because PS-03 (efficient setup) says the current sidebar reads as disconnected menu items, setup needs to be visualised as a sequence with progress, not as ten independent options.
3. **Editing and safety are the same task.** Because PS-02 (safe editing) says the current UI has no conflict feedback at all, editing and conflict-checking cannot be two separate places — they need to be one integrated experience.

## Top-level structure

The redesigned system is organised into four top-level areas, mapping to the natural stages of the Admin's work plus the read-only views for other roles. This is a departure from the current sidebar, which lists ten operations as flat menu items with no sequence or grouping.

| Area | What it contains | Who sees it |
|---|---|---|
| **Setup** | Everything needed before generation is possible: faculty, subjects, labs, rooms, sections, time slot grid, subject–faculty mapping, elective baskets. Grouped as a progressive workflow with visible completion state. | Admin only |
| **Timetable** | The generated timetable itself — generation trigger, review, edit, send-for-approval, publish. Includes the visible state indicator (Draft → Pending Approval → Published) and integrated conflict-review. | Admin (full), HOD (approve/reject only), Faculty/Student/Lab Coordinator (read-only view of their own portion) |
| **Approvals** | The HOD's queue of timetables awaiting review, with approve/reject actions. Only visible when there's something to approve. | HOD only |
| **My Timetable** | Personal read-only view of the currently published timetable, filtered to what applies to that role. | Faculty, Student, Lab Coordinator (HOD sees this too, since HOD also teaches) |

Everything the redesign focuses on lives in these four areas. Existing operations that don't need to change (login, logout) sit outside this structure at the shell level.

## Sitemap

```
Root
├── Landing (public)
├── Login
│
├── Admin shell
│   ├── Setup                              ← PS-03 anchor
│   │   ├── Overview (progress dashboard)
│   │   ├── Faculty
│   │   ├── Lab Coordinators
│   │   ├── Subjects
│   │   ├── Labs
│   │   ├── Rooms
│   │   ├── Sections
│   │   ├── Time Slot Grid
│   │   ├── Subject–Faculty Mapping
│   │   └── Elective Baskets
│   │
│   └── Timetable                          ← PS-01 + PS-02 anchor
│       ├── Generate
│       ├── Review & Edit (draft state)
│       ├── Send for Approval
│       └── Publish (once approved)
│
├── HOD shell (also has Faculty shell — HOD teaches)
│   └── Approvals
│       ├── Pending queue
│       └── Review & Approve/Reject
│
└── Read-only shell (Faculty / Student / Lab Coordinator)
    └── My Timetable
        └── Current published version
```

Notes on why this shape:

- **Setup's "Overview" is not just a landing page** — it holds the setup progress state (which categories have data, which are empty, whether generation is unlockable yet). This is the concrete UI answer to PS-03.
- **Timetable is one area, not four separate screens** for Generate/View/Edit/Publish. The current UI splits these; the redesign treats them as stages of the same object with a visible status. This is the concrete answer to PS-01.
- **Approvals only appears when relevant** — no permanently empty "Approvals" tab for HOD when nothing's pending. This is a small but real usability decision.
- **Read-only shell is deliberately minimal** — Faculty/Student/Lab Coordinator/HOD-as-teacher don't need a full app, just their own schedule.

## Role and permission model

Five roles, three access shells. Access is enforced per top-level area, not per screen, which is simpler to reason about and to implement later.

**Login note (updated 2026-07-13, during Design System Planning):** all five roles authenticate through a single shared login screen — ID/email + password + an explicit "your role" dropdown — rather than separate role-specific login flows. This reverses the original three-login model below (Admin login / Faculty login / Student login as distinct entry points). The role dropdown is a UI convenience only; the backend independently validates the selected role against the authenticated account's actual role record. Full component spec: `COMPONENTS.md` §G.3. Decision record: `DECISION_LOG.md`, 2026-07-13.

| Role | Login flow | Areas accessible | Actions |
|---|---|---|---|
| Admin | Shared login, role: Admin | Setup, Timetable | Full CRUD, generation, editing, send for approval, publish |
| HOD | Shared login, role: HOD (HOD teaches too) | Approvals, My Timetable | Approve/reject a submitted timetable; view own teaching schedule |
| Faculty | Shared login, role: Faculty | My Timetable | View own teaching schedule (read-only) |
| Lab Coordinator | Shared login, role: Lab Coordinator | My Timetable | View own lab-coordination schedule (read-only) |
| Student | Shared login, role: Student | My Timetable | View own section schedule, incl. elective slot for 3rd/4th year (read-only) |

Post-login routing (which shell/screen a user lands on) is determined by the validated role record, not the dropdown selection alone — a mismatch between selection and actual role is caught as a login error before routing happens, per `COMPONENTS.md` §G.3.

## Where the three problem statements land in the IA

| Problem | Where it lives in the IA | How the structure serves it |
|---|---|---|
| PS-01 State & trust visibility | Timetable area — persistent status indicator, plus explicit stages (Generate → Review & Edit → Send for Approval → Publish) | Status is part of the layout, not a hidden setting. Stages are named so it's clear where in the lifecycle any timetable currently sits. |
| PS-02 Safe manual editing | Timetable → Review & Edit — conflict detection is integrated into the edit screen, not a separate check | One place, not two. Conflict feedback appears at the moment of the edit, not on save or via a separate action. |
| PS-03 Efficient first-time setup | Setup area — Overview screen with progress state, plus each setup screen supporting bulk import | Progress is visible at all times. Bulk import lives within each setup screen where it's relevant, not as a separate "import" area, so it's discovered at the moment of need. |

## What the IA deliberately does not include

- **A dedicated status/overview dashboard for anyone except Admin** — the audit gap analysis listed this, but it defaulted to deferred in scope. Not included in the IA.
- **Version history browsing** — PS-01 covers the *state* of the current timetable, not a browsable history of past ones. The republish-overwrites decision still holds; version history is deferred.
- **Notification centre / inbox** — still excluded, but **the reasoning changed on 2026-07-17**. It used to read: *"HOD approval is triggered by an external email (confirmed decision)."* The email hand-off is now removed entirely (`INTERACTION_DECISIONS.md` §11), so that justification is void — and the obvious inference, *no email means the HOD needs an inbox*, is wrong. The **Approvals nav item is the notification**: F-04 step 1 has it appear when something is pending and step 7 has it hide itself when the queue empties. It is scoped to the single thing a HOD is asked to do, and the model is one active timetable at a time, so the queue is never longer than one. An inbox would be a more general mechanism than the problem needs.
- **Search across all data** — not raised as a need in the audit or research; deferred until it is.

## Navigation model

- **Admin uses a persistent left navigation** with two primary sections (Setup, Timetable). Setup expands to show its sub-items with a completion indicator next to each. This directly supports PS-03.
- **HOD uses a minimal navigation** with two items when relevant: Approvals (only when non-empty) and My Timetable. HOD's shell is simpler than Admin's because HOD's job in this system is narrower.
- **Faculty, Student, Lab Coordinator use no navigation** beyond a single "My Timetable" view — the app is essentially one screen for them. Adding navigation for a single view would be structural noise.

## Open decisions this IA does not settle

- Whether Setup sub-items appear as a checklist, wizard, or free-navigation-with-progress. That's an interaction-design decision covered in the next stage, not an IA decision.
- Exact placement and design of the persistent status indicator. That's a component-level decision for the design system stage.
- Whether HOD's Approvals shell reuses the Admin shell chrome or is a distinct visual environment. Deferred to design.
