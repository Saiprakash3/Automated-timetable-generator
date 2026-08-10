# Prototype Checklist — Automated Timetable Redesign

Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-17 — reconciled against the built Figma file (see `Claude design review V1.md` §3.14)
Purpose: Step-by-step checklist for wiring interactive prototypes in Figma, ready for Prototype Review
Sources: `USER_FLOWS.md`, `INTERACTION_DECISIONS.md`, `PATTERNS.md`, `DOMAIN_COMPONENTS.md`, `FIGMA_BUILD_CHECKLIST.md` Phase 10

> **Note:** `FLOW_DIAGRAMS.md` was previously listed as a source here (and in `FIGMA_BUILD_CHECKLIST.md` line 26). **That file has never existed** — removed rather than left as a dangling reference.

---

## Scope

Not every screen needs prototyping — static screens communicate layout fine on their own. Prototyping is for demonstrating **how the interaction actually behaves**, especially where state changes, conflict detection, or multi-step flows aren't obvious from a static frame. This checklist covers four key flows plus the cross-cutting mechanics that make them work.

---

## Phase 0 — Prerequisites

- [x] 🔴 **Wrap every overlay screen into a single frame** — ✅ **done 2026-07-17.** Overlay screens were composed as **page-level siblings** (`screen` + `backdrop` + `dialog` side by side on the canvas), and a Figma prototype `NAVIGATE` can only target **one frame** — so no overlay was reachable as a destination. **23 nodes wrapped into 15 composite frames** (13 on `🖥 Admin Screens`, 2 on `📋 HOD Screens`). Each composite is now `FRAME[ base · backdrop · overlay ]`, named for the screen, clipping at the viewport.
  - Wired: Add Single Record · Bulk Import Steps 1–4 · Cell Edit Drawer (open) · Cell Edit Drawer (time slot picker open) · Elective Basket (time slot picker open) · Send for Approval · Publish confirm · Republish confirm · Delete draft confirm · Pending (generation blocked) · HOD Request Changes · HOD Approved (confirmation)
  - **Target the outer frame, not the inner `base` instance.** Inside each composite the base screen is renamed `base`; the page-level frame carries the screen name.
  - Verified with `screenshot({contentsOnly: true})` — the overlay still renders in isolation, which is the proof it's self-contained. Read-Only screens have no overlays (they're day-lists), so nothing to do there.
- [ ] All screens from `FIGMA_BUILD_CHECKLIST.md` Phases 5–8 are built and finalized (no more layout changes expected — prototyping on unstable screens means rewiring later). *Status 2026-07-17: the grids, drawer and cell sizing were reworked for the new time-slot model — now settled. Don't wire until the §7 items below are closed.*
- [ ] Components used in flows have their states built as variants (per `COMPONENTS.md`/`DOMAIN_COMPONENTS.md`) — hover, focus, error, loading, etc. Prototyping needs these to exist before they can be wired to trigger
- [ ] **Interactive Components set up** for base components (Button, Input, Checkbox, Switch, Tab) — Figma's built-in feature auto-triggers hover/press/focus states without manual click-wiring for every instance. Set this up once per component; every instance inherits it.
- [ ] Figma's prototype settings reviewed: default transition (None), so you set duration/easing per-connection deliberately rather than relying on a global default

---

## Phase 1 — Flow 1: Setup (F-01)

Demonstrates: guided checklist behavior, dependency blocking, bulk import, progress update.

