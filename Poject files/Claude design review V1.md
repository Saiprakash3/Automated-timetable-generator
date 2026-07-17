# Claude Design Review V1 — Verified + Full Build Record

**Project:** Automated Timetable Generator — MVGR College of Engineering
**Figma file key:** `e1mriObARklCYTkiV5vaVa` ("Automated-timetable-generator")
**Doc status:** **v4** — the original review (V1, 2026-07-16) was verified line-by-line against the source docs and the live Figma file (v2). v3 recorded the pass that actioned all 4 validated findings. **v4 records the Draft-lifecycle build pass** against the 2026-07-16 doc update (`INTERACTION_DECISIONS.md` §7, `PATTERNS.md` §8, `DOMAIN_COMPONENTS.md` §14, `USER_FLOWS.md` F-02/F-04, and the 🆕 items in `FIGMA_BUILD_CHECKLIST.md`).
**Last updated:** 2026-07-16
**Screenshots:** `./Screenshots/` (12 PNGs — see §10; **not re-exported since v2** — now two passes stale)

---

## 0. Executive summary

The Figma build is **complete across all 10 phases** of `Design System/FIGMA_BUILD_CHECKLIST.md`: Foundations → generic components → 3 shells → domain components → screens for all roles (Admin/HOD/Read-Only) covering flows F-01→F-08 → cross-cutting states → verification → handoff.

The V1 review was thorough and produced **4 genuinely valuable findings**. However **7 of its claims were factually incorrect** when checked against the source docs and the live file — including its stated #1 top-priority item. Those corrections are in §1. **Do not action the items in §1.**

**v3 (this pass): all 4 validated findings are now done** — see §2 for status and §3.9 for the build record. Two of them turned out differently than the review framed them, and the work surfaced three new doc/spec gaps:

- **Tabular figures cannot be done in Figma at all** — the Plugin API's `openTypeFeatures` is read-only (proven, §9). The review also pointed at the wrong surface: in the desktop grid, times are horizontal column headers where tabular figures are a no-op. The **real** defect was a ragged subject column on the mobile day-list, now fixed a better way (fixed-width time column — font- and locale-independent).
- **"Convert 2 modals to Dialog instances" was impossible as written** — `Dialog 74:2` had **zero component properties** and hardcoded Send-for-approval content, so nothing could instance it. The Dialog had to be rebuilt into a real parameterised component first. Doing so exposed that it was **520px wide, matching none of the four sizes `COMPONENTS.md` D.1 documents**, and that it **re-drew its own footer buttons** instead of instancing Button — the same defect the review flagged for modals, one level down.
- **`Input / Textarea` was documented but never built** (`COMPONENTS.md` B.1), and two modals specify a textarea (`PATTERNS.md` §6.1, §6.2). Built now — the modals couldn't be done properly without it.
- 🔴 **New blocking doc contradiction found** — `PATTERNS.md` §6.1 vs `USER_FLOWS.md` F-04 disagree on whether submitting for approval locks the timetable from edits. **Needs Prakash** (§7). → ✅ **RESOLVED by the 2026-07-16 doc update — see v4 below.**

**v4 (Draft-lifecycle pass): all 5 🆕 checklist items are done** — see §3.10. The pass also resolved the v3 blocker and surfaced four defects the checklist didn't ask about:

- ✅ **The v3 🔴 blocker is answered.** `USER_FLOWS.md:241` now states the lock applies *"from the moment it is submitted for approval… **not from the point of approval**"*, F-02 step 8 says *"locks immediately"*, and `PATTERNS.md` §4.1 lists Pending as *"Read-only + locked banner"*. The built Dialog's *"You can keep editing until they respond"* was therefore **wrong and is now corrected** to §6.1's copy.
- 🔴 **`DOMAIN_COMPONENTS.md` §14's claim that the Approved Review Note variant was "confirmed" and built was false.** The Approved screen carried that exact copy, but **hand-drawn — not a component instance**. The variant did not exist. Built, and the screen retrofitted onto it.
- 🔴 **The Confirmation Dialog's Reversible variant contradicted its own spec.** `PATTERNS.md` §1.1 requires a *warning triangle in `--warning-500`* + a **Destructive** confirm; as built it was an **info circle** with a **primary-blue** confirm — i.e. not a destructive dialog at all. It had **zero instances**, so it was fixed rather than worked around. `COMPONENTS.md` D.3's third variant (**Publish**) is still unbuilt — Irreversible absorbed the type-to-confirm.
- 🔴 **§14's `-500` accent rule is not achievable for the Approved variant** — `success/500` on `success/100` measures **2.05:1**, below `ACCESSIBILITY.md`'s 3:1 floor for meaning-carrying icons. warning/500 (3.58) and danger/500 (3.62) pass. Approved was built at `-700` (5.5:1). **§14 needs a correction** (§7).
- 🟡 **The Edit grid has only 4 days (Mon–Thu); the Read-Only grid has 5.** Same timetable, different week length depending on whether you're editing. It also makes the HOD's *"Friday 2:00 PM"* change request on `182:4501` impossible to act on. Not fixed — `DOMAIN_COMPONENTS.md` §5 says *"Monday through Saturday, typically"*, so **both** grids deviate and the target needs deciding (§7).

---

## 1. Review claims that are INCORRECT (verified — do not action)

| # | V1 claim | Verdict | Evidence |
|---|---|---|---|
| 1 | **"Typography is a two-font system… this reverses the 'Inter only' decision documented in DESIGN_PRINCIPLES.md/FOUNDATIONS.md."** Listed as the review's #1 priority. | ❌ **False** | `DESIGN_PRINCIPLES.md:205-207` — *"**Font decision: confirmed** — **DM Sans** (headings, labels, UI — H1/H2/H3/Label roles) + **Inter** (body content — Body/Body Small roles)… everything here is now fully specified, nothing left open."* `FOUNDATIONS.md` §11 states the same. There is **no "Inter only" decision** anywhere and **no drift**. The build matches spec exactly. **No doc updates needed.** |
| 2 | **"Spacing, radius, and motion aren't implemented as Figma variables."** ("Only two collections exist: Tokens (color) and Harmonized Palette.") | ❌ **False** | The `Tokens` collection holds **204 variables**, not color-only: `space/*` ×16, `radius/*` ×6, `border-width/*` ×3, `duration/*` ×5 (motion), `icon/*` ×5, `container/*` ×5, `breakpoint/*` ×5, `z/*` ×10, typography (`font`×2, `text`×6, `weight`×3, `leading`×3, `tracking`×3), plus 132 colours. All bound; all carry `var(--…)` WEB code syntax for Dev Mode handoff. |
| 3 | **"Only 6 text styles exist; 7 typography roles documented — worth checking what's missing."** | ❌ **Not a gap** | `DESIGN_PRINCIPLES.md:203` — role 7 is **"Mono (optional)… Skip entirely if you don't need to visually distinguish structured data."** `FIGMA_BUILD_CHECKLIST.md:111` — *"Mono (optional — only if you're using it)."* Mono deliberately skipped. **6 styles is correct.** |
| 4 | **"Login Form field labeled 'ID or Email' — confirmed spec is 'ID/roll number'."** | ❌ **False** | `COMPONENTS.md` §G.3 — *"Identifier field (ID / roll number / email — labeled generically, **e.g. \"ID or Email\"**)"*. Built exactly to spec. |
| 5 | **"HOD Shell has no desktop breakpoint — only a 768 tablet test."** | ❌ **Misleading** | `FOUNDATIONS.md` §7.1 — HOD = **1024px (primary)**, 768px (tablet fallback). `COMPONENTS.md` §H.2 — *"desktop-primary, tablet-usable… No mobile layout."* The **1024 shell IS the desktop primary**. Reviewer counted only the secondary size instances. |
| 6 | **"Orphaned 'Harmonized Palette' collection — likely leftover, worth deleting."** | ⚠️ **Real, but NOT from this build** | Collection ID `27:2598` **predates** the first node created by this build (`34:x` / Tokens `35:4`). It pre-existed in the file — likely an earlier colour-plugin run by Prakash. 45 vars (Red/Mustard/Turquoise/Azure/Fuchsia ×100–900). **Unused by the design system. Deleting is Prakash's call** (see §7). |
| 7 | **"Component count mismatch — 21 found, 22 documented."** | ⚠️ **Counting artifact** | `COMPONENTS.md`'s count of 22 **includes the 3 Shells**, which live on the Shells page, not Components — Generic. Generic-only documented = 19. The Generic page holds 23 component nodes (incl. helper sub-components `Select / Menu`, `Skeleton / Loading card`). **Nothing missing.** |

> **Note on "tabular figures":** the review implies TNUM was part of the original typography rationale. It was not — grep across all 8 `Design System/*.md` docs returns **zero** matches for `tabular` / `TNUM`. It is a **new, sound recommendation**, not a spec deviation. Retained as a real task in §6.

---

## 2. Review findings that STAND (validated)

| Severity | Finding | Assessment | v3 status |
|---|---|---|---|
| 🔴 | **No "Admin — Timetable Draft (changes requested)" screen.** HOD's rejection reason has nowhere to land; a returned draft is indistinguishable from a fresh one. | **The best finding in the review.** Real product gap. HOD's Request-Changes modal correctly reverts to Draft (no separate Rejected status needed — that part is sound), but the reason text is never surfaced to Admin. | ✅ **Done** — screen `182:4501`, via a new **Review Note** component. §3.9.1 |
| 🟡 | **Two modals bypass the shared Dialog component** — Admin "Add Single Record" (`134:2989`) and HOD "Request Changes" are plain FRAMEs, not Dialog instances. | **Correct.** Both were built inline. They won't inherit Dialog fixes (backdrop dismiss, Esc, focus trap). Two occurrences = a pattern worth fixing. | ✅ **Done, but only after rebuilding Dialog** — it had no component properties, so nothing could instance it. All **3** modals are now instances. §3.9.2 |
| 🟡 | **No dedicated Lab Coordinator read-only screen.** | **Correct.** `FIGMA_BUILD_CHECKLIST.md` Phase 7.1 lists *"Lab Coordinator My Timetable (own coordination schedule)"*. Not built. Note the real design question: coordination work explicitly does **not** count toward teaching load, so framing may differ ("coordination sessions" vs "classes"). | ✅ **Done** — screen `189:226` (Mr. K. Rao). §3.9.3 |
| 🟡 | **Tabular figures (TNUM) not enabled on the Timetable Grid.** | ⚠️ **Right instinct, wrong surface — and impossible in Figma.** In the desktop grid, times are *horizontal column headers in separate fixed-width columns*; tabular figures align digits **vertically**, so they do nothing there. The genuine defect was on the **Read-Only mobile day-list**, where times stack. And the Plugin API cannot set OpenType features at all (read-only property — §9). | ✅ **Root defect fixed a better way** — fixed-width time column. §3.9.4 |
| 🟡 | **"Elective" vs "Cross-section elective" is an undocumented cell type.** | **Genuine doc contradiction — needs Prakash.** Built per `DOMAIN_COMPONENTS.md` §7, which explicitly lists **both** (`Elective` = warning-100 + basket indicator; `Cross-section elective` = same + basket name). If the confirmed lecture-type model only has cross-section, the docs disagree with each other. Affects generation/conflict logic. See §7. |
| 🟡 | **Cell Edit Drawer has no `Conflict-informational` state.** | **Defensible as built.** `INTERACTION_DECISIONS.md` §1.3 — Informational is *"Shown, not gated. No accept/reject action attached."* `DOMAIN_COMPONENTS.md` §10 lists only Default / Conflict-blocked / Conflict-warning / Saving. No gating state needed. Worth a one-line confirm. |
| ✅ | Conflict severity → 3 hue families; Workflow status → Published=Primary; "Request changes reverts to Draft"; no Rejected status. | **Implementation already matches.** These just need logging in `DECISION_LOG.md` as final. See §4. |

---

## 3. Completed work — full build record

### 3.1 File structure (Phase 0)
10 named pages: 📋 Cover `0:1` · 📚 Foundations `34:2` · 🧩 Components — Generic `34:3` · 🎯 Components — Domain `34:4` · 🖼 Shells `34:5` · 🖥 Admin Screens `34:6` · 📋 HOD Screens `34:7` · 📱 Read-Only Screens `34:8` · 🚧 WIP `34:9` · 📦 Archive `34:10`.

### 3.2 Foundations (Phase 1)
- **`Tokens` collection** `VariableCollectionId:35:4`, mode "Light" `35:1` — **204 variables**, all scoped, all with WEB code syntax `var(--…)`:
  - **77 primitive colours** — 7 ramps × 11 stops (neutral, primary, teal, success, warning, danger, info), generated from the confirmed seeds via HSL→RGB.
  - **55 semantic aliases** — surfaces, interactive, borders, solid feedback, light feedback, status pills, conflict triples, `semantic/backdrop`. All alias primitives (palette shift propagates automatically).
  - **Non-colour** — `space` 16, `radius` 6, `border-width` 3, `duration` 5, `icon` 5, `container` 5, `breakpoint` 5, `z` 10.
  - **Typography** — `font` 2 (STRING), `text` 6, `weight` 3, `leading` 3, `tracking` 3.
- **6 text styles:** H1 — Page Title (DM Sans SemiBold 32/125%/-1%), H2 — Section Header (DM Sans SemiBold 24), H3 — Subsection (DM Sans Medium 20), Body (Inter Regular 16/150%), Body Small (Inter Regular 14), Label (DM Sans Medium 12). *(Mono intentionally skipped — optional per spec.)*
- **6 effect styles:** Shadow 0–4 + Focus Ring (double-ring: white spread-2 + primary spread-4).
- **Foundations proof sheet** master frame `40:2` — 7 colour ramps w/ hex, semantic pairing chips, type specimens, spacing bars, radii, elevation, icon scale, motion tables.
- **Cover page** `48:2` — now the handoff hub (§3.8).

### 3.3 Generic components (Phase 2) — page `34:3`, 24 nodes, single clean column (reflowed in v3, 20 sections)
Button `51:2` (5 variants × 6 states = 30) · Icon Button `52:62` (3×5) · Badge `53:32` (3 styles × 5 semantics) · Input `54:48` (8 states) · **`Input / Textarea` `204:30` (4 states — NEW in v3)** · Checkbox `56:21` · Radio `56:35` · Switch `56:52` · Card `57:17` (5) · Select `58:22` + Select/Menu `67:2` · Table `67:3` · Toast `61:45` (4) · Tooltip `67:6` · Breadcrumb `67:13` · Drawer `67:16` · Empty State `71:2` (3) · **Tabs `71:3` (Variant ×3 × State [Default/Focus] = 6)** · Confirmation Dialog `71:4` (Reversible/Irreversible) · Login Form `71:5` (Default/Error) · Progress `72:14` (Mode×Size=6) · Skeleton `72:18` (3 shapes) · Skeleton/Loading card `72:19` · **Dialog `196:6038` (Size = sm/default/lg/xl + Title/Description/Show description/Content SLOT — rebuilt in v3; `74:2` is now its `Size=default` variant)**.

### 3.4 Shells (Phase 3) — page `34:5`
- **Admin Shell `77:2`** (1440×900) — 240px sidebar (logo, Setup expanded w/ all 9 sub-items + completion-state icons, Timetable, user info), top bar (breadcrumb, **`TopbarStatus`** Status Pill instance `111:565`, user menu), **Content SLOT**.
- **HOD Shell `81:169`** (1024×768 = desktop primary) — minimal top bar (logo, Approvals + count badge, My Timetable, status pill, user menu), **no sidebar**, Content SLOT.
- **Read-Only Shell `82:169`** (375×812 mobile-first) — 48px top bar, greeting, "Published — as of …" timestamp, Content SLOT.
- **Demos** (slot filled w/ real component instances): Admin Faculty `80:2` · HOD Approvals `83:169` · Read-Only timetable `85:242`.
- **Responsive instances:** Admin 1280 + 1920, HOD 768, Read-Only 768 + 1280.

