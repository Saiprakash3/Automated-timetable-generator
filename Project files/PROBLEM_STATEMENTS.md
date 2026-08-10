# Problem Statements

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-RS-001
Evidence status: Partial — see `RESEARCH_SYNTHESIS.md` for the evidence backing each statement.

---

## PS-01 — State and trust visibility

**Admin and HOD need an unambiguous way to see whether a timetable is a draft, pending approval, or published**, because the newly added HOD-approval step introduces a distinction that didn't exist in the original design — but currently there is no visible status indicator anywhere in the system, risking confusion about which version is actually live at any given moment.

*Evidence: version history was the audit's most-repeated complaint (Confirmed); no status concept exists in the current flow (Confirmed, by omission); likely confusion at each role's touchpoint (Assumption, `INSIGHTS.md` item 1).*

*Covers: version-history/approval-state clarity, post-generation summary.*

## PS-02 — Safe manual editing

**Admin needs confidence that a manual edit doesn't silently introduce a new scheduling conflict**, because the existing UI performs no conflict detection at all today — but currently there is no feedback between an edit action (resolving a gap, adjusting after HOD feedback) and its effect on faculty or room availability elsewhere in the grid.

*Evidence: existing UI has zero conflict detection (Confirmed, directly from Prakash); this is a well-documented failure mode in manual scheduling generally (Assumption, `INSIGHTS.md` item 2).*

*Covers: visible conflict-review workflow during edit.*

## PS-03 — Efficient first-time setup

**Admin needs to get through per-term data entry (faculty, subjects, labs, mappings) quickly and confidently**, because setup currently happens one record at a time with no visible progress or enforced order — but a new or infrequent Admin has no way to know what's already configured or what step comes next.

*Evidence: current sidebar doesn't enforce or display sequence (Confirmed, from screenshots); likely onboarding friction for infrequent Admin use (Assumption, `INSIGHTS.md` items 5–6).*

*Covers: bulk import, guided onboarding, setup progress visibility.*

---

## Why three, not six

Per `RESEARCH_SYNTHESIS.md`, the 6 confirmed in-scope items collapse into 3 design problems: two around approval/trust visibility (split into a *status display* problem and a *safety/prevention* problem, since they call for different interaction patterns) and one around setup efficiency. This is what Information Architecture and User Flows should be built against — not six independent feature requests.

## Not covered here
Elective enrollment policy remains a business-rule decision, not a UX problem statement — see `OPEN_QUESTIONS.md`.