- [ ] Setup Overview → click a Setup Checklist Row (Empty state) → navigates to that category screen
- [ ] Category screen → Add Single Record modal opens (overlay, not full navigation)
- [ ] Fill form → Save → modal closes → back to category screen, record now listed
- [ ] Back to Setup Overview → row now shows Complete or Partial state (swap to the appropriate component variant)
- [ ] Setup Progress Summary ring/count updates to reflect new completion (swap to next variant — e.g., 1/9 → 2/9)
- [ ] Attempt to click a Blocked row → no navigation occurs (or a brief inline tooltip appears — your call, but the interaction should visibly do *nothing* destructive)
- [ ] Bulk Import: `Admin — Setup Faculty` → click **Import** → `Admin — Bulk Import · Step 1 Template` (Dialog `xl` instance, per `COMPONENTS.md` D.1)
- [ ] Stepper: Step 1 (Template) → Continue → Step 2 (Upload) → Continue → Step 3 (Validate, showing 12 valid / 2 errors) → Continue → Step 4 (Confirm summary) → Confirm import → modal closes → Setup Overview reflects new completion state. **All 4 step screens exist** — wire them as four frames, not variant swaps, since each is a separate overlay composition.
- [ ] Back path: Steps 2–4 each have a **Back** button — wire these too (the stepper supplies its own Cancel/Back/Continue row, so the Dialog's footer is switched off via `Show footer=false`)
- [ ] All 9 categories reachable from Setup Overview (link every row, even if the category screen behind it is a near-duplicate template). *Note: `Admin — Setup Faculty` now lives on `🖥 Admin Screens`; the other 8 are in the x=8000 column.*

**Transition settings:** Setup Checklist Row state changes → Instant or Dissolve, `--duration-default` (200ms). Modal open/close → Smart Animate, `--duration-moderate` (300ms), ease per `FOUNDATIONS.md` §6 (`--ease-enter` / `--ease-exit`).

---

## Phase 2 — Flow 2: Manual Edit with Conflict Detection (F-03)

This is the most important flow to get right — it's the flow that most directly demonstrates PS-02 and the severity model from `INTERACTION_DECISIONS.md` §1.3.

- [ ] Timetable Grid (Edit variant) → click an empty cell → Cell Edit Drawer opens (docked right, Smart Animate slide-in)
- [ ] Grid remains visible and un-dimmed behind the drawer (verify this in the prototype, not just the static screen)
- [ ] In drawer: select a Faculty who's available → no conflict badge appears → Save enabled
- [ ] **Blocking path:** select a Faculty who's double-booked → Conflict Badge (Blocking variant) appears inline → Save button becomes disabled (swap to disabled-state variant)
- [ ] Change Faculty selection to an available one → Blocking badge disappears → Save re-enables
- [ ] **Warning path:** create a second drawer flow (or a second interactive state on the same one) where selecting a Faculty triggers a Warning badge (e.g., load-limit exceeded) → Save stays enabled but shows "Accept and continue" → click it → cell saves, marked as conflicted
- [ ] **Time slot picker:** in drawer → click the **Time slot** field → `Admin — Cell Edit Drawer (time slot picker open)` → menu lists **only the 6 teaching periods**. Verify **12:00–1:00 lunch is not offered** (`DOMAIN_COMPONENTS.md` §5.1) — this is the single clearest demonstration that lunch is unassignable, and it's easy to miss in a static frame.
- [ ] Click the **Lunch column** in the grid → **nothing happens** (it's a non-interactive `--muted` column, not a cell — same "visibly does nothing" check as the Blocked Setup row)
- [ ] Save (clean case) → drawer closes → cell in grid updates to show the new assignment (swap grid cell instance)
- [ ] Click a different cell while drawer is open → drawer content updates to the new cell's data (don't open a second drawer — same drawer instance, content swaps)
- [ ] Escape or close button → drawer closes without saving

**Transition settings:** Drawer open/close → Smart Animate, `--duration-moderate` (300ms), `--ease-enter`/`--ease-exit`. Conflict Badge appear → Smart Animate or Dissolve, `--duration-default` (200ms), `--ease-emphasized` per `FOUNDATIONS.md` §6.3 (this one should feel more emphatic than a routine UI transition, matching the Blocking severity's intentional weight).

---

## Phase 3 — Flow 3: HOD Review and Approval (F-04)

Demonstrates: Approvals queue, read-only review, the Request Changes pattern.

- [ ] HOD Shell → `HOD — Approvals list` (3 pending) → click a pending item → `HOD — Approval Detail` opens. A `HOD — Approvals list (1 pending)` variant also exists if you want to show the queue draining.
- [ ] Detail view shows read-only Timetable Grid + Admin's note
- [ ] Click Approve → `HOD — Approved (confirmation)` — success Toast *"Timetable approved."* + the approved item gone from the queue (3 → 2, badge updated). Per `PATTERNS.md` §4.2 this is a toast, **not** a confirmation dialog — approving is not destructive.
- [ ] Separately (branch, or a second copy of this flow): click "Request changes" → **Confirmation Dialog** (Reversible, 400px) opens requiring a reason → Confirm disabled until reason is entered → type a reason → Confirm enables (swap the Button instance `State=Disabled` → `State=Default`) → click Confirm → returns to Approvals list
  - ✅ Rebuilt as a **Confirmation Dialog** 2026-07-17 per `PATTERNS.md` §6.2. Its confirm is **Primary**, not Destructive — `COMPONENTS.md` D.3 specifies Primary for Reversible, and §6.2 is explicit that HOD *"isn't rejecting a person's work, they're asking for revisions."*
- [ ] `HOD — Approvals list (empty)` reachable — *"No approvals pending"* (Empty State `State=Waiting`). Note the tension with `INTERACTION_DECISIONS.md` §4.2 (*"Approvals shown only when non-empty"*): the nav item hides, but the screen is still reachable as the end state of approving the last item.
- [ ] Status pill is **hidden** on all three Approvals list screens (`COMPONENTS.md` §H.2 — the pill is for *viewing a timetable*; a queue isn't one). It stays on Approval Detail.

**Transition settings:** List → Detail navigation → Smart Animate or simple navigate, `--duration-default`. Confirmation Dialog → Smart Animate, `--duration-moderate`.

---

## Phase 4 — Flow 4: Publish (F-05)

Demonstrates: the irreversible-action pattern and type-to-confirm.

- [ ] `Admin — Timetable Approved` → Publish button visible (Regenerate sits beside it, **visibly disabled** per `INTERACTION_DECISIONS.md` §7.2) → click Publish → `Admin — Publish confirmation` (Confirmation Dialog, Irreversible variant)
- [ ] Confirm button disabled by default
- [ ] Type "Publish" into the input (simulate via a second interactive state, since Figma prototypes can't validate real text input — use a toggle or a second frame showing the "filled correctly" state) → Confirm button becomes enabled by swapping the **Button instance** `State=Disabled` → `State=Default`
  - *This is now possible:* the Confirmation Dialog's footer used to be hand-built FRAMEs with no state to swap. It now uses real **Button instances** (Cancel = Secondary, Confirm = Destructive per `PATTERNS.md` §1.1/§1.2).
- [ ] **"Clean up drafts before making this live"** checkbox in the dialog → toggle it (Checkbox `State=Unchecked` → `State=Checked`). Per `INTERACTION_DECISIONS.md` §7.4 this is the publish-time half of draft deletion — worth showing, since it's the only place the two deletion entry points differ.
- [ ] Click Confirm → brief loading/publishing state (optional) → `Admin — Timetable Published`, with Status Pill updated and timestamp visible
- [ ] Cancel path: from the Confirmation Dialog, click Cancel → dialog closes, still in Approved state, nothing changed

**Transition settings:** Dialog open → Smart Animate, `--duration-moderate`. Button enable state → Instant (no animation needed — it's a validity change, not a visual event worth animating).

---

## Phase 5 — Flow 5: Draft Lifecycle (`INTERACTION_DECISIONS.md` §7 / `PATTERNS.md` §8)

Demonstrates: generation gating, the returned draft, the 3rd-draft warning, and draft deletion. **Added 2026-07-17** — this is Category-A confirmed behaviour with six built screens, and none of it was prototyped. It's also the flow that most needs prototyping: *every* one of these is a state change that is invisible in a static frame.

- [ ] **Returned draft (§7.2):** HOD "Request changes" (end of Flow 3) → Admin's next visit → `Admin — Timetable Draft (changes requested)` → **Review Note (Changes requested)** carries HOD's verbatim reason. This is the payoff of Flow 3 — wire the two flows together so the reason visibly survives the round trip.
- [ ] **Generation gating (§7.2 / `PATTERNS.md` §8.1):** `Admin — Timetable Pending Approval` → Regenerate is **visibly disabled** → attempt it anyway (keyboard path) → `Admin — Timetable Pending Approval (generation blocked)` → danger Toast: *"Can't generate a new timetable — waiting for HOD's response."*
  - Danger toasts **never auto-dismiss** (`COMPONENTS.md` §C.1) — wire an explicit dismiss on the toast's X, don't rely on a timed transition
- [ ] **Generate disabled on Approved too (§7.2):** `Admin — Timetable Approved` → Regenerate disabled there as well. Worth a click to confirm it does nothing.
- [ ] **3rd-draft warning (§7.3):** `Admin — Timetable Draft (3rd draft — final warning)` → **Review Note (Final Draft Warning)**, danger treatment, no attribution. Per `DOMAIN_COMPONENTS.md` §14 it **subsumes** the Changes-Requested note — the two must never both show, so wire this as a *replacement* state, not an addition.
- [ ] **Regenerate over existing edits (`PATTERNS.md` §6.3):** any Draft screen → **Regenerate** → `Admin — Regenerate confirmation` (Confirmation Dialog, **Destructive**) → *"Regenerating will replace the current Draft, including any manual edits you've made."* → Cancel returns to the Draft unchanged; Regenerate proceeds. Worth wiring from the **3rd-draft** screen too — that's where the consequence bites hardest (§7.3's warning is on screen, and regenerating again is what triggered it).
- [ ] **Delete draft, post-publish (§7.4):** `Admin — Timetable Published` → **Delete draft** → `Admin — Delete draft confirmation` (Confirmation Dialog, **Destructive**) → Cancel returns unchanged; Delete draft confirms
- [ ] **No delete affordance on Pending or Approved (§7.4)** — a negative check, but the whole point of the decision. Click through both and confirm there's nothing to click.

**Transition settings:** Toast enter → Smart Animate from top-right, `--duration-moderate` + `--ease-enter`. Review Note appear → Dissolve, `--duration-default` — it's persistent context, not an event; don't animate it like a toast.

---

## Phase 6 — Cross-cutting prototype mechanics ✅ DONE (2026-07-17)

- [x] **Login → routing:** ✅ Done with **Figma variables + conditional logic**, not one-link-per-role. `auth/role` (STRING, cycled by clicking the role field) + `auth/role-index` (FLOAT). Log In runs 5 independent `IF role == X → NAVIGATE` blocks → Admin `109:2` / HOD `383:10124` / Faculty `127:68` / Lab Coordinator `189:226` / Student `128:149`. **Only possible because all shells now live on one page** (the three per-role pages were merged — see Wiring status). ⚠️ The role **cycles** on click (Admin→HOD→Faculty→LabCo→Student→Admin) because the login screen has no real dropdown menu — a prototyping shortcut, flag at review (Phase 8).
- [x] **Login error path:** ✅ `Login — error` reachable as an alt flow start; its Log In → Setup Overview (retry succeeds). No lockout / forgot-password wired — their absence is the design, left absent.
- [x] **Status Pill consistency:** ✅ **Verified by script across all 42 pill instances.** Every lifecycle screen matches: No timetable yet → Draft → Pending HOD Approval → Approved → Published, and the confirmation modals correctly hold their pre-action state (Publish confirm = "Approved", Republish/Delete confirm = "Published", Send-for-Approval = "Draft"). HOD queue screens correctly **hide** the pill (`visible=false`, per `COMPONENTS.md` H.2); Approval Detail and My Timetable show it. No stale/mismatched pill found. 🟡 *Minor:* all Setup screens read "Draft", which assumes a draft already exists — technically wrong on the very first setup pass (should be "No timetable yet"), but uniform and defensible if setup edits happen with a draft in hand. Not fixed; flagged.
- [x] **Escape/close consistency:** ✅ Every Dialog and Drawer closes three ways now — Cancel button, **Escape** (`ON_KEY_DOWN` 27), and the corner **✕** (wired v5f; all 7 modal/drawer ✕'s were previously dead). Toasts: Success/Info auto-dismiss 5s + manual ✕; Danger manual ✕ only (never auto-dismisses, per `COMPONENTS.md` C.1). Time-slot pickers close on Escape and Cancel.

---

## Phase 7 — Prototype-wide review pass 🟡 objective checks done; experiential pass needs Present mode

**Verified by script (2026-07-17):**
- [x] **No dead-end frames** — ✅ **zero** across all 52 screens (every screen has ≥1 outbound). Confirmed by inbound/outbound audit, not by eye.
- [x] **No broken links** — ✅ **zero** bad destinations; all 343 NAVIGATE targets resolve to a real frame on the page.
- [x] **Prototype starting frames set** — ✅ **20** flow starting points (6 primary flows + Read-only variants + alt states), each named `▶`/`▷`.
- [x] **Transition durations on-token** *(the objective half of the item below)* — ✅ every transition is **200ms (default) ×276** or **300ms (moderate) ×67** — nothing off the `FOUNDATIONS.md` §6.1 scale. Triggers: 323 click · 12 Escape · 9 hover · 4 timeout.

**Requires a human in Present mode — I cannot drive a Figma prototype:**
- [ ] **Click through each of the six flows as if seeing it for the first time** — note anywhere the next click target isn't obvious. *Structure is sound (no dead-ends/broken links), but "is the next step discoverable?" is a judgement only a click-through makes.*
- [ ] **Do the durations *feel* right at actual speed** — they are all correct on paper (on-token, above), but 300ms can *feel* slow in practice. The 67 moderate-speed transitions (modal/drawer open+close) are the ones to watch. Adjust by feel if any drag.

> **Known limitation:** I built and verified this entirely by script. Structural soundness ≠ "feels right." Phase 7's two open items exist precisely to catch what an audit can't — run Present and note anything that stalls or reads as broken.

---

## Phase 8 — Prep for Prototype Review ✅ DONE (2026-07-17) → **`PROTOTYPE_REVIEW_BRIEF.md`**

The deliverable is the standalone presenter's brief — keep it open beside Present mode. Item status:

- [x] **Flow starting frames named clearly** — ✅ all 20 named `▶ Flow N: …` (6 primary) / `▷ …` (14 variants + alt states). A reviewer finds every entry in Present's flow-picker without guessing.
- [x] **One-line description per flow** — ✅ Brief §1, with a "watch for" column per flow.
- [x] **Presentation order decided** — ✅ Brief §1. Revised from the original 5-flow recommendation to the full 7: **Login → Setup → Manual Edit → HOD Approval → Draft Lifecycle → Publish → Read-Only**. Manual Edit still gets the most time; the pipeline now opens with the role model and closes with the end-consumer view.
- [ ] **Figma prototype link ready to share (Present mode)** — ⏳ **yours to do** — I can't generate a share link. Open the file → Present → copy the URL.
- [x] **Known gaps / simplifications noted** — ✅ Brief §3 (shortcuts to disclose — incl. the role-cycle, the un-gated Publish, the cross-role handoff) and §4 (genuine open gaps). The one worth reading aloud: **type-to-confirm is not enforced** — the Publish button is directly clickable, looser than this checklist assumed.

> Only one item can't be done by me — the share link — because it requires Present mode I can't drive. Everything else is prepped in the brief.

---

## What Claude Design Review will actually be checking (so you know what to prepare for)

When you bring this to Prototype Review, expect a walk-through against:
- `INTERACTION_DECISIONS.md` — does the severity model behave as specified (Blocking truly blocks, Warning allows override, Informational doesn't gate)?
- `PATTERNS.md` — does copy match the templates (no "Oops," consequence-first phrasing, Request Changes not Reject)?
- `ACCESSIBILITY.md` — can the flow be operated via keyboard alone in principle (even if Figma prototypes don't test this directly, the design should visibly support it — visible focus states, logical tab order implied by layout)?
- `FOUNDATIONS.md` — do transition timings roughly match the motion tokens?

Nothing here should surprise you — it's the same seven documents, just checked against motion and interaction instead of static layout.

---

## Open decisions that affect wiring

1. ✅ **Request Changes — resolved 2026-07-17: Confirmation Dialog.** Rebuilt as a Confirmation Dialog (Reversible, 400px) with §6.2's copy verbatim and a **Primary** confirm. The old Dialog instance `201:401` is deleted.
2. ✅ **RESOLVED 2026-07-17 — the D.3 / PATTERNS Confirmation Dialog contradiction is closed.** Prakash approved the **three-way split**: `Reversible` (info-500 circle + Primary) / `Destructive` (warning-500 triangle + Destructive) / `Irreversible` (danger + type-to-confirm). Both docs are updated; the recommended fix below was taken as written. Nothing left to decide.
3. 🟡 **Is the empty Approvals list reachable?** `INTERACTION_DECISIONS.md` §4.2 says Approvals is *"shown only when non-empty"*, but `FIGMA_BUILD_CHECKLIST.md` Phase 6 and `PATTERNS.md` §5.1 both specify the empty state. **Now settled in the prototype's favour:** the live queue drains to `304:519` when the last item is approved, so the empty screen is genuinely reachable rather than a static state. The nav item's badge hides at 0 (`queue-has-items`), which is the closest the build gets to §4.2's "hidden when empty".
4. ✅ **RESOLVED 2026-07-17 — the HOD shell's status pill is a real `TopbarStatus` instance** (done in v4n). No longer a hand-built placeholder; it can be driven by `setProperties`.

---

## Wiring status (2026-07-17)

**Approach: Figma variables + conditional actions**, chosen by Prakash over duplicating a screen per state. State lives in a dedicated **`Prototype State`** variable collection, deliberately separate from `Tokens`.

| Page | Screens | Links | Flow starts | Dead ends |
|---|---|---|---|---|
| 🖥 Admin Screens `34:6` | 39 | **304** | 5 flows + 7 alt states | **0** |
| 📋 HOD Screens `34:7` | 5 | 22 | 1 flow | **0** |
| Component sets | — | 22 | — | Interactive Components |

- ✅ **Phase 0** — Interactive Components on Button, Icon Button, Input, Checkbox, Switch. Transitions carry the exact `FOUNDATIONS.md` §6 cubic-beziers.
- ✅ **Phase 1** — Setup: 8 category rows (Blocked row deliberately inert), Add Single Record, Bulk Import Steps 1→4 with Back/Cancel.
- ✅ **Phase 2** — Manual Edit: 6 grid cells → drawer, time-slot picker, Save/Cancel. **Lunch column deliberately inert.**
- ✅ **Phase 3** — HOD: live variable-driven queue that genuinely drains 3 → 2 → 1 → empty.
- ✅ **Phase 4** — Publish: Approved → confirmation → Published, plus Republish and Delete draft.
- ✅ **Phase 5** — Draft lifecycle: generate, regenerate confirmation from all 4 draft variants, send-for-approval, generation gating.
- ⚠️ **Phase 6** — Login routes to **Admin only** (see the blocker below). Escape closes every dialog on both pages.

### 🔴 Blocker — role-based login routing is impossible as the file is organised

Figma prototype links are **page-scoped**, and the three shells live on three pages (Admin `34:6`, HOD `34:7`, Read-Only `34:8`). `Login — shared` therefore **cannot reach the HOD or Read-Only shells at all**. Phase 6's *"role dropdown selection determines which shell the Log In button navigates to"* cannot be built without **co-locating one entry screen per role on a single page**. Log In currently goes to `109:2` (Admin Setup Overview).

The same limit breaks the Flow 3 → Flow 5 hand-off: `Admin — Timetable Draft (changes requested)` is the payoff of HOD's Request Changes, but it lives on a different page, so it's an `▷ Alt state:` entry rather than a click-through.

### 🟡 Build gaps found while wiring

- **The danger toast on `Admin — Timetable Pending Approval (generation blocked)` has no close affordance.** `COMPONENTS.md` C.1 says danger toasts **never auto-dismiss** — so it is permanently stuck. Escape is wired as a stopgap; it needs a real X.
- **`Admin — Setup Faculty` has no Import button** — only "Add faculty" — though Phase 1 above explicitly calls for it. Import is wired from **Setup Subjects** instead.
- **Bulk Import Steps 1–4: the hidden Dialog footer buttons all read "Send for approval"** — the Dialog component's default text leaking. Harmless while `Show footer=false`, wrong the moment it isn't.
- **Most Admin actions are hand-built frames, not Button instances** (Generate, Regenerate, Send for approval, Publish, Try again, Import, Add faculty, drawer Save/Cancel, stepper Back/Continue, Log In). They navigate, but get **no hover** from Phase 0 — every instance-level state benefit is lost on exactly the controls the demo clicks most.

---

## Screens this checklist depends on — build status (2026-07-17)

| Screen | Status |
|---|---|
| `Login — shared (all 5 roles)` + `Login — error` | ✅ built 2026-07-17 |
| `HOD — Approvals list (empty)` / `(1 pending)` / `Approved (confirmation)` | ✅ built 2026-07-17 |
| `Admin — Setup Faculty` | ✅ built 2026-07-17 (was only a demo on the Shells page) |
| `Admin — Bulk Import · Steps 1–4` (Dialog `xl`) | ✅ built 2026-07-17 — `COMPONENTS.md` D.1 satisfied |
| Confirmation Dialog footer → Button instances | ✅ done 2026-07-17 — unblocks Phase 4's disabled→enabled swap |
| Empty State `State=Waiting` variant | ✅ added 2026-07-17 — `PATTERNS.md` §5.1's third sub-pattern had no variant |
| `Admin — Regenerate confirmation` | ✅ built 2026-07-17 — `PATTERNS.md` §6.3, Destructive variant |
| **Overlay screens wrapped into single frames** | ✅ done 2026-07-17 — 23 nodes → 15 composite frames; prototype is now wireable |