### 3.5 Domain components (Phase 4) — page `34:4`, 17 nodes
Status Pill `90:57` (5 states × 2 sizes) · Timestamp Caption `91:4` (TEXT property) · Conflict Badge — Inline `91:42` / Overlay `93:25` / Stack (3+) `93:26` / Summary `94:40` · Setup Checklist Row `95:54` (Empty/Partial/Complete/Blocked) · Setup Progress Summary `96:39` (arc ring via ellipse `arcData`) · Timetable Cell — Read-Only `97:39` (5 types) / Edit `98:36` (5 states) · Timetable Grid — Read-Only `99:10` / Edit `101:10` · Cell Edit Drawer `103:122` (Default/Conflict-blocked/Conflict-warning) · Post-Generation Summary Panel `104:10` · Bulk Import Stepper `105:246` (4 steps) · View Controls `106:82` (Full/Compact/Mobile) · **Review Note `179:46` (Type = Admin note / Changes requested; Title/Body/Meta/Show meta — NEW in v3)**.

### 3.6 Screens (Phases 5–7)
**Admin `34:6`** — Setup Overview `109:2` · **all 9 setup category screens** (Faculty demo `80:2`, Subjects `133:2616` = canonical pattern, + Lab Coordinators, Labs, Rooms, Sections, Time Slot Grid, Subject–Faculty Mapping, Elective Baskets at x=8000 column) · Add Single Record modal `134:2771` (**dialog `204:6063` — now a Dialog instance**; old FRAME `134:2989` deleted) · Elective Basket config `135:2926` (F-06) · **Timetable lifecycle:** No-timetable `112:220` → Generating `129:1196` → Generation Failed `129:1315` → Draft post-gen `120:328` → Cell Edit Drawer open `131:1851` (+drawer `131:2082`) → Send for Approval `122:890` (**dialog `122:1204`**) → Pending `130:1410` → Approved `130:1647` → **Draft (changes requested) `182:4501` — NEW in v3** → Publish confirm `132:2112` (+dlg `132:2359`) → Published `121:638` → Republish confirm `132:2376` (+dlg `132:2647`).

**HOD `34:7`** — Approvals list `124:75` · Approval Detail `124:194` (**Review Note instance `206:6082`** + Read-Only Grid instance + Request-changes/Approve) · **Request Changes modal `201:401` — now a Dialog instance** (backdrop + `Input / Textarea` reason, Destructive primary, `PATTERNS.md` §6.2 copy).

**Read-Only `34:8`** — Faculty My Timetable `127:68` · No assignments `127:183` · Session detail `127:228` · Student My Timetable `128:149` (elective slot, amber accent) · **Lab Coordinator My Timetable `189:226` (NEW in v3)**.

### 3.7 Cross-cutting states (Phase 8)
Initial-load Skeleton `136:3127` · Offline/degraded `136:3300` (F-03 "live conflict checking paused"). Others already existed: No-timetable, Generation Failed, HOD empty, Read-only empty, Toast (4 variants), Empty State (3), Button loading, Skeleton.

### 3.8 Verification performed (Phase 9) + Handoff (Phase 10)
- **0 unbound/hardcoded white fills** — swept on **every** page (repeated automated sweep; final = 0).
- **Contrast** — every bg/fg pair pre-verified WCAG AA per `FOUNDATIONS.md` §10.3.
- **Focus states — 9 of 9** interactive component sets (Button, Icon Button, Input, Select, Checkbox, Radio, Switch, Card, **Tabs**). *Tabs Focus was the one audit finding and was fixed post-review.*
- **Meaning-not-colour** — Status Pill (5 states) and Conflict Badge (3 severities) each pair a distinct icon **and** label.
- **Naming** — matches `COMPONENTS.md` / `DOMAIN_COMPONENTS.md`.
- **Cover `48:2`** extended into a handoff hub: build inventory, verification summary, flow coverage F-01→F-08, deviations, changelog, z-index reference, source-doc index.

### 3.9 v3 follow-up pass — actioning the 4 validated findings

#### 3.9.1 Admin — Timetable Draft (changes requested) 🔴
- **New domain component: `Review Note` `179:46`** (page `34:4`) — Variant `Type` = `Admin note` | `Changes requested`; props `Title` / `Body` / `Meta` (TEXT) + `Show meta` (BOOLEAN). Left-accent 4px + icon + label, matching the established severity pattern (Conflict Badge — Summary uses `strokeLeftWeight: 4`). Two example instances (`181:28`, `181:37`) document each Type, following the `Timestamp Caption` convention on that page.
  - Componentising also **fixed two off-token values** in the callout it replaces: a 3px accent (`border-width` tokens are 1/2/4) and 14px padding (not a `space` step). Now `border-width/4` + `space/4`.
- **New screen `182:4501`** — "Admin — Timetable Draft (changes requested)" (page `34:6`, x=6400 y=2000). Cloned from Draft post-gen `120:328`, then:
  - **Review Note (Changes requested)** inserted directly under the header, carrying the HOD's reason **verbatim** from the Request Changes modal, attributed + timestamped.
  - **Post-Generation Summary Panel removed** — `DOMAIN_COMPONENTS.md` §11 says it is *"shown once after a fresh generation"*; a returned draft is not one, and Admin already dismissed it before submitting. Content drops 920px → 553px and now fits the 844px slot without scrolling.
  - Primary CTA relabelled **"Resubmit for approval"** ("resubmit" is already product vocabulary — the HOD modal says *"before resubmitting"*).
  - Status pill stays **Draft** (request-changes reverts to Draft; no Rejected status — confirmed correct).
- **HOD Approval Detail `124:194` retrofitted** — its hand-built "Admin note" FRAME replaced with a `Review Note` instance (`206:6082`, `Show meta` = false since the header already reads "Submitted by Sai Prakash · 2 days ago"). Both directions of the approval hand-off now come from one component.

#### 3.9.2 All 3 modals → real Dialog instances 🟡
**The review's fix was not possible as written.** `Dialog 74:2` had **`componentPropertyDefinitions = {}`** — no Title, no Description, no content slot — and hardcoded "Send for approval" content with a single fixed field. Nothing could instance it for other uses. So it was rebuilt:

- **`Dialog` is now COMPONENT_SET `196:6038`** with `Size` = **sm 400 / default 560 / lg 720 / xl 960** — the four sizes `COMPONENTS.md` D.1 documents. **It was 520px, which matched none of them** (a spec deviation the review missed). `74:2` survives as the `Size=default` variant, so existing links held.
- Props: `Title` (TEXT), `Description` (TEXT), `Show description` (BOOLEAN), **`Content` (SLOT)**.
- **Footer now instances the Button component** (`Secondary` + `Primary`) instead of re-drawing button-shaped frames — the same defect the review flagged for modals, one level down.
- **New component: `Input / Textarea` `204:30`** (4 states: Default / Focus / Filled / Error). `COMPONENTS.md` B.1 documents *"Variants: Text (default), Number, Date/Time, **Textarea (multi-line)**"* and only Text existed. Both `PATTERNS.md` §6.1 (Note to HOD) and §6.2 (Reason) specify a textarea, so the modals could not be built correctly without it. Proven necessary: an Input instance **cannot** be made textarea-tall — `resize()` reverts and `minHeight` throws *"This property cannot be overridden in an instance"*.
- Rebuilt as Dialog instances, each with Input / Select / Textarea **instances** in the slot (no re-drawn fields):
  - **Send for approval `122:1204`** — slot: `Input / Textarea` "Note to HOD (optional)".
  - **Add Single Record `204:6063`** — Title "Add subject", description hidden; slot: Input (Subject name), Input row (Code + Credits), Select (Type), Select (Default faculty). Old FRAME `134:2989` deleted.
  - **Request Changes `201:401`** — **copy corrected to `PATTERNS.md` §6.2 verbatim** ("Request changes to this timetable?" / "This will return the timetable to Draft state for Admin to revise. Please explain what needs to change." / "Reason for changes (required)"); primary Button set to `Variant=Destructive`. Old FRAME `125:427` deleted.
- **Generic page `34:3` reflowed** into one clean column (20 sections) — the rebuilt Dialog grew 520×256 → 1008×1096 and had been sitting off-column at x=1060; `Input / Textarea` also needed a section beside Input. 0 overlaps.

