# Research Synthesis

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-RS-001
Evidence status: Partial — combines Confirmed (Prakash's direct audit/answers) and Assumption-based (Category B insights) evidence, each labeled below.

---

## Purpose
Pull together the UX Audit findings (`ux-audit/AUDIT_RECOMMENDATIONS.md`) and the assumption-based research (`ux-research/INSIGHTS.md`) into one coherent picture, as the direct input to Problem Statements.

## What we now know, by evidence type

**Confirmed (Prakash's direct audit + answers)**
- The existing UI has no conflict detection whatsoever on manual edit — not a partial gap, a complete absence.
- The existing UI already validates Add Faculty/Subject/Lab forms on the frontend — this is a strength to preserve, not a gap to fix.
- Version history / no-undo-on-republish was, by a wide margin, the most repeated complaint across the original audit, surfacing under Admin, Faculty, and HoD pain points independently of each other.
- The HOD approval flow has a real-world step outside the app (an email) bridging the in-app review and the in-app approval action — this is a hybrid flow, not a fully in-app one.
  > ⚠️ **The product no longer models this (2026-07-17).** The finding itself **stands and is deliberately not rewritten** — this is a *research* entry, a record of what was observed, and a later design decision cannot make a past observation untrue. What changed is that the **design stopped accommodating it**: the email hand-off is removed and Send for Approval is fully in-app (`INTERACTION_DECISIONS.md` §11). If people still email each other about timetables, that now happens outside the product's awareness — a choice, not an oversight. **Recheck anything downstream that cites this bullet to justify a hybrid flow** — `PROJECT_BRIEF.md` (publish flow), `INFORMATION_ARCHITECTURE.md` (no notification centre) and `USER_FLOWS.md` F-02/F-04 all did, and are updated.
- Elective basket configuration needs a new screen; the existing `displayElective` only shows a count and an add action.

**Assumption-based (Category B, from `INSIGHTS.md`)**
- Likely pain points tied to the 6 confirmed in-scope items, grouped into two themes:
  - **Approval & trust visibility** — Admin/HOD/Faculty all likely struggle to answer "is this the current, live timetable?" without a visible state indicator, especially now that an approval step sits between generation and publish.
  - **Setup-phase visibility** — a new or infrequent Admin likely struggles to know what's configured, what's missing, and in what order to proceed, since the current sidebar doesn't enforce or visualize sequence.

## Why these two themes matter more than the individual 6 items

Treating "version history," "conflict-review," and "post-generation summary" as three separate design problems would mean three separate UI treatments for what is, underneath, one recurring need: **Admin and HOD need to trust what they're looking at, at every step from generation to publish.** Similarly, "bulk import," "guided onboarding," and "progress visibility" all serve one need: **a new Admin needs to get through setup without guessing.**

This synthesis is the basis for the two problem statements (plus one specifically isolating the conflict-safety issue, since it's a distinct interaction pattern — active error prevention — not just a status display) carried into `PROBLEM_STATEMENTS.md`.

## Gaps this synthesis does not resolve
The four deferred categories (generation-progress detail, drag-and-drop/undo editing, a dedicated dashboard, granular permissions/audit trail) and the elective-enrollment policy question remain open — see `OPEN_QUESTIONS.md`. Not addressed here by design, not by oversight.
