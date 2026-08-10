# Prototype Review Brief

Companion to `PROTOTYPE_CHECKLIST.md` — this is the **Phase 8 deliverable**: the sheet to keep beside you while walking a reviewer through the Figma prototype in Present mode.

Prepared 2026-07-17. Prototype lives on one page: **🎬 Prototype — All Screens** (`fileKey e1mriObARklCYTkiV5vaVa`). 52 screens · 343 links · 20 flow starting points · 0 dead-ends.

> **How to open:** Figma → the file → **Present** (▶ top-right), not edit mode. Use the flow-picker (top-left in Present) to jump between the entries named `▶`/`▷` below.

---

## 1. Presentation order (recommended)

Follow the product's own narrative — a timetable's life from login to the thing everyone else sees. Give **Flow 2 (Manual Edit)** the most time; it's the core of PS-02 and the hardest to read from static frames.

| # | Flow (Present entry) | One line — what it demonstrates | Watch for |
|---|---|---|---|
| 1 | `▶ Flow 0: Login & role routing` | One shared login serves all five roles; the selected role decides where you land. | Click the **role field** to cycle roles, then **Log In** — each role routes to a different shell. |
| 2 | `▶ Flow 1: Setup (F-01)` | First-time data entry with a guided checklist; dependencies gate what you can do. | The **Blocked** row does nothing on click *(by design)*; Bulk Import runs as a 4-step stepper. |
| 3 | `▶ Flow 2: Manual Edit + Conflicts (F-03)` | The severity model in action — Blocking truly blocks, Warning lets you override. | Open a cell → drawer; the **time-slot picker omits 12–1 lunch**; the **Lunch column does nothing** *(by design)*. |
| 4 | `▶ Flow 3: HOD Review & Approval (F-04)` | The approval gate. **The queue genuinely drains** — approve an item and it leaves, the badge counts down, at zero you reach the empty state. | This is the showpiece of the variable work. Approve or Request changes and watch the count + toast. |
| 5 | `▶ Flow 5: Draft Lifecycle` | The payoff of #4's "Request changes" — the returned draft carries HOD's reason verbatim; regenerate/gating behaviour. | Regenerate from any draft → **Destructive** confirmation. Generation is **disabled** while Pending. |
| 6 | `▶ Flow 4: Publish (F-05)` | The irreversible-action pattern with type-to-confirm framing and optional draft cleanup. | See the shortcut note (§3) — Publish is directly clickable here; the gate is not enforced. |
| 7 | `▶ Flow 6: Read-Only — My Timetable (F-08)` | What everyone else sees — the same published data, role-filtered, download-only. | Faculty cards drill into a session detail; the avatar acts as **logout** back to Login. |

**Why this order:** it's the real pipeline — Login → Setup → Edit → Approve → (returned? revise) → Publish → everyone sees it. #4 → #5 is the one seam to narrate (see §3, cross-role handoff).

---

## 2. Secondary entries (jump to these deliberately, don't expect to click into them)

These are **flow starting points**, not screens you reach mid-flow — Figma can't model a second person's session or an OS-level event mid-click, so each is its own entry:

- **Read-only variants:** `▷ Read-only: Student (mobile)`, `▷ Read-only: Lab Coordinator (mobile)`, `▷ Read-only: no assignments`, and the three `▷ Desktop 1280:` week-grid views.
- **Alt states:** `▷ Alt state: draft returned by HOD`, `3rd draft warning`, `generation failed`, `initial load skeleton`, `offline / degraded`, `elective basket config`, `login error`.

---

## 3. Known simplifications & shortcuts — **disclose these, or a reviewer will read them as design**

| What you'll see | The reality | Why |
|---|---|---|
| **Login role "dropdown" cycles on click** | Clicking the role field advances Admin→HOD→Faculty→Lab Co→Student→Admin. It is not a real menu. | The login screen has no dropdown-menu component; Figma can't type-select. The *routing* it drives is real. |
| **Publish is directly clickable** | The dialog shows a "Type Publish to confirm" field and the copy, but the **Confirm button is enabled and not gated** on it — no text validation, not even a two-state simulation. | Figma prototypes can't validate typed text. The type-to-confirm *pattern* is shown; the *enforcement* is out of scope. **This is the one place the prototype is looser than the checklist assumed.** |
| **HOD "Request changes" → Admin's returned draft is two separate entries** | Requesting changes drains the HOD queue and toasts; it does **not** click through to the Admin "Draft (changes requested)" screen. Jump to `▷ Alt state: draft returned by HOD` to show the Admin side. | Those are two people's sessions. No prototype clicks across users — this is the multi-role model, not a broken link. |
| **A modal always returns to one screen** | e.g. Send for Approval returns to the post-generation Draft even if you opened it from Review-and-Edit. | A static prototype link has one destination; it can't remember where you came from. |
| **Generation / initial load use timers** | "Generating…" auto-advances after ~2s; the skeleton resolves after ~1.5s. | Stand-ins for real async work. |
| **Some buttons don't show hover** | Generate, Regenerate, Send for approval, Publish, Log In, drawer Save/Cancel, stepper Back/Continue. | They're hand-built frames, not Button instances, so Phase 0's Interactive Components don't reach them. They navigate fine. |
| **Read-only avatar = logout** | Clicking the avatar on any read-only screen returns to Login. | Invented so those screens aren't dead ends; **logout is not a specified affordance** anywhere in the docs. |

---

## 4. Known build gaps still open (not shortcuts — genuine to-dos)

- 🟡 **Bulk Import's hidden footer buttons read "Send for approval"** — the Dialog component's default text leaking. Invisible today (footer off); wrong the moment it's enabled.
- 🟡 **Setup screens show a "Draft" status pill** even on a first-ever setup pass, where no draft exists yet (should read "No timetable yet"). Uniform, so it reads as intentional; flagged in Phase 6.
- 🟡 **`Mr. K. Rao` (Lab Coordinator) vs `Prof. K. Rao` (Faculty)** — two different people per the brief's "separate pool", but the shared initial+surname reads as one. Consider renaming one.
- 🟡 **Copy templates say "Prof. Sharma"** in `PATTERNS.md`/`ACCESSIBILITY.md`/`DOMAIN_COMPONENTS.md`, while the faculty record is **Dr. A. Sharma**. Templates, not data — but a reader may not know that.

---

## 5. What the review will check (from the checklist)

Against the same seven docs, now for motion/interaction rather than static layout:
- **`INTERACTION_DECISIONS.md`** — does the severity model behave (Blocking blocks, Warning overrides, Informational doesn't gate)?
- **`PATTERNS.md`** — does copy match templates (consequence-first, "Request changes" not "Reject")?
- **`ACCESSIBILITY.md`** — is keyboard operation visibly supported (focus states, logical order)?
- **`FOUNDATIONS.md`** — do timings match motion tokens? *(Verified on-token by script: all transitions 200ms or 300ms.)*

---

## 6. One honest caveat to open with

This prototype was **built and audited entirely by script.** Structure is provably sound — zero dead-ends, zero broken links, every transition on-token. But nobody has yet walked it in Present mode as a first-time user. If a next-click isn't obvious, or a 300ms open *feels* slow, that's the feedback this review exists to surface — it won't have been caught by the audit.