#### 3.9.3 Read-Only — Lab Coordinator My Timetable 🟡
- **New screen `189:226`** (page `34:8`, x=1760), cloned from Faculty My Timetable so structure stays identical (Principle 5).
- **Mr. K. Rao** — chosen because he already existed in the file: Setup › Lab Coordinators lists him (Computer Science, max 4 days/wk, coordinates **Networks Lab + DS Lab**), and Session detail `127:228` already read *"Coordinator: Mr. Rao"*. His two sessions **mirror the same published sessions** the Faculty screen shows, so the two read-only screens now describe one timetable from two roles — exactly what F-08 describes.
- **Framing** (the review's real question): scope line *"Labs you're coordinating — not counted toward teaching load."* (`USER_FLOWS.md:37`). Meta reads "III CSE A · Lab 205 · **with Dr. Sharma**" — the paired teaching faculty is the coordinator-specific fact (F-07).
- **"Lab" badge dropped on this screen** — a coordinator only ever has labs, so a badge reading "Lab" on every card carries zero information, and the teal accent already encodes the type. Removing it freed exactly the width the "with Dr. X" pairing needed (info column 205px → 253px; the meta had been clipping). Meaning-not-colour still holds: there is no second type to distinguish.
- **Sample-data contradiction fixed:** Setup › Labs defines **DS Lab → Room 205** and **Networks Lab → Room 204**, but Faculty `127:68` and Session detail `127:228` both placed the DS Lab session in "Lab 204" — i.e. inside the Networks Lab's room. Corrected both to **Lab 205**. All screens describing that session now agree.

#### 3.9.4 Ragged time column (the TNUM finding) 🟡
- **Not doable in Figma** — see §9. `openTypeFeatures` is read-only; no setter exists; neither DM Sans nor Inter ships a "Tabular" style to swap to.
- **Root defect located and measured:** on the Read-Only day-list the `time` column was **HUG**, and DM Sans's proportional figures made it 45px ("09:00") / 41px ("10:00") / 39px ("12:00") — so the subject column started at **x = 89 / 85 / 83**, visibly ragged.
- **Fixed:** `time` set to **FIXED 48px** on all 7 session cards (Faculty + Student). Subjects now align at **x = 92**. This is strictly more robust than TNUM — independent of font, locale ("9:00 AM" vs "09:00") and figure style.
- **Carried to Frontend Documentation:** also set `font-variant-numeric: tabular-nums` on time elements in CSS, where it *is* expressible.

**Verification (v3):** re-swept every touched page — **0 unbound white fills** (`34:3`, `34:4`, `34:6`, `34:7`, `34:8`), **0 top-level overlaps** on `34:3` / `34:4`, both retired modal FRAMEs confirmed deleted, WIP page clean.

---

### 3.10 v4 pass — Draft lifecycle (2026-07-16 doc update)

Driven by the 🆕 items in `FIGMA_BUILD_CHECKLIST.md` §4.7 / §5.3 / §9.3, and by `INTERACTION_DECISIONS.md` §7 + `PATTERNS.md` §8 (both Category A, confirmed by Prakash).

#### 3.10.1 Review Note — two new variants (`179:46`)

The set went from 2 variants to **4**: `Admin note` · `Changes requested` · **`Final Draft Warning`** (`221:44`) · **`Approved`** (`221:6082`).

- **Final Draft Warning** — `semantic/danger-bg` bg, `semantic/danger-fg` title, **`danger/500`** 4px left accent + icon (3.62:1 ✓). Lucide **warning triangle** per §14. The **Meta node is deleted outright**, not hidden — §14 says *"Attribution: [none — system-generated]"*, and Figma has no per-variant default for the shared `Show meta` boolean, so removing the node is the only way to guarantee no attribution on this variant.
- **Approved** — `semantic/success-bg` bg, `semantic/success-fg` title, Lucide **check-circle**. Accent/icon at **`success/700`** (`semantic/success-solid`, 5.5:1) **not** §14's `success/500`, which measures **2.05:1** and fails `ACCESSIBILITY.md`'s 3:1 floor. Meta kept and overridable (the date varies).
- On both new variants **Title and Body are unbound from the shared TEXT properties** and set literally, because their copy is fixed system copy. Figma has no per-variant text defaults (§9), so leaving them bound would have made both variants render the *Changes requested* default. Meta stays bound on Approved only. This is a better answer than v3's "document with example instances".

#### 3.10.2 Admin — Timetable Draft (3rd draft — final warning) `222:6078`

Page `34:6` @ 6400,3000 — directly under the changes-requested Draft. Clone of `182:4501` with the Review Note switched to `Final Draft Warning`; subtitle now **"III-CSE-A · Draft 3 · Generated Mar 18, 9:05 AM"**. Satisfies §14's subsumption rule (*"show only the Final Draft Warning"*) structurally — it is the same single instance, so both can never render at once.

#### 3.10.3 Delete draft — CTA + confirmation

- **Published `121:638`** — added a **`Delete draft`** Button instance (Ghost, `227:10`) into the header actions, placed **leftmost** so the destructive cleanup sits away from the primary Republish. It's a real Button instance (69×38 matches the hand-built Export/Republish exactly).
- **`Admin — Delete draft confirmation` `228:6334`** (@3200,3000) + backdrop `228:6607` + dialog `228:6321` — Confirmation Dialog **Reversible** instance, `PATTERNS.md` §8.3 copy verbatim: *"Delete this draft?" / "This will permanently remove Draft 2 from the timetable history. This cannot be undone."* / [Cancel] [Delete draft].
- **Confirmation Dialog Reversible `67:14` fixed to match `PATTERNS.md` §1.1** — icon info-circle → **warning triangle in `warning/500`**; confirm button `semantic/primary` → **`semantic/destructive`** + `destructive-foreground`. It had **0 instances**, so nothing broke. Without this the dialog would have shipped a *blue* "Delete draft" button.

#### 3.10.4 Delete drafts at publish time

`INTERACTION_DECISIONS.md` §7.4 / `PATTERNS.md` §8.3 also put deletion **at publish time**. Instances can't take new children, so the Confirmation Dialog set got a **`Content` SLOT** (`Content#230:0`) on the Irreversible variant — mirroring the Dialog pattern from v3 — rather than hard-coding timetable copy into a generic component. Both **Publish `132:2359`** and **Republish `132:2647`** now carry a Checkbox instance: *"Clean up drafts before making this live"* + helper *"Deletes Draft 1 and Draft 2 from the timetable history."*, sitting between the description and the type-to-confirm gate.

#### 3.10.5 Generation gating (§7.2 / §8.1)

- **Neither Pending nor Approved had a Generate action at all**, so "visually disabled" was unrepresentable. Both now carry a **`Regenerate` Button instance in `State=Disabled`** (`235:10`, `235:12`) — label matched to the Draft screen's existing Regenerate. Pending's header was a bare vertical block and was restructured into the same `hl` + `ha` SPACE_BETWEEN row the other screens use.
- **`Admin — Timetable Pending Approval (generation blocked)` `236:5334`** (@4800,4000) + Toast `236:10` — the **first Toast instance in the file**. Danger variant, §8.1 copy split across the Toast's title/body. Danger toasts never auto-dismiss (`COMPONENTS.md` C.1), so it is placed **below the header actions row** rather than at the exact top-right corner, where it would have permanently covered the very Regenerate button it explains — the same collision noted in v3 §6.

#### 3.10.6 Approved screen retrofitted onto the component

`130:1647` and its clone `132:2112` had a **hand-drawn** green callout carrying §14's exact Approved copy. Both now instance **Review Note `Approved`** (`239:44`, `239:52`) with Meta = *"Approved by HOD · Mar 16, 10:15 AM"*. The duplicate header subtitle was removed, since the note now carries the attribution.

#### 3.10.7 Send-for-approval copy corrected

Dialog set `196:6038` default + instance `122:1204`: *"This sends the current draft to the HOD for review. You can keep editing until they respond."* → **"This will lock the timetable from edits until HOD approves or requests changes."** (`PATTERNS.md` §6.1, now unambiguous — see §0). Irreversible's icon also moved `semantic/warning-fg` → **`danger/500`** per §1.2, so the two confirmation tiers are now distinguishable by icon colour rather than only by wording.

**Verification (v4):** Phase 9.3 draft-lifecycle checklist walked node-by-node — Generate disabled on Pending **and** Approved ✓; Final Draft Warning on the 3rd-draft screen ✓; Delete CTA on Published **and** at publish time ✓; delete dialog is the Reversible variant with §8.3 copy ✓; **no delete affordance on Pending or Approved** ✓. Re-swept `34:3` / `34:4` / `34:6`: **0 unbound white fills, 0 overlaps**, 28 Admin screens. The Generic page stack was reflowed (+52px below the Confirmation Dialog set) after the slot made the Irreversible variant taller.

---

### 3.11 v4a — Friday row added to the Edit grid (Prakash-reported)

**Prakash reported Friday missing from "a few timetable grids". Correct, and v4 deferred it wrongly** — it was flagged in §7.3 and spun out as a background task on the grounds that Mon–Fri vs Mon–Sat needed deciding. That reasoning was wrong: the Edit/Read-Only mismatch was a defect regardless of which target is chosen, and every built screen already used Mon–Fri.

**Root cause:** `Timetable Grid — Edit` `101:10` had only Mon–Thu; `Timetable Grid — Read-Only` `99:10` had Mon–Fri. Confirmation that Friday was always intended: the **Post-Generation Summary Panel already lists `Friday · Period 2 · III-CSE-B`** as an unresolved gap — referencing a row that did not exist.

**Fix:** Friday row `250:44` added to `101:10`, mirroring the Read-Only grid so Draft ≡ Published: Algorithms/Rao · Free · Operating Sys./Iyer · **DBMS Lab/Gupta ×2 (teal, 12:00+2:00)** · Free. Grid 357 → **423**. No conflict badges added, so *"3 conflicts remaining"* stays accurate. Domain page reflowed +66px (18 nodes).

**Two non-obvious things this surfaced:**

1. **Cross-component clones don't paint in instances.** The row was first cloned from the Read-Only component (`99:10`) into the Edit component. The data was perfect — identical fills/opacity/visibility to a working row — but `absoluteRenderBounds` returned **NULL** in every instance while the main component rendered fine. `resetOverrides()` did not help. Rebuilding the row from the Edit grid's **own** cells fixed it. Even then the four pre-existing instances kept a stale raster and had to be **replaced with fresh instances**. A brand-new instance rendered correctly throughout — that was the diagnostic that isolated it.
2. **The reported scope was wrong — six screens use the Edit grid, not four.** `122:890` (Send for Approval) and `136:3300` (Offline) were missed on the first pass. `122:890` was doubly broken: its `content` frame was **stale at 920px** (the pre-Friday height), clipping the grid back to exactly 357. It also still carried the **Post-Generation Summary Panel**, which `DOMAIN_COMPONENTS.md` §11 says is *"shown once after a fresh generation"* — by send-for-approval time Admin has already reviewed and edited. Panel removed (same call as v3 §3.9.1); content 920 → **501**; Friday now visible with 311px to spare.

**Sample-copy correction (caused by the fix):** the HOD's reason — *"The **Friday 2:00 PM** elective slot overlaps with a III-CSE-B lab"* — was invented in v3 when there was no Friday row to check it against. With Friday present it pointed at a cell showing **DBMS Lab**, not an elective. Friday 2:00 could not simply be made an elective either: 12:00+2:00 is a **two-period lab**, and splitting it would violate the consecutive-period rule (`INTERACTION_DECISIONS.md` §1.2, conflict #10). Retargeted to **Tuesday 12:00**, a real `ML (Elective)` cell that carries a warning badge and exists in **both** grids. Updated in the Review Note set default (`Body#179:3`), screen `182:4501`, `HOD — Approval Detail`, `HOD — Request Changes (modal)`, and `Request Changes modal 201:401`. Zero "Friday" references remain outside the (now valid) Post-Gen gap list.

**Final audit — Friday across the whole file:** both grid components Mon–Fri ✓ · Admin 13 grids: **12 visible**, 1 below fold · HOD 2 grids ✓ · Read-Only screens are mobile **day-lists** with a Mon–Fri chip selector (single-day view — no week grid, nothing missing) ✓ · Shells page has no grid instances ✓.

**The one remaining:** `120:328` (post-generation) renders 249px of the 423px grid — **Friday and Thursday sit below the 900px fold**. This is not a missing row and **predates the Friday work** (Thursday was already cut). The content legitimately needs 986px in an 812px area: header 58 + **Summary Panel 465** + grid 423. The page scrolls — the panel's own **"Review Grid"** button is that affordance. Options if you want the full week visible in one shot: make that frame ~1100px tall (deviates from the `FOUNDATIONS.md` §7.1 1440×900 viewport), or build the still-missing checklist screen **"Timetable — Draft state, Review and Edit (Edit Grid, no summary panel)"**, which is unbuilt and is exactly where the full grid belongs.

---

### 3.12 v4b — new time-slot model (Prakash, 2026-07-16)

New Category-A spec from Prakash: **60-minute periods with a 12:00–1:00 lunch break**, and labs confined to one side of it. None of this existed in any doc — `DOMAIN_COMPONENTS.md` §5 only said *"time slots (typically 6–8 per day)"* and **lunch was never mentioned**. Now written up as **§5.1** (with the lab rules folded into `INTERACTION_DECISIONS.md` conflict #10).

**What the build actually had:** **50-minute periods.** The drawer said `11:00–11:50`, Session detail said `10:00 – 11:40`, and the grids ran `9:00, 10:00, 11:00, 12:00, 2:00, 3:00` — i.e. 12:00 was a *class* and lunch was implied at 1:00. The Setup › Time Slot Grid was closest to the new spec (it already had `Lunch 12:00–1:00`) but also carried a **10:50–11:00 Break** that isn't in the model, and listed only **Periods 1–4** despite its own subtitle claiming "6 teaching periods/day".

**Changes:**
- **Setup › Time Slot Grid `143:4134`** — rebuilt to 7 rows: P1 9–10, P2 10–11, P3 11–12, **Lunch 12–1 (Break)**, P4 1–2, P5 2–3, P6 3–4. Dropped the 10:50 Break; added the missing P5/P6.
- **Both grids (`99:10`, `101:10`)** — inserted a **non-interactive 72px `--muted` "Lunch" column** between P3 and P4, and relabelled the old `12:00` column to **`1:00`** (Period 4). Grids 968 → **1040** wide. The old P4 data carried over unchanged, so nothing had to be re-authored.
- **Cell Edit Drawer `103:122`** — added the **`Time slot` picker** to all 3 variants. This was a **documented gap**: `USER_FLOWS.md` F-03 step 2 says the panel shows *"subject, faculty, room, section, time slot… Admin can change any of these via dropdowns/pickers"* — only Subject/Faculty/Room existed. (**`Section` is still missing** — see §6.)
- **`Admin — Cell Edit Drawer (time slot picker open)` `281:5799`** (@1600,5000) + menu `281:10` — the picker open, listing **only the 6 teaching periods**. The 12:00–1:00 lunch slot is **absent by construction**, which is the concrete answer to *"do not show 12-1 slot"*.
- **Times normalised to 60 min everywhere** — drawer `11:00–12:00`; Session detail `10:00 – 12:00`; Elective Basket `Friday · 2:00–3:00 PM`; all 9 day-list session cards across Faculty/Student/Lab Coordinator.

**Two things the new model fixed, and one it broke:**

1. ✅ **The Friday lab was illegal under the old data and is now legal.** `DBMS Lab` sat at `12:00` + `2:00`, i.e. straddling the 1:00 lunch — exactly the conflict #10 case. Relabelling P4 to 1:00 puts it at **1:00–3:00 (P4–P5)**, inside the post-lunch block. All three labs now verify clean: Networks 2:00–4:00, DS 10:00–12:00, DBMS 1:00–3:00.
2. ✅ **Monday's gap now lands where the Post-Gen panel says it does** — the panel lists *"Monday · Period 4"*, and the `+ Fill` cell is now in the **1:00 (P4)** column.
3. ⚠️ **Two read-only sessions were sitting inside the new lunch break** — Faculty and Student both had a `12:00–12:50` class. Moved to **13:00–14:00 (P4)**. Any real data will need the same sweep.

**Sample-copy follow-on:** the HOD reason had to move again — the elective it names shifted columns, so *"Tuesday **12:00** PM"* → *"Tuesday **1:00** PM"* (Review Note default + `182:4501` + both HOD screens + `201:401`).

**Regression caught and fixed:** the v4 change to the Dialog set's `Description` default leaked into **`Add Single Record` `204:6063`**, which had no override — it was rendering *"This will lock the timetable from edits until HOD approves or requests changes."* above "Add subject". `Show description` set to false (no description is specified for it anywhere). `Request Changes 201:401` was unaffected — it overrides. **Lesson: changing a component property's default silently rewrites every instance that doesn't override it — audit `.instances` after any `editComponentProperty`.**

**🔴 The extra column broke the HOD view — and exposed a pre-existing bug.** The 7th column pushed the grid to 1040px, but the **HOD shell is 1024px with a 960px content area** (`FOUNDATIONS.md` §7.1), so the grid was clipped and HOD lost the 3:00 column entirely. Checking properly showed **the grid never actually fit HOD**: at 968px it was already 8px over 960 — invisible enough to miss, but wrong. The grid has to fit the *narrowest* shell that renders it, not the Admin one.

**Fix:** columns re-proportioned to **68 (day) + 6×140 (periods) + 48 (lunch) = 956**, which now fits HOD's 960 *and* Admin's 1136 with room to spare. Verified `clipped: false` on all 16 instances across both pages.

**Every instance had to be replaced — twice.** Both the lunch-column insert and the resize left all 16 grid instances holding a **stale raster**: the node data was byte-identical to the component (rows 1040 → 956, cells `68,140,140,140,48,140,140,140`) while the picture still showed the old width, cutting text mid-word. This is the same class of bug as §3.11 — see §9. `resetOverrides()` doesn't help; only replacing the instance does.

### 3.13 v4c — picker states + two defects Prakash reported

**🔴 Conflict icons were breaking out of their cells — caused by the v4b resize.** The Blocking/Warning badges are `layoutPositioning: "ABSOLUTE"` at a **hardcoded `x: 128`**, sized 18px — which gave a 4px inset in a 150px cell. Narrowing cells to 140 left them **6px outside the cell's right edge** on every grid, in every screen. Re-anchored **relative to the cell** (`x = cell.width - badge.width - 4` → 118). Verified 0 escaping across all 14 grid instances.

> **This is a landmine for any future column change.** An absolutely-positioned child does not re-anchor when its parent resizes. If cell widths ever change again, re-run the containment check — comparing each absolute child's `absoluteBoundingBox` against its parent's. The standalone `Timetable Cell — Edit` `98:36` was checked too and is fine (badge inset −4).

**🟡 `Cell Edit Drawer (time slot picker open)` needed frame work.** As first built the menu **overflowed the 560px drawer by 77px and covered the Cancel/Save footer**, and it had inherited the **Conflict-blocked** variant, whose error message competed with the thing the state exists to show. Fixed: switched to **Default**, drawer resized **560 → 680**, menu re-anchored under the field. Menu now sits 361→589 with the footer at 624 — inside the card, covering nothing, and the drawer still fits the 900px screen.

**`Admin — Elective Basket config (time slot picker open)` `292:7392`** (@3200,5000) + menu `292:7381` — the second of the two real slot pickers (F-06: *"Admin picks the time slot the basket will occupy"*). 350px menu anchored under the field, six teaching periods with **12:00–1:00 absent**, Period 5 checked. It overlays the electives list below, which is correct popover behaviour.

**A time slot is a period, not a day+period (Prakash, 2026-07-16).** I'd flagged that the basket picker implied a day×period model (30 combinations, needing either a Day select or a grouped list). Prakash's call: **drop the day**. Slots now read `Period N · H:MM–H:MM` everywhere, so both pickers offer exactly 6 options and read identically. Changed: Elective Basket config value + its picker clone (`Friday · 2:00–3:00 PM` → `Period 5 · 2:00–3:00`), the menu's 6 options, and Setup › Elective Baskets' **TIME SLOT** column (`Friday · 2:00 PM` → `Period 5 · 2:00–3:00`; `Thursday · 3:00 PM` → `Period 6 · 3:00–4:00`). Recorded in `DOMAIN_COMPONENTS.md` §5.1.

> **Day survives only where the UI identifies a specific cell** rather than selecting a slot — the drawer header (`Period 3 · Monday`) and the Post-Gen gap list (`Monday · Period 4 · III-CSE-A`). Verified those are the only day-qualified strings left on `34:6`.
>
> ⚠️ **Worth a second look before Frontend Documentation:** with the day removed, a basket's slot is a period alone, so conflict #12 (*"Elective basket time-slot collision (same year, two baskets)"*) now means **a year can hold at most 6 baskets**, and the generator — not Admin — decides which day a basket lands on. That follows from the model; it just isn't written down in F-06 yet.

**Verification (v4b + v4c):** all 14 Admin + 2 HOD grid instances carry the lunch column, render **unclipped**, and expose exactly `9:00 · 10:00 · 11:00 · 12:00(Lunch) · 1:00 · 2:00 · 3:00` ✓ · **0 conflict badges escaping their cells** ✓ · 30 Admin screens, **0 overlaps** ✓ · 0 unbound white fills on `34:4` / `34:6` ✓ · no `:50`/`:40` time strings anywhere ✓ · all 3 lab pairs verified against the valid list (Networks 2:00–4:00, DS 10:00–12:00, DBMS 1:00–3:00) ✓ · all 9 read-only session cards verified inside teaching periods ✓ · both slot pickers verified to exclude lunch ✓.

---

### 3.14 v4d — missing screens built + PROTOTYPE_CHECKLIST reconciled

Prakash added `PROTOTYPE_CHECKLIST.md` and asked whether it aligns with the build. **It's well-conceived and its principles hold, but it couldn't be executed as written** — four steps pointed at things that don't exist, one flow was missing entirely, and one structural blocker gates everything. Screens built first, then the checklist reconciled.

**Built:**
- **`Login — shared (all 5 roles)` `303:6340` + `Login — error` `303:6341`** (@4800,0 / @4800,1000) — `FIGMA_BUILD_CHECKLIST.md` 5.1 asked for this and it had never been built; only the `Login Form` component (`71:5`) existed. Error copy is `PATTERNS.md` §7 verbatim.
- **`HOD — Approvals list (1 pending)` `303:7646`, `(empty)` `304:519`, `HOD — Approved (confirmation)` `304:7844`** — all three were on `FIGMA_BUILD_CHECKLIST.md` Phase 6 and none were built, despite Phase 6 being marked done in v1. The post-approval state is a **success Toast** (*"Timetable approved."*), not a dialog — `PATTERNS.md` §4.2 specifies a toast, and approving isn't destructive.
- **Empty State `State=Waiting` `304:10`** — `PATTERNS.md` §5.1 documents **three** sub-patterns (Zero-state, Filter-empty, **Waiting-for-others**) but the component only had Empty/Filtered/Error. Added with a clock icon and **no CTA** (a waiting state has nothing for the user to do). Hand-drawing the HOD empty state would have been the easy path and the wrong one.
- **`Admin — Setup Faculty` `306:7780`** — the Faculty screen existed only as a *demo* on the Shells page; the Bulk Import overlays needed a real base.
- **`Admin — Bulk Import · Steps 1–4`** (@0/1600/3200/4800, 6000) — **`COMPONENTS.md` D.1 satisfied at last** (*"Bulk Import Stepper uses `xl`"*), the highest-value item outstanding since v3.

**How the Stepper actually composes.** D.1's anatomy is *"backdrop + container + header (title + close) + content + footer"*, and the Stepper had **its own** header (`Bulk import — Faculty`) and footer — so nesting it naively would double the chrome. But its footer is **Cancel / Back / Continue — three buttons**, and the Dialog's footer holds exactly two, and you cannot add children to an instance. Resolved by adding a **`Show footer` BOOLEAN** to the Dialog set: the Dialog owns the title, the stepper supplies its own action row, `Show footer=false`. The Stepper's header was removed and its variants re-sized 720 → **912** (Dialog `xl` 960 minus 24px padding), padding zeroed, height pinned at 520 so the Dialog doesn't jump between steps. Set re-laid-out 1536 → 1896 (912-wide variants collided on the old 760 grid).

**Confirmation Dialog footer → Button instances (`71:4`).** Phase 4's *"Confirm button becomes enabled (swap variant)"* was **impossible**: the footer was hand-built FRAMEs with no state to swap. Now real Button instances — Cancel = Secondary, Confirm = **Destructive** (`PATTERNS.md` §1.1/§1.2). Same defect class as the v3 Dialog fix, one level down. **Note:** replacing them wiped the instance label overrides — `228:6321` silently reverted to the component default *"Discard"* and had to be restored to *"Delete draft"*. Publish/Republish re-centred (footer 36 → 38).

**Two defects found while building:**
1. **The HOD topbar pill is a hand-built `Status Pill (placeholder)`, not a Status Pill instance.** The Admin shell was refactored to a real `TopbarStatus` instance in Phase 5; the HOD shell never was. Worse, it rendered *"Pending Approval"* on the **Approvals list** — where `COMPONENTS.md` §H.2 says the pill appears *"when viewing a timetable"*, and a queue isn't one. It was actively self-contradictory on the empty state ("Pending Approval" above "No approvals pending"). Hidden on all three list screens; **componentising it remains open** (§6).
2. **`FLOW_DIAGRAMS.md` has never existed** — cited as a source by both `PROTOTYPE_CHECKLIST.md` (line 6) and `FIGMA_BUILD_CHECKLIST.md` (line 26). Removed from the former.

**The checklist's real blocker — recorded as Phase 0.** **17 overlay nodes are page-level siblings** (`screen` + `backdrop` + `dialog` side by side), not nested frames. A Figma prototype `NAVIGATE` targets **one frame**, so no overlay is reachable as a destination — it gates all five flows. This is the same reason prototype wiring was deferred in v1. It must happen **before** wiring, since wrapping changes node IDs.

**Checklist changes:** added **Flow 5 — Draft Lifecycle** (§7/§8 was Category-A confirmed with six screens and zero prototype coverage — and it's the flow that most needs it, since generation gating and the draft warning are invisible statically); added the Phase 0 wrapping blocker; updated Phases 1–4 for the Dialog `xl` stepper, the Time slot picker + lunch column, the Button-instance swap, and the "Clean up drafts" checkbox; renumbered 5→6, 6→7, 7→8; added an **Open decisions** section (Request Changes component, empty-Approvals reachability, HOD pill) and a **build-status table**.

**Verification (v4d):** `🖥 Admin Screens` **37 screens, 0 overlaps, 0 unbound white fills** ✓ · `📋 HOD Screens` **6 screens, 0 overlaps, 0 white fills** ✓ · all 4 Bulk Import steps render at Dialog `xl` 960×610 with the stepper at 912 ✓ · both Login states ✓.

---

### 3.15 v4e — overlay screens wrapped into prototype-targetable frames

**The last thing blocking a wireable prototype, and it had been open since v1.** Every overlay screen was composed as **page-level siblings** — `screen` + `backdrop` + `dialog` sitting next to each other on the canvas at the same coordinates. It *looks* right, and it screenshots right with `contentsOnly:false`, but a Figma prototype `NAVIGATE` can only target **one frame**. None of the modals, drawers, toasts or menus were reachable as a destination. This is why prototype wiring was deferred in v1, and it gated all five flows in `PROTOTYPE_CHECKLIST.md`.

**23 nodes wrapped into 15 composite frames** — 13 on `🖥 Admin Screens`, 2 on `📋 HOD Screens`:

| | |
|---|---|
| **Admin** | Send for Approval · Cell Edit Drawer (open) · Cell Edit Drawer (time slot picker open) + menu · Elective Basket (time slot picker open) + menu · Add Single Record · Publish confirm · Republish confirm · Delete draft confirm · Pending (generation blocked) + Toast · Bulk Import Steps 1–4 |
| **HOD** | Request Changes + backdrop · Approved (confirmation) + Toast |

**Structure:** each composite is `FRAME[ base · backdrop · overlay ]`, positioned where the screen was, sized to the viewport (1440×900 Admin / 1024×768 HOD), `fills=[]` (the base instance supplies the background), `clipsContent=true`. The page-level frame carries the screen's name; the inner base instance is renamed **`base`** so the two aren't confused. **Prototypes must target the outer frame.** The frame was inserted at the base screen's page index so canvas order is unchanged.

**Method note:** `appendChild` does **not** preserve absolute position — it keeps the node's raw `x`/`y`, which are then read against the new parent's origin, so everything jumps. Captured `absoluteBoundingBox` before each move and re-set `x`/`y` relative to the wrapper after.

**Proof it worked:** `screenshot({ contentsOnly: true })` renders a node **in isolation**. Before wrapping, that produced a bare screen with no modal (§9 records exactly this). It now renders the full composite — which is the same thing the prototype engine will target. Read-Only screens have no overlays (they're mobile day-lists), so nothing to wrap there.

**Verification (v4e):** `🖥 Admin Screens` — **37 top-level nodes, 0 loose overlays, 0 overlaps, 0 unbound white fills** ✓ · `📋 HOD Screens` — 6 top-level, 0 loose, 0 overlaps ✓ · composites verified isolated ✓.

> **Prototype status: unblocked.** `PROTOTYPE_CHECKLIST.md` Phase 0's blocker is closed; the three **Open decisions** in that doc (Request Changes component, empty-Approvals reachability, HOD pill componentisation) still want answers, but none of them block wiring.

---

### 3.16 v4f — Request Changes → Confirmation Dialog (Prakash's call)

Prakash resolved open decision #1: **Request Changes is a Confirmation Dialog**, per `PATTERNS.md` §6.2.

**Rebuilt** as a Confirmation Dialog **Reversible** instance `313:8873` (400px — D.3: *"Confirmation dialogs are compact by design"*, down from the Dialog's 560). §6.2's copy verbatim: *"Request changes to this timetable?"* / *"This will return the timetable to Draft state for Admin to revise. Please explain what needs to change."* / `Reason for changes (required)` textarea / `[Cancel] [Request changes]`. The old Dialog instance `201:401` is deleted.

**The confirm is Primary, not Destructive.** `COMPONENTS.md` D.3 assigns **Primary** to Reversible, and §6.2 is explicit: *"labeled 'Request changes' rather than 'Reject'… HOD isn't rejecting a person's work, they're asking for revisions."* A red button would contradict the one thing that section is at pains to establish. Set as an **instance override**, so `Delete draft` (same variant) keeps its Destructive confirm per §1.1. Verified all four Confirmation Dialog instances: Delete draft = Destructive, Request changes = Primary, Publish/Republish = Destructive.

**The Reversible variant had no Content slot** — v4b added `Content#230:0` to Irreversible only, so it couldn't hold the textarea. Added to Reversible and bound to the same key.

**Two of my earlier findings were wrong, and this is how they surfaced** — see §7.4 (withdrawn) and §7.5. Reading D.3 properly showed it defines **two** variants (not three), specifies **400px**, and assigns **info-500 + Primary** to Reversible — meaning my v4 "fix" of that variant broke D.3 compliance rather than restoring it. The lesson is narrow and worth stating: **`COMPONENTS.md` is the component spec; `PATTERNS.md` is the usage spec. Check both before calling a component non-compliant.** I had checked only the second.

**Gotcha:** slot content appended to an instance gets a **compound instance-child id** (`I201:401;196:2;204:452`) and **cannot be re-parented out** — `Error: Node with id "…" not found`. The reason field had to be rebuilt from the `Input / Textarea` component rather than moved across.

**Verification (v4f):** composite renders isolated via `contentsOnly:true` ✓ · instance confirms `Confirmation Dialog` / `Variant=Reversible` ✓ · all 4 dialog instances carry their intended confirm variant ✓.

---

### 3.17 v4g — Confirmation Dialog split into three variants (Prakash's call)

Prakash approved the split proposed in §3.16, which **closes the D.3 ↔ PATTERNS contradiction** rather than working around it.

| Variant | Icon | Confirm | TTC | Slot | Authority | Used by |
|---|---|---|---|---|---|---|
| **Reversible** | info circle `info/500` | **Primary** | — | ✓ | `COMPONENTS.md` D.3 (original) | HOD Request Changes · Discard changes |
| **Destructive** `315:14` | warning triangle `warning/500` | **Destructive** | — | — | `PATTERNS.md` §1.1 | Delete draft · Remove Faculty/Subject/Lab |
| **Irreversible** | warning triangle `danger/500` | **Destructive** | ✓ | ✓ | `PATTERNS.md` §1.2 | Publish · Republish |

**Why this actually resolves it.** The two docs weren't wrong so much as describing *different dialogs under one name*: D.3's Reversible is a plain confirm (info + Primary); §1.1's "Reversible **destructive**" is a delete (warning + Destructive). One variant could never serve both — the confirm button is overridable per instance, but the **icon isn't**, so Request Changes was stuck with a warning triangle over collaborative copy. Splitting gives each doc its own variant and leaves a clean escalation: **info → warning → danger**. All three `-500` stops clear 3:1 on the dialog background (info 3.9 · warning 3.94 · danger 4.01), so the icons remain meaning-carriers per `ACCESSIBILITY.md`.

**Build:** cloned the then-current Reversible (already warning + Destructive — i.e. exactly §1.1) into **`Destructive`**, dropped its Content slot (§1.1 dialogs are icon/title/description/actions), and gave it §1.1's own example copy. Then **restored `Reversible` to D.3**: info-circle icon bound to `info/500`, confirm → Primary. `Irreversible` untouched. Variants re-laid-out in escalation order; set 596 → **879**; Generic page reflowed **+283** then **+41** more (the rewritten §D.3 caption wrapped to 3 lines and collided with the set — caught by the overlap sweep, not by eye).

**Instances repointed:** `Delete draft` **Reversible → Destructive** (it would otherwise have turned blue), copy re-applied per §8.3 — *switching variants drops text overrides*. `Request Changes` stays Reversible and now inherits Primary by default. All four verified: Request Changes → Reversible/Primary · Delete draft → Destructive/Destructive · Publish + Republish → Irreversible/Destructive.

**Docs updated:** `COMPONENTS.md` D.3 now documents three variants with an escalation table and records why. `PATTERNS.md` §1.1 and §8.3 repointed from "Reversible variant" to "**Destructive** variant". The §D.3 caption on the components page also dropped a line I'd written in v4b — *"Never phrase as a question"* — which contradicted §1.1's and §1.2's own templates (*"Remove [object name]?"*, *"Publish this timetable?"*). The real rule is consequence-first **descriptions**, not banning question-form titles.

**✅ Resolved (2026-07-17) — Prakash: §1.1 drops the re-add promise.** See §3.18.

**Verification (v4g):** component spec confirmed (icon colour / confirm variant / ttc / slot per variant) ✓ · all 4 instances on the intended variant ✓ · Generic page **0 overlaps** ✓ · composites still render isolated ✓.

---

### 3.18 v4h — §1.1 drops the re-add promise (Prakash's call)

The last open item from the Confirmation Dialog work. §1.1's copy template ended *"You can re-add it later if needed."* — **Prakash's call: drop it.**

**Why it was wrong on two counts.** As **copy**, it softened the consequence, which cuts directly against the Overall-voice rule *"Consequence-first for actions"* (*"This will replace the currently published timetable."* not *"Are you sure?"*). As a **rule**, it excluded the very actions §1.1 lists — §1.1's "When to use" names *"Deleting a Draft timetable"*, while its "When NOT to use" excluded anything where re-addability is false, and a deleted draft can't be re-added. §8.3's *"This cannot be undone"* therefore contradicted the pattern it belonged to. The template was quietly self-defeating.

**Changed:**
- `PATTERNS.md` §1.1 — template and example drop the promise: *"This will remove Prof. Sharma from the faculty list."*
- §1.1's **"When NOT to use"** rebuilt: the re-add bullet had no referent left, so the §1.1/§1.2 line is now **blast radius** — *"§1.1 removes one bounded object that only Admin sees; §1.2 changes what every user sees, or destroys a term's work."* That's what actually separates "Remove Prof. Sharma" from "Publish", and it holds without any claim about reversibility.
- §8.3's ⚠️ flag → **resolved**: Delete draft stays in §1.1's family (Destructive variant, no type-to-confirm) and is now consistent with it.
- Figma: the `Destructive` variant's default description lost the promise too. Swept `34:3` / `34:4` / `34:6` / `34:7` — **zero "re-add" mentions remain** anywhere in the file.

**Where this leaves the three variants** — each now says exactly what happens and nothing more:

| Variant | Description ends with | |
|---|---|---|
| Reversible | *"Your edits to this cell will be lost."* | states the loss |
| Destructive | *"This will remove Prof. Sharma from the faculty list."* | states the removal |
| Irreversible | *"…This cannot be undone."* | states the finality |

**Headings renamed — see §3.19.**

---

### 3.19 v4i — Pattern 1 headings renamed to match the variants

Prakash's call: **§1.1 "Reversible destructive" → "Destructive"**, **§1.2 "Irreversible destructive" → "Irreversible"**. Each heading now names the variant it uses. *"Destructive"* had stopped distinguishing anything (both sub-patterns are destructive), and *"Reversible"* stopped being true the moment the re-add promise was dropped.

**It wasn't just two headings.** Grepping for the old names turned up four stale references that would have quietly rotted:

1. **§1.2's "when NOT to use type-to-confirm"** said *"excessive friction for **reversible removals**"* — a phrase whose meaning left with the re-add promise. Now *"excessive friction for a single bounded removal (see 1.1)"*.
2. **§6.3 Regenerate warning** said *"Confirmation Dialog (**Reversible variant with warning**)"* — which the split made **self-contradictory**: Reversible is an info circle with a Primary confirm and carries no warning at all. Regenerating destroys manual edits, which is §1.1's family, so it's repointed to **Destructive**. ⚠️ It is also **not built** — every Draft screen has a `Regenerate` button and there is no confirmation screen behind it.
3. **§6.1 Send for Approval** said *"Reversible variant"* — which the split makes **correct** (sending for review destroys nothing, so info + Primary fits). But the build is a **Dialog `default` 560px** (`122:1204`), not a Confirmation Dialog — the same mismatch §6.2 had. Left as-is and flagged, because it's entangled with the unresolved **email hand-off** (§6.1's `To: [HOD name and email]` field and `[Prepare email]` action have never been built), and 400px is tight for an email field plus a note textarea. **Settle those together.**
   > ✅ **Settled — see §3.27 (2026-07-17).** They *were* settled together, though not as expected: the **email hand-off was removed entirely**, so the To: field and [Prepare email] no longer exist to build. The Dialog-vs-Confirmation-Dialog mismatch is real and **kept deliberately** (Prakash) rather than resolved — §7.8b. Note the "400px is tight for a textarea" worry above was wrong: §6.2 does exactly that.
4. **`COMPONENTS.md` D.3's "Use for" column** still described the variants by the old heading names. Rewritten around blast radius: Destructive = *"a bounded removal only Admin sees"*; Irreversible = *"changes what every user sees, or destroys a term's work"*.

**Also corrected:** `FIGMA_BUILD_CHECKLIST.md` §5.3 carried my v4 note claiming the Reversible variant *"had to be fixed first — it was an info circle + primary-blue confirm, contradicting `PATTERNS.md` §1.1"*. That note was wrong (it matched D.3 exactly) and it was sitting in the checklist as if it were fact. Struck and corrected in place.

**Section numbers are unchanged** (§1.1 / §1.2), so every cross-reference across `COMPONENTS.md`, `PATTERNS.md` §8.3, `DOMAIN_COMPONENTS.md` and the build checklist still resolves. Verified by grep.

---

### 3.20 v4j — Regenerate confirmation built (`PATTERNS.md` §6.3)

The gap §3.19 surfaced: `Regenerate` buttons sit on **every** Draft screen with nothing behind them, while §6.3 has specified a confirmation since day one. It was never built because the heading said *"Reversible variant with warning"* — a variant that didn't exist in that form, so the item read as ambiguous rather than missing.

**`Admin — Regenerate confirmation` `319:8901`** (@3200,4000) — built as a **composite frame from the outset** (`base · backdrop · dialog`, per the v4e pattern), so it's prototype-targetable with no follow-up wrapping. Confirmation Dialog **Destructive** variant with §6.3's copy verbatim: *"Regenerate this timetable?"* / *"Regenerating will replace the current Draft, including any manual edits you've made."* / `[Cancel] [Regenerate]`.

**Base choice:** the Send-for-Approval composite's base — a plain Draft with the full Edit grid, **no** Post-Generation Summary Panel and **no** Review Note. §6.3 is generic (*"Draft state, existing edits"*), so the changes-requested and 3rd-draft screens would both have imported context the pattern doesn't ask for. This base is also, in effect, the *"Draft — Review and Edit"* screen that `FIGMA_BUILD_CHECKLIST.md` §5.3 still lists as unbuilt — worth noting when that item is picked up.

**Why Destructive and not Irreversible:** regenerating destroys manual edits, but it's a bounded loss only Admin sees, and it's reconstructible by editing again — §1.1's blast radius, not §1.2's. No type-to-confirm, per §1.2's *"When NOT to use"*.

**Verification (v4j):** `🖥 Admin Screens` — **38 top-level, 0 loose overlays, 0 overlaps, 0 unbound white fills** ✓ · renders isolated via `contentsOnly:true` ✓ · all **five** Confirmation Dialog instances on their intended variant: Request Changes → Reversible · Delete draft + Regenerate → Destructive · Publish + Republish → Irreversible ✓.

**Docs:** `PATTERNS.md` §6.3's "not yet built" flag cleared. `PROTOTYPE_CHECKLIST.md` Flow 5 gains the regenerate-over-edits step (with a note to wire it from the 3rd-draft screen too, where the consequence bites hardest), and the build-status table is updated.

---

### 3.21 v4k — Draft (review and edit) built + the last-edited indicator

`FIGMA_BUILD_CHECKLIST.md` §5.3's *"Timetable — Draft state, Review and Edit (Edit Grid, no summary panel)"* — open since Phase 5, and the state Admin actually spends their time in. **`Admin — Timetable Draft (review and edit)` `321:7724`** (@6400,4000), completing the Draft family in the x=6400 column alongside changes-requested (y=2000) and 3rd-draft (y=3000).

Full Edit Grid, Regenerate + Send for approval, **no** Post-Generation Summary Panel, **no** Review Note — the plain Draft.

**It closes the §3.11 fold, too.** The post-generation screen can't show the whole week (465px panel + 423px grid > an 812px content area), which is correct — the page scrolls, and the panel's own "Review Grid" button is the affordance for getting past it. This screen is where that button lands, and it shows all five days without scrolling. So "the full week is only visible on screens with a Review Note" is no longer true.

**Added: the last-edited indicator.** `USER_FLOWS.md` F-03 step 7 specifies *"unsaved changes are auto-saved with a 'last edited' indicator"* — **no Draft screen had one**. Added as a **Timestamp Caption instance** (`91:4`, `Timestamp#91:0` = *"Last edited today at 2:47 PM"*), which is the documented component for exactly this and already used this way in the Published screen's header. Header 58 → 79; content 522, well inside the viewport. This is the one thing that makes the screen more than a copy of the Send-for-Approval base — it's the reassurance that editing is safe, and it only makes sense here.

> **Resolved — Prakash: add it to the other Draft screens too. See §3.22.**

**Verification (v4k):** `🖥 Admin Screens` — **39 top-level, 0 loose overlays, 0 overlaps, 0 unbound white fills** ✓ · renders isolated ✓ · Draft family now: post-generation · review-and-edit · changes-requested · 3rd-draft · regenerate-confirmation · send-for-approval · cell-edit-drawer (×2).

---

### 3.22 v4l — last-edited indicator rolled out across the Draft family

Prakash's call: put F-03 step 7's indicator on the other Draft screens. **Added to 6 more — 7 of 9 Draft-state screens now carry it.** Two are deliberate exclusions, and they're the interesting part.

| Screen | Indicator | |
|---|---|---|
| Draft (review and edit) | Last edited today at 2:47 PM | v4k |
| Draft (changes requested) | Last edited today at **4:30 PM** | after HOD's 4:12 PM note |
| Draft (3rd draft — final warning) | Last edited today at **9:20 AM** | Draft 3 generated 9:05 AM |
| Send for Approval *(base)* | Last edited today at 2:47 PM | |
| Regenerate confirmation *(base)* | Last edited today at 2:47 PM | |
| Cell Edit Drawer open | Last edited today at 2:47 PM | |
| Cell Edit Drawer (time slot picker) | Last edited today at 2:47 PM | |
| Draft (post-generation) | Last edited today at **2:30 PM** | added on Prakash's call — see below |
| Offline / degraded | Last edited today at 2:47 PM | added on Prakash's call — see below |

**Timestamps follow each screen's own narrative** rather than being copy-pasted: the changes-requested draft reads **4:30 PM** because the HOD's note on that very screen is timestamped 4:12 PM; the 3rd draft reads **9:20 AM** because its subtitle says it was generated at 9:05; post-generation reads **2:30 PM** because that is the moment the draft was written. A uniform 2:47 PM would have quietly contradicted three screens.

**The two I'd argued to exclude — Prakash overruled, and they're in.** Both are now consistent; the reasoning is kept because it shapes the copy:
1. **Draft (post-generation)** — nothing has been *edited* yet, so its stamp is the **generation** time (2:30 PM), matching its own subtitle. It reads as "the draft's last write", which is true. ⚠️ If "last edited" is meant to mean *a manual edit*, this screen is the one place the label out-runs the fact — worth a copy call (e.g. "Last saved") if that bothers you.
2. **Offline / degraded** — its banner already says *"Changes are saved locally and will be re-checked when you reconnect."*, so the indicator is a second, shorter statement of the same thing. It also had **no header frame** (the title was a bare TEXT in `content`), so an `hl` wrapper was created to hold title + indicator, matching every other Draft screen.

**Note on the two Cell Edit Drawer screens:** their header is named `h`, not `hl`, and its subtitle is instructional (*"Click any cell to edit · III-CSE-A"*) rather than a state line — but it's the same title+subtitle shape, so the indicator sits correctly. These are arguably where it matters most: the drawer is open, an edit is in flight, and the indicator is what says the *previous* one is safe.

**Verification (v4l):** **9/9 Draft screens carry the indicator, 0 missing** ✓ · `🖥 Admin Screens` **39 top-level, 0 overlaps, 0 unbound white fills** ✓ · headers 58 → 79 on every screen with an `hl`; offline's new wrapper is 55 ✓ · all inside the viewport, except post-generation whose content is 1007 and already scrolled before this change (§3.11 — the +21px does not alter that).

---

### 3.23 v4m — screen pages reorganised into labelled bands

Prakash reported the two new Draft screens as *"not visible"*. They weren't missing — both were `visible`, `opacity: 1`, unlocked, and rendering at full size in valid grid cells. **The problem was findability**, and it was real: the Admin page had grown to 39 screens across a 9440×6900 canvas, filled cell-by-cell as work arrived, so the **Draft family was scattered across four separate columns**. Two new members landing in cells nobody was looking at was the symptom, not the cause.

**All three screen pages are now organised into bands, each with an H2 heading and a caption naming the flow it serves.** Every screen was accounted for — `missing: 0`, `unassigned: 0` on all three.

**🖥 Admin Screens — 39 screens, 7 bands** (4 per row):

| Band | y | n |
|---|---|---|
| 1 · Auth | 0 | 2 |
| 2 · Setup — categories | 1500 | 10 |
| 3 · Setup — flows & overlays | 5000 | 7 |
| 4 · Timetable lifecycle | 7500 | 7 |
| 5 · Draft family | 10000 | 7 |
| 6 · Confirmations | 12500 | 4 |
| 7 · Cross-cutting states | 14000 | 2 |

Canvas **9440×6900 → 6240×14996** — deliberately narrower and taller, so it reads top-to-bottom in one scroll instead of sprawling sideways.

**📋 HOD Screens — 6 screens, 2 bands:** *Approvals queue* (3 pending / 1 pending / empty) and *Review & decide* (Approval Detail → Approved confirmation / Request Changes). The old layout mixed queue states and the review flow down two columns; the split matches how F-04 actually runs. Extent 3424 × 2264.

**📱 Read-Only Screens — 5 screens, 2 bands:** *My Timetable — per role* (Faculty / Student / Lab Coordinator) and *States & drill-down* (No assignments / Session detail). The old single row interleaved roles with states — Faculty, No-assignments, Session-detail, Student, Lab-Coordinator — so the three role views were never side by side to compare. Extent 1255 × 2208.

**Verification (v4m):** all three pages **0 overlaps, 0 unbound white fills** ✓ · every screen assigned to exactly one band ✓ · repositioning only touched top-level `x`/`y`, so composites, instances and prototype-targetability are untouched.

> **Gap noticed while banding HOD:** `FIGMA_BUILD_CHECKLIST.md` Phase 6 lists **"HOD's My Timetable view"** (Read-Only shell, HOD's own teaching schedule). It doesn't exist — the HOD shell's nav has the entry point but nothing behind it. Same class as the Login/empty-state gaps found in v4d.

---

### 3.24 v4n — HOD My Timetable built + the HOD shell's pill componentised

The gap §3.23 surfaced while banding the HOD page: `FIGMA_BUILD_CHECKLIST.md` Phase 6 lists **"HOD's My Timetable view"** — one of the HOD shell's two entry points, with nav pointing at it and nothing behind it since Phase 6 was marked done.

**`HOD — My Timetable` `333:9556`** (@0,2800, new band *3 · My Timetable*). HOD shell + read-only grid, "My teaching schedule", `Published — as of Mar 15, 2:30 PM` caption, `Published` pill, nav highlighted on My Timetable.

**Built in the HOD shell, not the Read-Only shell** — deliberately against the checklist's wording (*"uses Read-Only shell"*). `INTERACTION_DECISIONS.md` §4.2 defines My Timetable as one of the HOD shell's **two entry points**; dropping HOD into the mobile Read-Only shell would strip their nav and leave no way back to Approvals. Read it as "uses the read-only **presentation**" (Principle 5). Checklist annotated — flag if that reading is wrong.

**It forced the pill fix, and that's the interesting part.** The HOD shell's pill was a hand-built `Status Pill (placeholder)` **hardcoded to "Pending Approval"** — the thing I'd flagged twice and worked around by hiding it. It couldn't be worked around here: this screen needs **`Published`** while Approval Detail needs **`Pending HOD Approval`**, and one hardcoded frame cannot be both. Replaced with a real **`TopbarStatus`** Status Pill instance (`90:57`), matching the Admin shell's Phase 5 refactor. All 6 existing HOD screens re-driven via `setProperties`: Approval Detail + Request Changes → `Pending HOD Approval`; the three queue screens + Approved-confirmation → hidden (§H.2 — a queue isn't a timetable). This is also *why* the pill matters here: it's the trust signal audit §3.6 exists for — *"looking at an outdated timetable without realizing it"*.

**Filtering the grid was the real work.** The Read-Only Grid renders **one section's full week**, not a personal schedule — the first attempt showed III-CSE-A's entire timetable under a heading saying "My teaching schedule", which was simply false. Filtered to the HOD's own **5 sessions** (Compiler Design ×3 for IV-CSE-A, Adv. Algorithms ×2 for IV-CSE-B) with the other **25 cells set to Free**; lab/elective tints cleared back to `semantic/background`, and line 2 repurposed from *faculty* to *section · room* — mirroring the Faculty day-list cards (*"III CSE A · Room 301"*), since on a personal view the faculty is always you.

> **Gotcha worth keeping:** you cannot add or remove children on an instance, so a **single-line "Free" cell can never become a two-line session cell**. Two sessions initially landed on originally-Free cells and silently lost their section/room line *and* stayed centre-aligned. Sessions must be seated on cells that already have two text nodes. Caught by auditing every cell's visible text, not by eye.

> **Open — the HOD has no data.** "Dr. A. Varma" is invented (§7.7) and appears in **no** faculty list or timetable, so all 5 sessions here are invented too. They're plausible for a CS HOD (light load, senior electives) but they are not derived from anything. If the HOD should be one of the existing faculty, this screen and the changes-requested note both need revisiting.

**Verification (v4n):** `📋 HOD Screens` — **7 screens, 3 bands, 0 overlaps, 0 unbound white fills** ✓ · every period cell audited (5 sessions / 25 Free) ✓ · all 6 pre-existing HOD screens re-verified after the shell change ✓.

---

### 3.25 v4o — HOD teaching load decision + desktop role timetables

New Category-A decision from Prakash: **the HOD teaches 3–4 lectures per day, never labs, and 2 of the 5 days carry an elective.** Plus desktop read-only timetables for Faculty, Lab Coordinator and Student.

> **I first read "3–4 lectures" as per *week* and built it that way.** Prakash corrected it: **per day**. That is a 5× difference — 3–4/week becomes **15–20/week** — so the rule, the conflict check and the screen were all redone. Worth recording because the original phrasing ("a HOD should have at least 3 and max 4 lectures") reads naturally as a weekly cap, and a HOD teaching *less* than regular faculty is the intuitive assumption. It isn't what was meant.

**Documented as `INTERACTION_DECISIONS.md` §9:**

| Rule | Value |
|---|---|
| Lectures **per day** | 3–4, every day Mon–Fri |
| Labs | Never |
| Electives | Exactly **2 of the 5 days**, one each |
| Elective counting | **Inside** that day's 3–4 (a 4-day with an elective = 3 regular + 1 elective, not 4 + 1) |
| Distribution | Must vary — **not** 4/4/4/3/3 |

**Two new conflict types** in the §1.2 taxonomy:

| # | Conflict | Severity | Why |
|---|---|---|---|
| 16 | HOD assigned to a lab session | **Blocking** | Categorical — a rule about *kind*, nothing for a human to weigh |
| 17 | HOD lecture count outside range | **Warning** | A rule about *quantity* — a policy judgement Admin may knowingly accept, consistent with **#3 (faculty overload)** |

The asymmetry is deliberate and §9.3 says so. **#17 now checks two bounds** (Prakash's call): **3–4 per day** as the primary check, plus **15–20 per week** to catch a schedule that passes every day yet is lopsided overall. The weekly figure is **derived** from 5 × (3–4), not independently specified — flagged in §9.3, since a tighter weekly ceiling would have to be stated to add anything.

Three things the backend must not get wrong, all recorded in §9.3/§9.4: **#17 has a floor as well as a ceiling** (a 2-lecture day flags like a 5-lecture day — the taxonomy's first, so it can't reuse `underLoadLimit`); **electives count toward the per-day total** (otherwise 4 lectures + an elective passes at 4 while running 5); and the generator must **exclude** the HOD from the lab pass rather than deprioritise them.

> ✅ **Queried and re-confirmed: per-day is intended.** I raised that 15–20 lectures/week is *heavier* than the regular-faculty picture (audit §4.2 treats ~18 hrs as an overload threshold; conflict #3 fires above it), and that "HOD approves timetables" invites the opposite assumption. Prakash confirmed the HOD is a **teaching-heavy** role by design. Recorded in §9.2 so no one later "corrects" it back.
>
> 🔴 **But confirming it exposed a real defect: conflict #3 must now exclude the HOD.** A compliant HOD schedule sits at or above the faculty overload threshold, so **#3 would fire on every valid HOD timetable while #17 simultaneously reports it in range** — two checks contradicting each other on the same person. #17 supersedes #3 for the HOD. This is a silent-failure risk rather than a crash: nothing breaks, Admin just sees a permanent meaningless overload Warning on the HOD and learns to ignore Warnings — which quietly degrades every *other* Warning in the system. Recorded in §9.2, §9.3 (backend trap #3) and inline on the taxonomy row for #3.

**The HOD's timetable was rebuilt twice** — first to the per-week misreading (4 lectures), then to §9.2 proper: **3/4/3/4/3 = 17**, every day in range, **2 elective sessions on 2 different days** (`ML (Elective)`, amber `warning-bg`), **zero labs**, and deliberately not the 4/4/4/3/3 block. Three subjects (Compiler Design, Adv. Algorithms, Theory of Comp.) so no single subject is implausibly repeated. Verified programmatically against every clause of the rule rather than by eye.

**Three desktop screens built** (band *3 · Desktop — 1280* on `📱 Read-Only Screens`), all Read-Only Shell @1280 + **View Controls (Full)** for the viewing/downloading ask — Day/Week, faculty filter, **Export**, **Print**:

- **Student** `340:573` — the whole section week, **unfiltered**, because a student attends everything. This is the one role whose personal view *is* the section timetable.
- **Faculty** — Dr. Sharma's own sessions: 3 lectures + a two-period DS Lab (teal).
- **Lab Coordinator** — Mr. Rao's 2 coordinated labs, carrying the mobile screen's *"Labs you're coordinating — not counted toward teaching load."* note.

**All three are derived from the published III-CSE-A grid, not invented** — unlike the HOD's, whose sessions had to be made up because "Dr. A. Varma" appears in no data at all (§7.7). Line 2 is repurposed from *faculty* to *section · room* (Lab Coordinator: *`Lab 204 · Dr. Nair`*), matching the mobile cards — on a personal view the faculty is always you.

> ⚠️ **The mobile day-lists disagree with the published grid.** Deriving the desktop schedules exposed it: the mobile Faculty screen puts Dr. Sharma's **DS Lab on Monday 10:00–12:00**, but the grid has III-CSE-A in Operating Sys. at that hour and the DS Lab on **Wednesday**. The Lab Coordinator's mobile screen shows both his labs on Monday; the grid puts Networks Lab on Monday and DS Lab on Wednesday. The desktop screens follow **the grid**, which is the published artifact and therefore authoritative — but the mobile day-lists now visibly contradict them and need reconciling. Not fixed here: it's sample data across three screens and worth doing in one pass.

**The desktop views are now a recorded decision, not just built screens** — `INTERACTION_DECISIONS.md` **§10**, added after Prakash asked for the decision to be written into the project files:

- **§10.2** — all three read-only roles get a desktop week grid at 1280 with **View Controls (Export/Print)**, built to the HOD pattern. Mobile 375 stays primary (Principle 7); desktop is the *same* published data, wider. **Download is not an edit affordance** — it produces a copy — so Principle 5 holds.
- **§10.3** — why **Student is unfiltered**, stated explicitly because it otherwise reads as a missing filter: Faculty and Lab Coordinators are *assigned to* sessions, so their view is a filter over the timetable; a Student is a member of a **section**, and that section's timetable *is* theirs. It's the only role where "my timetable" and "the timetable" are the same artifact.
- **§10.4** — line 2 of a personal cell carries `section · room`, not the faculty name, because on a personal view the faculty is always the viewer. Lab Coordinator is the exception (`Lab 204 · Dr. Nair`) — the coordinator is the second person, not the teacher.

**`USER_FLOWS.md` F-08 corrected.** Step 4 read *"print/export (basic functions; **not the focus of the redesign**)"* — that framing is now superseded and marked as such. A personal timetable is something people print and pin up; export/print are a stated capability of every read-only role. F-08 also gains an explicit **Viewport** section (mobile 375 primary + desktop 1280), a `GET /my-timetable/hod/{id}` endpoint, and the note that **desktop needs no new endpoints** — both views render the same role-filtered payload, so the difference is presentation only.

**Verification (v4o):** HOD timetable audited — **3/4/3/4/3 = 17, 0 labs, 2 electives on 2 days** ✓ · `📱 Read-Only Screens` **8 screens, 3 bands, 0 overlaps, 0 unbound white fills** ✓ · all three desktop screens confirmed carrying View Controls with **Export + Print** (Student 22 sessions unfiltered / Faculty 5 / Lab Coordinator 4) ✓ · `📋 HOD Screens` unchanged and clean ✓ · every filtered cell seated on a two-line cell (the §3.24 gotcha) ✓.

---

### 3.26 v4p — mobile ↔ grid reconciled · §6.1 settled · the HOD given a real identity

Three items flagged-but-not-actioned across earlier passes, closed together at Prakash's request.

#### 3.26.1 The mobile day-lists now agree with the published grid

§3.25 found this and left it: the mobile Faculty screen put **Dr. Sharma's DS Lab at Monday 10:00–12:00 for III-CSE-A**, a slot the grid gives to Operating Sys./Dr. Iyer, while the desktop screens (built from the grid) had the DS Lab on Wednesday.

**What the error actually was matters more than the fix.** It looked like a *slot* error — wrong day, move it to Wednesday — which would have emptied the screen to a single card, because Dr. Sharma teaches III-CSE-A exactly four hours a week. It was a **section** error. The lab is real and the time is real; it belongs to **IV-CSE-B**. Reassigning one label cleared the contradiction on both the Faculty and Lab Coordinator screens without moving a session or deleting a card. The grid never claimed Dr. Sharma was free at Monday 10:00 — only that III-CSE-A was busy elsewhere.

Prakash chose **enrich** over **strict**: rather than shrink the read-only screens to what one section's grid can prove, Dr. Sharma gets other-section sessions — seated **only where the grid leaves them free**, so nothing published is contradicted. A faculty member teaching 4 hrs/week was never realistic; it was an artefact of only one section being modelled.

| Screen | Monday, before | Monday, after |
|---|---|---|
| **Student** (Priya S.) | DS 9:00 ✓ · **DBMS 10:00** ✗ · **ML Elective 13:00** ✗ · **OS 14:00** ✗ | DS 9:00 · **OS 10:00** · **DBMS 11:00** · **Networks Lab 14:00–16:00** — the grid's Monday row, exactly |
| **Faculty** (Dr. Sharma) | DS 9:00 ✓ · **DS Lab 10:00–12:00 · III-CSE-A** ✗ · Algorithms 13:00 | DS 9:00 · **DS Lab 10:00–12:00 · IV-CSE-B** · Algorithms **14:00** |
| **Lab Coordinator** (Mr. Rao) | **DS Lab · III-CSE-A** ✗ · Networks Lab ✓ | **DS Lab · IV-CSE-B** · Networks Lab (unchanged) |

Algorithms moved 13:00 → 14:00 for a build reason worth recording: the desktop Faculty grid's **1:00 cell has only one text node** and physically cannot hold a two-line session (§9's standing gotcha), while the 2:00 cell has two. Dr. Sharma is free at 2:00 regardless (III-CSE-A is in Dr. Nair's Networks Lab), so the slot satisfies both the fiction and the file.

Desktop **Faculty** and **Lab Coordinator** grids extended to match — §10.2 requires both views to render the same payload.

**Conflict-checked, not just typed:** Mr. Rao coordinates DS Lab (IV-CSE-B, 10:00–12:00) and Networks Lab (III-CSE-A, 14:00–16:00) — no overlap, both 2 consecutive periods inside one half-day block. Lab 205 is free Monday (its III-CSE-A booking is Wednesday). Room 305 at 14:00 is free (III-CSE-A is in Lab 204).

**Two bugs caught by screenshotting, not by reading the data back — every text read correct in both cases:**
- The **card accent stripe carries its own token**, separate from the badge. The Student's DBMS card kept the Elective **orange** stripe after its badge became Lecture; Networks Lab kept Lecture **blue** after becoming a Lab.
- **Grid cells switch alignment by state:** Free cells are `CENTER/CENTER`, seated cells `MIN/MIN`. Seating a session on a formerly-Free cell leaves it centred; freeing a seated cell leaves it top-left. Hit all five converted cells across three screens.

#### 3.26.2 §6.1 Send for Approval — the build was right, the doc was wrong

> ⛔ **SUPERSEDED BY §3.27 (same day).** Prakash removed the email hand-off entirely, so everything built here — To: field, Prepare email, the post-send line — was reverted within hours. **Two claims below are also wrong on their own terms** and §3.27 explains why. Kept as build history, not as guidance.

Carried since v4 as *"tangled, left as-is pending that call."* Untangling it took reading two documents instead of one.

**The Confirmation Dialog question answers itself.** §6.1 asked for a Confirmation Dialog; the build is a **Dialog `default` (560px)**, and I had recorded that as the *build* being wrong. It is the reverse. A Confirmation Dialog asks a yes/no question about an action already chosen — it takes **no input**. This dialog *collects* input: an editable recipient and a note, both of which travel into the email. That is a **form**, and forms belong in a Dialog. The symptom I'd noted — *"a 400px Confirmation Dialog is tight for an email field + note textarea"* — was the component being wrong, not the size.

**The email hand-off was never open.** I'd flagged it as needing Prakash's decision. `USER_FLOWS.md` F-02 step 7 had already answered it: *"This is the confirmed external email trigger — the system doesn't send email directly on Admin's behalf; it prepares it."* The backend requirement agrees. The one genuine blocker was smaller than the flag implied — *"adding the field means inventing an HOD email address"* — and it dissolved the moment the HOD became a real person (§3.26.3).

**Built:** **To:** field (`Input`, `State=Filled`) above the note — *Dr. R. Iyer — r.iyer@mvgr.edu.in*, helper *"Pre-filled from the HOD's record. Edit if it's wrong."* · post-send line *"After you send this email, mark it complete here to update the status."* · Primary relabelled **Send for approval → Prepare email**, because a label must promise only what the click delivers. Dialog 313 → **455px**, re-centred (440, 223).

**Two copy fixes fell out of it:**
- The note's helper read *"Shared with the Admin."* — the `Input / Textarea` component's default, written for the HOD's reject-reason field, a different dialog with a different audience. Corrected to *"Included in the email to HOD."* It is `visible=false` in this instance, so this is a latent fix, not a visible one.
- §6.1's template titled the dialog *"Send this timetable for HOD approval?"*. Question-form titles are a Confirmation Dialog convention — they ask "are you sure?", which is the wrong thing to say to someone about to fill in a form. Template now matches the build's statement title.

🔴 **Left open, and it's a real hole:** F-02 step 8 has Admin return to the app and **mark the send complete** — and *that* is what moves Draft → Pending HOD Approval. The dialog now tells the Admin to do it. Nothing in the build lets them. **The status transition has no trigger.**

#### 3.26.3 The HOD is Dr. Iyer

"Dr. A. Varma" was invented in v3 to fit the HOD Shell avatar's pre-existing **"AV"**, and appeared in no faculty list and no grid. That made the HOD's entire timetable unfalsifiable — nothing in the file could contradict it, and nothing could confirm it.

Prakash chose to map the HOD onto existing data. **Dr. Iyer is the only candidate:** of the five faculty in the grid, the only one with **no labs** who **teaches an elective** — precisely §9.2's shape (Sharma/Gupta/Nair all run labs; Rao teaches no elective). The fit isn't luck; §9.2 and the sample grid were evidently written from the same intuition about what a HOD teaches.

**Five sessions are now pinned** from the grid — Mon 10:00, Tue 9:00, Wed 3:00, Fri 11:00 (Operating Sys. · III-CSE-A · Room 305) and Thu 2:00 (Prof. Elective · III-CSE-A · Room 210). The other 12 stay IV-CSE-A/IV-CSE-B inventions, and that is now **correct rather than a gap**: a 3–4 *per-day* load cannot be sourced from one section's grid. What changed is that the invented 12 are **constrained** — each sits where the grid leaves Dr. Iyer free.

**Naming a real person immediately surfaced a clash.** The HOD's second elective was *ML (Elective)* at Tue 1:00 — the exact subject and slot the grid assigns to **Dr. Gupta**. Two teachers cannot own one class. It became **NLP (Elective) · Basket A · Room 212** (Room 210 is Gupta's ML at that hour). This was invisible for as long as the HOD floated free of the data, which is the argument against leaving invented people in a design system.

**Re-audited against §9 after the rebuild:** **3/4/3/4/3 = 17** ✓ · every day inside 3–4 ✓ · week inside 15–20 ✓ · **0 labs** ✓ · exactly **2 elective days** (Tue, Thu) ✓ · varied, not 4/4/4/3/3 ✓ · all 5 pinned slots present ✓.

**Changed:** HOD Shell avatar `81:195` **AV → RI** (main component — one edit, propagated to all 8 HOD screens) · attribution on `HOD — Approval Detail` and `Admin — Timetable Draft (changes requested)` → *Dr. R. Iyer (HOD) · Mar 17, 4:12 PM* · `HOD — My Timetable` `333:9556` rebuilt.

⚠️ **Still invented: the initial "R."** No document gives any faculty a first name, but the avatar convention needs two letters (`AS`, `KR`, `PS`). Rename if the real initial differs.

**Verification (v4p):** mobile Student/Faculty/LabCo Monday ≡ desktop Faculty/LabCo Monday ≡ published grid ✓ · all 9 mobile card accents match their badges ✓ · no text overflow in any reseated cell ✓ · HOD §9 audit passes all 6 rules ✓ · Send for Approval renders correctly at 455px ✓ *(reverted hours later — §3.27)*.

---

### 3.27 v4q — the email hand-off removed entirely

Prakash reversed §3.26.2 the same day: *"keep it as send approval like before, i want to remove the Email pattern."* The whole hand-off is gone, not just the To: field.

**What §3.26.2 got wrong.** I argued §6.1 must be a Dialog rather than a Confirmation Dialog *"because it collects input, and a Confirmation Dialog takes none."* That is **false**, and the file already disproved it: `HOD — Request Changes (modal)` is a **Confirmation Dialog `Variant=Reversible`, 400px, with an `Input / Textarea` sitting in its Content slot** — a conversion Prakash had asked for himself. The Confirmation Dialog has a `Content` **SLOT** property; it hosts input perfectly well. The reasoning was wrong but happened to land on the answer the build already had, which is exactly why it went unchallenged. **A rationale that agrees with the status quo gets audited less.**

**So the component question reopened once the To: field left.** With only a note textarea, §6.1 is structurally identical to §6.2. Prakash chose to **keep the Dialog (560px)** rather than rebuild. That leaves a genuine inconsistency, and it is recorded rather than rationalised: **two identically-shaped dialogs using two different components.** §6.1 is the one to move if they ever need to match — §6.2 proves a 400px Confirmation Dialog holds a textarea, and `Reversible` would be its variant, since sending for approval destroys nothing.

**Reverted in Figma:** `122:1204` back to **560×313 at (440, 294)** — its exact pre-v4p geometry. To: field and post-send line removed, Primary back to **Send for approval**. The (hidden) note helper is now *"Shown to HOD with the timetable."*, since the v4p text *"Included in the email to HOD."* is no longer true.

**The removal closed the hole v4p had opened.** §3.26.2 ended by flagging that Draft → Pending had **no trigger**: F-02 step 8 required Admin to "mark the send complete", an affordance nobody ever built. Rather than build it, the flow lost the step it existed to serve. **Confirming the dialog is now the trigger** — one atomic action that sets Pending and locks the timetable. The defect had survived precisely because it straddled an app boundary, where each side could assume the other handled it.

**Blast radius — five documents, not one.** The email was load-bearing well outside §6.1:

| File | Was | Now |
|---|---|---|
| `PATTERNS.md` §6.1, §4.2 | Prepare email + "mark it complete" trigger | The confirm is the trigger |
| `USER_FLOWS.md` F-02 steps 6–8 | *"the **confirmed** external email trigger"* | Superseded in place, old text quoted verbatim so git history can't mislead |
| `USER_FLOWS.md` F-02 backend | Endpoint to compose the mail / serve mailto content | One atomic submit-for-approval call + note persistence |
| `USER_FLOWS.md` F-04 entry point | *"HOD receives Admin's email, follows the link"* | HOD logs in; Approvals is in their nav — step 1 always said so |
| `INFORMATION_ARCHITECTURE.md` | No notification centre **because** of the email | No notification centre **because the Approvals nav item is the notification** |
| `PROJECT_BRIEF.md` roles + publish flow | *"emails HOD for review"* | Submits in-app |

**The IA entry was the trap.** Its exclusion of a notification centre was justified *by* the email, so removing the email invites the inference *"no email → the HOD needs an inbox."* Wrong. F-04 step 1 always had the Approvals area appear when something is pending and hide itself when the queue empties (step 7). That nav item **is** the notification — scoped to the single thing a HOD is asked to do, with a queue that is never longer than one, since the model is one active timetable at a time. Conclusion unchanged, reasoning replaced.

**`RESEARCH_SYNTHESIS.md` was annotated, not rewritten — deliberately.** Its email entry sits under **"Confirmed (Prakash's direct audit + answers)"**, and it is a *research finding*: a record of how approvals actually happen in the department. A design decision cannot make a past observation untrue. What changed is that the product **no longer models** that step. Rewriting the finding to match the design would have quietly falsified the research.

🟡 **Found in passing — `DECISION_LOG.md` does not exist.** `PROJECT_BRIEF.md` (*"See `DECISION_LOG.md` for the full history of this change"*) and `INFORMATION_ARCHITECTURE.md` (*"Decision record: `DECISION_LOG.md`, 2026-07-13"*) both cite it; nothing by that name is anywhere in the project. Pre-existing and unrelated to this change, but it means the publish-flow history is currently unciteable — and the publish flow is exactly what just changed. Flagged in §7.

**New decision record:** `INTERACTION_DECISIONS.md` **§11 — Removing the Email Hand-Off** (§11.2 before/after · §11.3 the defect it closed · §11.4 why the notification centre still stays out · §11.5 what survives: the note, the lock, §6.2 · §11.6 why a research finding isn't overturned).

**Verification (v4q):** `122:1204` = **560×313 @ (440, 294)** ✓ · visible text = *Send for approval · This will lock… · Note to HOD (optional) · Ready for your review. · Cancel · Send for approval* — identical to pre-v4p ✓ · no `email` / `mailto` / `Prepare email` reference left in any flow, pattern, brief or IA doc ✓.

---

## 4. Decisions made during the build

**Design decisions (implementation matches spec; log these in `DECISION_LOG.md` as final):**
1. **Conflict severity → 3 hue families** (Blocking=danger, Warning=warning, Informational=info) — stronger than a monochrome-red scale; colour-blind safe since each also carries a distinct icon + label.
2. **Workflow status → colour**, notably **Published = Primary** (not Success) — keeps Published visually distinct from Approved, reinforcing that approval and publish are separate steps.
3. **"Request changes" reverts to Draft** — no dedicated Rejected status/token. Confirmed correct by design.
4. **DM Sans + Inter dual-font** — already confirmed in `DESIGN_PRINCIPLES.md:205-207` and `FOUNDATIONS.md` §11. **No doc change needed** (contra V1 review).

**Build/architecture decisions (mine):**
5. **Shell Content SLOT pattern** — each shell is a component with a `Content` SLOT; screens = shell instance + slot filled with component instances. Prevents shell-drift; proven across all screens.
6. **`TopbarStatus`** — the Admin top-bar pill was refactored from an inline pill into a **Status Pill instance**, so each screen sets its own state via `setProperties`. This makes the persistent status indicator (PS-01) correct across the whole lifecycle.
7. **Modal/drawer overlays** — composed as `screen.clone()` + backdrop frame + component instance positioned over it.
8. **Semantic aliasing** — components consume semantic tokens only, never raw primitives.
9. **Deviation:** `--container-full` (100%) documented but **not** a numeric variable — a percentage cannot be a fixed-number Figma variable. **This is the only intentional deviation.**

**v3 decisions (this pass):**

10. **Changes-requested uses `warning`, not `danger`** — the draft isn't broken and nothing is blocked; HOD wants revisions. `PATTERNS.md:412` is explicit that the language is *"Request changes" rather than "Reject" … more collaborative*, and the tone follows.
11. **Reason lives in a persistent callout, not only a Toast.** `PATTERNS.md:399` specifies *"Admin sees warning toast on next visit"* — but a Warning toast auto-dismisses after 8s (`COMPONENTS.md` C.1), so a toast alone **cannot** hold the reason. That is precisely the gap the review found. The callout is the durable home; the toast remains the arrival announcement. **The toast was deliberately not staged on the screen** — it lands exactly on top of the "Resubmit for approval" button and would make the screenshot misleading as a spec (see §6 for the underlying collision).
12. **Post-Generation Summary Panel excluded from the returned draft** — `DOMAIN_COMPONENTS.md` §11: *"shown once after a fresh generation."*
13. **Dialog rebuilt rather than replaced** — `74:2` kept as the `Size=default` variant so existing instances and doc references stayed valid.
14. **Dialog footer uses Button instances**, and modal fields use Input / Select / Textarea instances — the review's "don't re-draw a component" principle applied consistently, not just at the modal level.
15. **`Input / Textarea` built with 4 states (Default/Focus/Filled/Error), not Input's 8.** Hover/Disabled/Read-only/Success aren't exercised by any textarea in the flows. Deliberate scoping, not an oversight — flagged in §6 in case parity is wanted.
16. **Fixed-width time column instead of tabular figures** — achieves the same alignment, and unlike TNUM it survives a font swap, a locale change, or a font that lacks the feature. TNUM is additionally impossible in Figma (§9).
17. **"Lab" badge dropped on the Lab Coordinator screen** — zero information content when every session is a lab; the freed width carries the faculty pairing instead.
18. **Setup screens treated as the definitional source** for sample data when screens disagreed (DS Lab room 204 → 205).

---

## 5. Assumptions made (flag if wrong)

1. **Sample data is invented** — faculty names (Dr. Sharma/Iyer/Gupta/Nair/Rao), subjects (CS201–CS207), rooms, sections, times. Placeholder only; not real MVGR data.
2. **Setup Overview shows 6 of 9 complete** — chosen to match the Setup Progress Summary's "In-progress" variant copy.
3. **Elective + Cross-section elective both built** — per `DOMAIN_COMPONENTS.md` §7, which lists both. **Unresolved contradiction — see §7.**
4. **Icons are hand-authored Lucide-style SVGs** (via `createNodeFromSvg`), not imported from the Lucide plugin. Visually consistent with Lucide; swap to the real library if exact parity matters.
5. **7 setup category screens follow the Subjects pattern** — same shell + header + typed table, different data. Deliberate (not 7 bespoke designs).
6. **Tabs Focus ring shown on the active tab** — represents keyboard focus landing on the selected tab.
7. **Status keyword colouring** in setup tables — Maintenance/Unmapped → warning; Active/Mapped → success.
8. **Time Slot Grid rendered as a table of periods** (Period/Start/End/Type), not a day×period matrix.
9. **HOD/Read-only greetings** — "Dr. Sharma" (faculty), "Priya S." (student) are placeholders.

**v3 assumptions:**

10. ✅ **RESOLVED (2026-07-17) — the HOD is Dr. Iyer, not "Dr. A. Varma."** Varma was invented to fit the HOD Shell avatar's pre-existing "AV". Prakash chose to map the HOD onto an existing faculty member instead; Dr. Iyer is the only one of the five in the grid who satisfies §9.2 (no labs, teaches an elective). Five III-CSE-A sessions are now pinned straight from the published grid. See `INTERACTION_DECISIONS.md` §9.5 and §3.26.3 below. ⚠️ **Still invented — the initial "R."**: no doc gives any faculty member a first name, but the avatar convention needs two letters.
11. **Returned-draft timeline** — generated Mar 15 2:30 PM (already on the draft screen) → returned **Mar 17, 4:12 PM**. Invented but internally consistent with the HOD screen's "Submitted … 2 days ago".
12. **Mr. K. Rao's Monday is 2 coordination sessions** — **updated v4p (§3.26.1):** DS Lab **10:00–12:00 · IV-CSE-B** w/ Dr. Sharma; Networks Lab **14:00–16:00 · III-CSE-A** w/ Dr. Nair. Networks Lab is grid-backed. The DS Lab is **IV-CSE-B's**, not III-CSE-A's — III-CSE-A's DS Lab is on Wednesday, and Monday 10:00–12:00 is its Operating Sys. + DBMS. Rao coordinating both is consistent with Setup › Lab Coordinators (he coordinates *Networks Lab + DS Lab*, max 4 days/wk) and the two do not overlap.
13. **The Lab Coordinator screen shows a *dedicated* coordinator**, not a Faculty-acting-as-coordinator. **The docs don't say whether a faculty-as-coordinator sees one merged timetable (teaching + coordination) or two.** `USER_FLOWS.md:338` establishes ~30% of Faculty are coordinator-capable, so this case is real and unspecified — flagged in §7.
14. **Textarea sample copy** ("Explain what needs to change…", "Shared with the Admin.") is invented library placeholder text.

---

## 6. Pending tasks

**✅ All 4 validated findings from §2 are done in v3** — see §3.9. Remaining:

- [x] 🟡 **Bulk Import Stepper should be a Dialog `xl` instance.** ✅ **done in v4d (§3.14)** — 4 step screens built; Stepper restructured to 912 and slotted into a Dialog `xl` with `Show footer=false`.
- [x] 🔴 **Wrap the overlay nodes into single frames** — ✅ **done in v4e (§3.15).** 23 nodes → 15 composite frames. The prototype is now wireable.
- [x] 🟡 **Componentise the HOD shell's topbar pill** — ✅ **done in v4n (§3.24)**, now a real `TopbarStatus` Status Pill instance.
- [ ] 🟡 **Finish the Input variants** — `COMPONENTS.md` B.1 documents Text / **Number** / **Date-Time** / Textarea. Text and Textarea exist; **Number and Date/Time are still missing**. Also decide whether `Input / Textarea` should carry Input's full 8 states (built with 4 — see §4.15).
- [x] 🟡 **Add the missing day row(s) to `Timetable Grid — Edit` `101:10`** — ✅ **done in v4a (§3.11)**, aligned to Mon–Fri. Mon–Sat remains a docs-only question (§7.3).
- [x] ⚪ **Build "Timetable — Draft state, Review and Edit"** — ✅ **done in v4k (§3.21)**, screen `321:7724`. Also resolves the post-generation fold (§3.11): the full week is now visible on a Draft screen.
- [ ] 🟡 **Cell Edit Drawer is missing the `Section` field** — `USER_FLOWS.md` F-03 step 2 lists *"subject, faculty, room, **section**, time slot"*. `Time slot` was added in v4b; `Section` still isn't there. (It's shown read-only in the drawer header as "III-CSE-A Section", so decide: editable field, or amend F-03.)
- [ ] ⚪ **Audit remaining sample data against the new slot model** — v4b swept every time string in the file, but any future data needs the same check: nothing may sit in 12:00–1:00, and every lab must be 2 consecutive periods inside P1–P3 or P4–P6 (`DOMAIN_COMPONENTS.md` §5.1).
- [ ] 🟡 **Re-export screenshots** — `./Screenshots/` still shows the **v2** file, now two passes stale. New/changed since: Draft (changes requested), Draft (3rd draft), Lab Coordinator My Timetable, all 3 modals, Delete-draft confirmation, Pending (generation blocked), Published, Approved, Publish/Republish confirmations, Generic page, Domain page.
- [x] ⚪ **Toast ↔ page-header collision** — **resolved in v4.** Confirmed real: at the literal top-right the Toast covered the disabled Regenerate button (toast x 1036–1416 / y 72–132 vs button x 1305–1408 / y 98–136). Resolved by keeping the toast in the top-right *region* but dropping it **below the header actions row** (y=152) — it clears the button and only overlays the empty right side of the locked banner. Matters more than v3 assumed: `COMPONENTS.md` C.1 gives Danger toasts **no auto-dismiss**, so the collision would have been permanent, not 8s. `COMPONENTS.md` C.1's *"slide from top-right"* may want a note about the header-actions row.
- [ ] ⚪ *(optional)* Interactive prototype wiring — **deferred**: modal/drawer screens use sibling-overlay composition (shell + separate backdrop + dialog nodes), which Figma prototype `NAVIGATE` can't target. Would need each overlay screen wrapped into a single frame first.

**Carried to Frontend Documentation (not Figma work):**
- [ ] `font-variant-numeric: tabular-nums` on time elements — cannot be expressed in Figma (§9), but should be in the CSS alongside the fixed-width time column.

---

## 7. Open decisions needed from Prakash (blocking)

1. ✅ **RESOLVED (2026-07-16 doc update) — sending for approval DOES lock edits.** `USER_FLOWS.md:241`: *"locked to Admin edits **from the moment it is submitted** for approval… **not from the point of approval**"*; F-02 step 8: *"**The timetable locks immediately** — edits and new generation are both disabled"*; `PATTERNS.md` §4.1 lists Pending as *"Read-only + locked banner"*. The Dialog copy is corrected (§3.10.7) and the Pending screen already carries a "Locked for editing" callout. **No action left.**
   - ✅ **RESOLVED (2026-07-17) — the email hand-off is REMOVED entirely.** This moved twice in one day, so the sequence matters. I first closed it by pointing at `USER_FLOWS.md` F-02 step 7 (*"the **confirmed** external email trigger"*) and building the To: field + **Prepare email** button (§3.26.2). Prakash then **removed the email pattern outright** (§3.27) — which was available the whole time and which I had not offered as an option, having treated the docs' "confirmed" as settling the design rather than merely recording it. **End state: no email anywhere in the system.** Confirming the dialog sets Pending HOD Approval and locks the timetable in one atomic action, which also closes the *"mark it complete has no trigger"* hole instead of leaving it open. Decision record: `INTERACTION_DECISIONS.md` **§11**.
2. 🔴 **NEW — `DOMAIN_COMPONENTS.md` §14's `-500` accent rule can't hold for the Approved variant.** §14 specifies a `-500` left border **and** a `-500` icon for all three variants, and its own a11y note makes the icon a meaning-carrier (*"icon + title text carry the meaning independently"*). Measured against each variant's `-100` background: `warning/500` = **3.58:1** ✓, `danger/500` = **3.62:1** ✓, **`success/500` = 2.05:1 ✗** — well under `ACCESSIBILITY.md`'s 3:1 floor for non-text UI. Approved was built at `success/700` (5.5:1). **Either §14 should say `-700` for Approved, or `success/500` needs darkening in `FOUNDATIONS.md`.** (For reference, `success/600` = 3.14:1 — passes, but only just.)
3. 🟡 **Should the timetable week be Mon–Fri or Mon–Sat?** — **the Edit-grid defect is FIXED (§3.11); this is now a docs-only question.** `DOMAIN_COMPONENTS.md` §5 says *"Rows: days (Monday through Saturday, typically)"*, but **every built screen uses Mon–Fri**, so the Edit grid was aligned to Mon–Fri. If Saturday is real, **both** grids need a 6th row and §5 is right; if not, §5 should drop "through Saturday". Nothing is blocked either way.
4. ❌ **WITHDRAWN — "D.3's third Confirmation Dialog variant is missing" was wrong.** I read this off `FIGMA_BUILD_CHECKLIST.md` §2.4 (which lists Reversible / Irreversible / **Publish**) without checking D.3 itself. **D.3 defines exactly two variants** — *"Reversible (default), Irreversible (Publish, delete)"* — and explicitly assigns type-to-confirm to Irreversible (*"Type-to-confirm input for high-impact actions (Publish)"*). The build matches D.3. **The outlier is the checklist's third bullet**, which should be struck. D.3 also settles the size question: *"`sm` (400px). Confirmation dialogs are compact by design."*

5. ✅ **RESOLVED (2026-07-17) — Prakash approved splitting the Confirmation Dialog into `Reversible` / `Destructive` / `Irreversible`.** See §3.17. `COMPONENTS.md` D.3 and `PATTERNS.md` §1.1/§8.3 are updated; the contradiction below is closed. Kept for the record:

   | Variant | D.3 | PATTERNS |
   |---|---|---|
   | Reversible | `--info-500` icon · **Primary** confirm | warning triangle `--warning-500` · **Destructive** confirm (§1.1) |
   | Irreversible | `--warning-500` icon · Destructive | warning triangle `--danger-500` · Destructive (§1.2) |

   **My v4 change was an overreach.** I reported the Reversible variant as *"contradicting its own spec"* (info circle + primary-blue confirm) and changed it to warning-triangle + Destructive. It was **not** contradicting its spec — it matched **D.3 exactly**. I checked PATTERNS and never opened D.3. The same applies to the Irreversible icon, which I moved `warning-fg` → `danger/500` on §1.2's authority alone.

   **Current state (works, but the icon is unresolvable with one variant):** the icon follows PATTERNS (warning triangle) while each instance picks its own confirm — Delete draft = Destructive (§1.1), Request changes = Primary (D.3 + §6.2). A warning triangle over *"Request changes to this timetable?"* reads more alarming than §6.2 intends.

   **Recommended fix:** split into `Reversible` (info-500 circle + Primary → Request changes, Discard changes) and `Destructive` (warning-500 triangle + Destructive → Delete draft, Remove faculty), keeping `Irreversible` for Publish. That satisfies D.3's two variants *and* §1.1's destructive family. **Needs your call** — I've deliberately not restructured it a second time on my own reading.
5. ⚪ **NEW — `PATTERNS.md` §8.3 asks for the Reversible variant but writes Irreversible copy.** §8.3 says *"Confirmation Dialog (Reversible variant per Pattern 1.1)"*, yet its copy ends *"This cannot be undone."* — and §1.1's own **"When NOT to use this pattern"** rule excludes *"any action where 'you can re-add it later' is false"*. Built as specified (Reversible + §8.3 copy verbatim, three separate instructions say Reversible), but **§1.1's copy template or its exclusion rule needs a tweak** — a draft genuinely can't be re-added, so the two rules can't both be true.
6. 🟡 **Faculty-acting-as-coordinator: one timetable or two?** `USER_FLOWS.md:338` says ~30% of Faculty are coordinator-capable, and F-08 defines *separate* filters ("Faculty: classes and labs they teach" / "Lab Coordinator: labs they're coordinating"). It never says what someone who is **both** sees — one merged view, or a toggle. The v3 screen assumes a *dedicated* coordinator and sidesteps this. **Note:** `INTERACTION_DECISIONS.md` §7.6 (new) settles that Faculty stay read-only with no feedback mechanism, but it does **not** answer this.
7. ✅ **RESOLVED (2026-07-17) — the HOD is Dr. Iyer.** Prakash chose to map the HOD onto existing grid data rather than keep an invented person. Dr. Iyer was the only eligible candidate under §9.2 (the sole faculty with no labs who also teaches an elective). See `INTERACTION_DECISIONS.md` §9.5 and §3.26.3. ⚠️ **One residual invention: the initial "R."** — needed because the avatar convention takes two letters (`AS` = A. Sharma, `KR` = K. Rao, `PS` = Priya S.). Rename if the real initial differs; it appears on the HOD Shell avatar, Approval Detail, the Admin changes-requested callout, and the Send for Approval **To:** field.
8. 🟡 **Cell Edit Drawer — Informational state?** Current build has none, which matches `INTERACTION_DECISIONS.md` §1.3 ("shown, not gated"). Confirm informational conflicts stay inline-badge-only.
8a. 🟡 **NEW (v4q) — `DECISION_LOG.md` is cited twice but does not exist.** `PROJECT_BRIEF.md` says *"See `DECISION_LOG.md` for the full history of this change"* (of the publish flow) and `INFORMATION_ARCHITECTURE.md` says *"Decision record: `DECISION_LOG.md`, 2026-07-13"* (of the single-login reversal). **No file by that name exists anywhere in the project.** Pre-existing — not introduced by any build pass — but it now matters more, because the publish flow is exactly what §11 just changed, and its stated history is unciteable. Either the log was never written and both references should be struck, or it exists outside this folder and should be linked properly. Two of the project's most-cited reversals currently point at nothing.
8b. ⚪ **NEW (v4q) — §6.1 and §6.2 are the same shape but different components.** Both are now title + description + one textarea + Cancel/confirm. §6.1 is a **Dialog** (560px); §6.2 a **Confirmation Dialog** (`Reversible`, 400px, textarea in its Content slot). **Prakash chose to keep the split** (2026-07-17) rather than rebuild a working dialog — recorded here so it reads as a decision, not an oversight. If they ever need to match, §6.1 is the one to move: §6.2 proves the Confirmation Dialog hosts a textarea at 400px, and sending for approval destroys nothing, so `Reversible` is its variant.
9. ⏸️ **"Elective" vs "Cross-section elective"** — **deferred by Prakash (2026-07-16); no action taken.** Still a genuine contradiction: `DOMAIN_COMPONENTS.md` §7 documents **both** cell types while the confirmed lecture-type model reportedly names only cross-section. Affects the generation/conflict logic, so it will need resolving before Frontend Documentation.
10. ⏸️ **Delete the `Harmonized Palette` collection?** — **deferred by Prakash (2026-07-16); no action taken.** 45 vars, ID `27:2598`, pre-existing (predates this build), unused by the design system.
11. ✅ **Spacing/radius/motion variables** — these **do exist** as variables (contra V1). No action unless you want them re-scoped.

---

## 8. Next steps (project workflow)

1. **Resolve §7 blockers** — the v3 lock blocker is **answered**; the lead item is now 🔴 **§14's `success/500` accent failing 3:1** (§7.2), since it's a doc correction, not a build change. Elective-vs-Cross-section and the Harmonized Palette stay deferred by your call, but Elective still blocks Frontend Documentation.
2. **Complete §6 pending** — the 4 validated review findings **and** all 5 🆕 Draft-lifecycle items are done; what's left is Bulk Import Stepper → Dialog `xl`, the remaining Input variants (Number, Date/Time), the Edit-grid day rows, and re-exporting screenshots.
3. **Log §4 decisions** in `DECISION_LOG.md` — now 18 entries (9 original + 9 from v3), plus the v4 decisions in §3.10.
4. **Frontend Documentation** — code-time handoff docs. Tokens already carry `var(--…)` WEB code syntax, so Dev Mode hands off exact values.
5. **Claude Code Development** — React implementation (shadcn/ui baseline matches the token architecture).
6. Testing → Portfolio case study → Final project audit.

---

## 9. Technical gotchas (for whoever continues in Figma)

- Figma **variable names cannot contain `.`** → `--space-0.5` is named `space/0-5` (code syntax preserves the real CSS name).
- Font style strings differ: **DM Sans = `"SemiBold"`** (no space); **Inter = `"Semi Bold"`** (with space).
- `appendChild()` returns **undefined** — never chain off it.
- `counterAxisAlignItems` has **no `STRETCH`** — use child `layoutSizingVertical="FILL"`.
- Enabling `layoutMode` **after** `resize()` flips sizing to hug — set `primaryAxisSizingMode`/`counterAxisSizingMode` to `FIXED` explicitly (this caused the avatar pill bug).
- `ALL_FILLS` **cannot** be combined with other fill scopes.
- **`clone()` on a variant inside a COMPONENT_SET orphans the copy onto the PAGE** — must `set.appendChild(clone)` explicitly.
- Don't set a per-side stroke weight to `undefined`; restructure instead.
- **Isolated node screenshots don't render sibling overlays** — verify modal/drawer composites via a page-region screenshot.
- Structural containers must get `fills=[]` — `createFrame` defaults to white, which is why unbound white fills accumulate. Sweep: clear any fill with r,g,b > 0.97 that isn't variable-bound.

**Found during v3:**

- **OpenType features cannot be set from the Plugin API — at all.** `openTypeFeatures` is **read-only** (`TypeError: node.openTypeFeatures: read-only property on TEXT node`); the only members that exist are `openTypeFeatures` and `getRangeOpenTypeFeatures` — both getters. There is no `setRangeOpenTypeFeatures`. Neither DM Sans nor Inter exposes a "Tabular" style to swap to either. **Tabular figures are a code-time concern, not a Figma one.** (This is why the TNUM task resolved as a layout fix.)
- **`parent.children.indexOf(node)` returns `-1`** even for a real child — the `children` getter returns fresh proxies each access, so they're never reference-equal. Use `children.findIndex(c => c.id === node.id)`.
- **`minHeight` cannot be set on an instance child** — `Error: in set_minHeight: This property cannot be overridden in an instance`. Combined with the next item, this means **you cannot fake a textarea out of an Input instance**; the variant has to exist.
- **`resize()` on an instance child is silently reverted** if you first set `counterAxisSizingMode = "FIXED"` — the child snaps back to the main component's height. (Related to the known "resize before sizing modes" rule, but worse inside instances.)
- **`figma.createSlot()` does not exist.** Make a normal FRAME and bind `frame.componentPropertyReferences = { slotContentId: propKey }`; it then reports `type === "SLOT"` when instanced.
- **SLOT properties *do* work on a COMPONENT_SET** (verified with a throwaway probe): `set.addComponentProperty("Content","SLOT","")`, then bind `slotContentId` on the corresponding frame in **every** variant. Instances expose the SLOT and accept children normally.
- **Hidden children still reserve their space if the instance is sizing `FIXED`.** Hiding an Input's helper text leaves a 22px gap until you also set `layoutSizingVertical = "HUG"`.
- **Adding a TEXT property to a variant set overwrites every variant's text with the single shared default** — Figma has no per-variant property defaults. Document per-variant content with **example instances** beside the set (the `Timestamp Caption` pattern) rather than expecting the set to show it.

**Found during v4p:**

- **Grid cells carry their state in `primaryAxisAlignItems`/`counterAxisAlignItems`, not just their text.** Free cells are `CENTER/CENTER`; seated cells are `MIN/MIN`. Retexting a Free cell into a session leaves it centred, and freeing a seated cell leaves it top-left — both look obviously wrong on screen and **both pass a text-content check**. Whenever a cell changes state, set alignment too.
- **A session card's left accent stripe is a separate `accent` frame with its own colour token** — it is *not* driven by the badge. Changing a card's type means changing three things: the badge text, the badge's fill + text tokens, and the accent's fill. Mobile card tokens: Lecture `36:8`, Lab `36:27`, Elective `36:23` (accent) / Lecture `36:36`+`36:35`, Lab `36:38`+`36:37`, Elective `36:32`+`36:31` (badge bg + fg).
- **"Free" grid cells are not all the same shape.** Some have one TEXT node, some have two with the second hidden (a leftover from the unfiltered grid they were derived from). Only the two-node ones can hold a two-line session — the one-node ones still cannot, per the §3.24 gotcha. **Check `children.filter(TEXT).length` before choosing a slot**, and pick the session's slot to fit the cell rather than fighting it (this is why Algorithms sits at 14:00 and not 13:00 — §3.26.1).
- **SLOT contents accept `insertChild` on an instance** — the Send for Approval dialog took a brand-new `Input` instance at index 0 of its `Content` slot, and the child got a plain top-level ID (`363:7991`), not a compound instance-child ID. Slot content is genuinely editable; it's re-parenting *out* of a slot that fails.
- **A grown dialog does not re-centre itself.** The overlay composites position the dialog absolutely (`layoutMode: NONE`), so adding a field pushed Send for Approval 313 → 455px while its `y` stayed put. Recompute `x/y` from the parent's bounds after any height change.
- **`await node.screenshot({ contentsOnly: false })` DOES render sibling overlays** — unlike the `get_screenshot` MCP tool, which renders the node in isolation. Use it to verify backdrop+modal composites.

**Found during v4:**

- **Per-variant default text IS achievable** — this corrects the v3 note above. You can't give a shared TEXT property different defaults per variant, but you *can* **unbind the node** (`node.componentPropertyReferences = {}`) and set `characters` literally on that variant only. Other variants keep the property. Use this wherever a variant's copy is fixed system copy; keep the binding only where the text genuinely varies per instance. Beats parking example instances next to the set.
- **A node's `type` is read from a stale proxy right after you mutate it.** Binding `slotContentId` on a FRAME converts it to a `SLOT`, but reading `frame.type` in the *same* script still returns `"FRAME"`. Re-fetch via `getNodeByIdAsync` to see `"SLOT"`. (This nearly caused a pointless "the slot didn't work" retry.)
- **An empty auto-layout frame retains its last explicit height even when set to `HUG`** — `createFrame()` starts at 100×100, so a new empty SLOT hugs to **100**, not 0. Fix: `resize(w, 40)` **then** re-apply `layoutSizingVertical = 'HUG'`; the 40 sticks for the empty component while instances still hug their real content. **Order matters** — `resize()` alone leaves it `FIXED`, which propagates into instances and **clips slot content** (this silently truncated the publish dialog's helper text until HUG was restored).
- **A COMPONENT_SET does not auto-grow when a variant gets taller.** The variant overflows the set's bounds and renders *outside* it (`clipsContent` is false), so it silently overlaps the next section on the page. Worse: an overlap check based on `set.height` **won't catch it** — the set still reports the old height. Re-fit explicitly: `set.resizeWithoutConstraints(w, Math.max(...set.children.map(c => c.y + c.height)))`, then reflow whatever sits below.
- **Adding a SLOT to an existing component is a layout change, not just an API change** — budget for re-centring every instance and reflowing the page stack (+52px here).
- **Check the token ramp before trusting a `-500` spec.** The `-100`/`-500`/`-700` triad reads as a uniform rule but isn't: warning and danger clear 3:1 at `-500` while **success doesn't** (2.05:1). Compute the ratio rather than assuming ramp parity.

**Found during v4a (all four cost real time — read these before editing a component's children):**

- **Never clone a node from one component into another.** The clone looks perfect — identical fills, strokes, opacity, `visible`, bound variables — and renders fine *in the main component*, but every **instance** paints **nothing**: `absoluteRenderBounds` returns `null` while `absoluteBoundingBox` still reserves the space (so it silently shows as a blank band). `resetOverrides()` does not repair it. **Rebuild from the target component's own children instead.**
- **`absoluteRenderBounds === null` is the tell for "occupies space but paints nothing".** It is the only cheap way to detect this class of bug — a node dump comparing fills/visibility/opacity shows *no difference at all*. Make it part of any post-edit verification.
- **Existing instances can keep a stale raster after their main component changes.** Even once the component is correct, pre-existing instances may render the old content. Diagnostic: `createInstance()` a fresh probe on the WIP page — if the probe renders correctly, the component is fine and the stale instances need **replacing** (`parent.insertChild(idx, main.createInstance())`, copy `layoutSizing*`, remove the old). Screenshots alone will lie to you here.
- **`typeof node.findAll` THROWS on a TEXT node** — it does not return `undefined`. `TypeError: node.findAll: no such property 'findAll' on TEXT node`. Guard by `node.type` against a container whitelist (`FRAME/GROUP/COMPONENT/COMPONENT_SET/INSTANCE/SECTION`) before calling it when iterating `page.children`.
- **A `HUG` frame can hold a stale height across a component change.** `122:890`'s `content` stayed at its pre-change 920px while its children needed 986px, clipping the grid back to exactly its old height. Re-assign `layoutSizingVertical = 'HUG'` to force recompute.
- **The Admin Shell instance reports `clipsContent: false`, but its inner `Main` frame clips** — so screens *do* fold cleanly at 900px and don't spill onto the canvas. Check the inner frame, not the instance, before "fixing" a spill that isn't there.

---

## 10. Screenshots

`./Screenshots/` — 01-cover · 02-foundations · 03-components-generic · 04-components-domain · 05-admin-shell-faculty · 06-admin-setup-overview · 07-admin-timetable-draft · 08-admin-timetable-published · 09-hod-approval-detail · 10-readonly-faculty · 11-readonly-student · 12-admin-setup-subjects.

---

## Appendix A — original V1 review findings (preserved)

Retained for traceability. Verdicts per §1 / §2.

**V1 top-priority items:** (1) typography two-font system "reverses Inter-only" → **incorrect**, but its sub-point on tabular figures → **valid**; (2) HOD's Request-changes reason has nowhere to land on Admin → **valid, 🔴**; (3) two custom modals bypass Dialog → **valid**; (4) Elective vs Cross-section elective undocumented → **valid, needs decision**.

**V1 marked ✅ Solid (confirmed accurate):** all 7 colour ramps present w/ correct 50→950 scales; teal `500` = `#537977` exactly; Primary/Neutral `600` within 1 unit/channel of seeds; 5-level elevation + Focus Ring; Button 5×6=30 w/ Focus + Loading; Icon Button 3×5=15; Input 8 states; Badge 5×3=15 excluding Primary; Login Form structure incl. "contact your administrator" footer (no forgot-password); colour bindings fully tokenised, no hardcoded hex; Conflict Badge 9 variants across 3 sizes; Bulk Import Stepper 4 steps; Status Pill 5×2=10 w/ no Rejected variant (correct); Admin Shell full sidebar; HOD Shell genuinely minimal; Read-Only greeting + published timestamp; all 8 setup entity screens; skeleton + offline states; Cell Edit Drawer open-state screen; Approval Detail uses a real grid instance; Student screen greeting bug **fixed** (now "Hi, Priya S." / "PS").

**V1 lower-priority items:** delete Harmonized Palette (→ §7.2); tokenise spacing/radius/motion (→ **already done**, §1.2); confirm Icon Button needs no Loading state (`COMPONENTS.md` §A.2 lists no Loading — **correct as built**); confirm Cell Edit Drawer Informational state (→ §7.3).
