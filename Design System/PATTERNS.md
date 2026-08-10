# Patterns

Status: Draft
Version: v0.1
Owner: Sai Prakash
Created: 2026-07-13
Last updated: 2026-07-13
Related tasks: TASK-DS-001
Evidence status: Category B. Patterns are grounded in the principles and audit findings referenced throughout, but the specific patterns and copy templates below are design judgments, not user-tested. Copy is written in the tone documented in §Overall voice below.

---

## Purpose

Specify repeated interaction patterns and messaging that appear across multiple components and flows. Where `COMPONENTS.md` and `DOMAIN_COMPONENTS.md` define *what* things look like, this document defines *how* they behave in common situations and *what* they say.

Six pattern categories are covered:
1. Destructive and irreversible confirmations
2. Live validation feedback
3. Bulk import error handling
4. Read-only ↔ editable state transitions
5. Empty and loading state patterns
6. Status transitions (Draft → Pending → Approved → Published)

Plus overall voice/tone guidance and reusable copy templates.

---

## Overall voice

Every message in the system follows the same voice principles. These aren't decorative — inconsistent voice creates the same "different products under one roof" problem Principle 4 addresses.

**Direct, not chatty.** "Faculty added." Not "Great! We've added the faculty successfully."

**Concrete, not abstract.** Name the specific thing. "Cannot save — Prof. Sharma is already teaching in this slot." Not "Cannot save due to a scheduling conflict."

**Neutral, not corporate.** No exclamation marks. No "Oops!" No "Uh oh." No apologies for things that aren't errors.

**Consequence-first for actions.** "This will replace the currently published timetable." Not "Are you sure you want to publish?"

**Active, not passive.** "The system found 3 gaps." Not "3 gaps were found."

**Sentence case, not title case.** Everything sentence-cased except product names and proper nouns.

**No emojis.** This is an academic administrative tool.

---

## Pattern 1 — Destructive and irreversible confirmations

Two-tier system reflecting Principle 2 and `INTERACTION_DECISIONS.md` §1.3.

### 1.1 Destructive (delete, remove)

**Uses:** Confirmation Dialog (**Destructive** variant).

> **Renamed 2026-07-17** — was *"Reversible destructive"*. Two things forced it. The variant reference collided with `COMPONENTS.md` D.3, which defines **Reversible** as `--info-500` + a **Primary** confirm (right for a non-destructive confirm like §6.2's "Request changes") while this pattern needs a warning triangle + Destructive confirm — D.3 now carries a dedicated **Destructive** variant for this family. And once the re-add promise was dropped, nothing about this pattern was "reversible" any more. The name now matches the variant it uses.

**Pattern:**
- Icon: warning triangle in `--warning-500`
- Title: names the specific object being removed
- Description: names the consequence in one sentence
- Actions: "Cancel" (Secondary) + "Delete" (Destructive)

**Copy template:**
```
Title: Remove [object name]?
Description: This will remove [object] from [context].
Confirm button: Remove
Cancel button: Cancel
```

**Example:**
> Remove Prof. Sharma?
> This will remove Prof. Sharma from the faculty list.
> [Cancel] [Remove]

> **The re-add promise was dropped 2026-07-17.** The template used to end *"You can re-add it later if needed."* It was doing two jobs and failing both: as **copy** it softened the consequence, which cuts against the Overall-voice rule *"Consequence-first for actions"*; and as a **rule** it excluded the very actions this pattern is listed for — a deleted Draft timetable cannot be re-added, so §8.3's *"This cannot be undone"* contradicted the pattern it belonged to. State the consequence; don't promise reversibility this system can't guarantee.

**When to use this pattern:**
- Removing a Faculty, Subject, Lab, Room, Section
- Deleting a Draft timetable
- Removing an Elective basket

**When NOT to use this pattern:**
- Any **Publish**, or a full-term wipe/reset — those escalate to the Irreversible variant and type-to-confirm (see 1.2)

> The line between this pattern and §1.2 is now **blast radius**, not reversibility: §1.1 removes one bounded object that only Admin sees; §1.2 changes what *every* user sees, or destroys a term's work.

### 1.2 Irreversible (Publish, wipe)

**Uses:** Confirmation Dialog (**Irreversible** variant), with type-to-confirm for highest-impact actions.

> **Renamed 2026-07-17** — was *"Irreversible destructive"*. Both sub-patterns are destructive, so the word never distinguished them; what separates 1.1 from 1.2 is **blast radius** (see 1.1). Each heading now names its variant directly.

**Pattern:**
- Icon: warning triangle in `--danger-500`
- Title: names the action with impact framing
- Description: two sentences — what will happen, what cannot be undone
- Type-to-confirm input (for Publish only): user types the action word
- Actions: "Cancel" (Secondary) + Action (Destructive) — action disabled until type-to-confirm complete
- Backdrop click does NOT dismiss (only explicit Cancel does)

**Copy template — Publish:**
```
Title: Publish this timetable?
Description:
This will replace the currently published timetable and become visible to all faculty and students.
This cannot be undone.

Type "Publish" to confirm.
[input]
[Cancel] [Publish]
```

**Copy template — First-ever publish (no existing published):**
```
Title: Publish this timetable?
Description:
This will make the timetable visible to all faculty and students.
Once published, republishing later will overwrite this version — there is no history.

Type "Publish" to confirm.
[input]
[Cancel] [Publish]
```

**Behavior specifics:**
- Confirm button stays disabled until the input exactly matches "Publish" (case-sensitive).
- Cancel is always enabled.
- Escape dismisses (equivalent to Cancel).

**When to use type-to-confirm:**
- Publish (always)
- Full-term wipe / reset (if that action exists in future scope)

**When NOT to use type-to-confirm:**
- Regular delete actions — excessive friction for a single bounded removal (see 1.1)
- Reject action (HOD rejecting — see §6.2 below)

---

## Pattern 2 — Live validation feedback

Live validation is a Principle 2 core pattern. The system tells the user *at the moment of the change* whether their input works.

### 2.1 Inline field validation (forms)

**Uses:** Input, Select, and other form controls; primarily in Setup screens for single-record entry.

**Pattern:**
- Validation triggers on **blur**, not on every keystroke (avoids "invalid" flashing while user is typing)
- Exception: password strength or similar — inline on keystroke where useful
- Error appears below the field in `--destructive` color with an icon
- Field border turns `--destructive` via `--border-2`
- Success state (when validation is transformative — e.g., "this email is available") appears with green icon
- Otherwise, no success state — most valid fields just look default

**Copy template — Error:**
```
[icon] [Specific problem, one sentence, no punctuation at end]
```

**Examples:**
> ⚠ Faculty ID already exists
> ⚠ Email must include an @
> ⚠ Load limit must be between 6 and 24

**Copy template — Success (rare):**
```
[icon] [Confirmation of the specific validation]
```

**Example:**
> ✓ Faculty ID is available

### 2.2 Live conflict feedback (Cell Edit Drawer)

**Uses:** Cell Edit Drawer (Domain Component §10), on every field change.

**Pattern:**
- Every field change triggers a backend call
- Response returns list of conflicts, each with severity + type + description
- Conflict Badge (Inline variant) appears between fields with the conflict message
- Save button state adjusts:
  - Any Blocking conflict → Save disabled
  - Any Warning conflict (no Blocking) → Save enabled but requires acknowledgment
  - Informational only → Save enabled normally
- Debounce: 300ms after last keystroke to avoid over-fetching

**Copy templates by severity:**

**Blocking:**
```
Cannot save: [specific reason with named entities].
[optional: suggested alternative]
```

**Warning:**
```
Warning: [specific policy concern with named entities].
Save anyway? [Accept and continue]
```

**Informational:**
```
Note: [specific observation with named entities].
```

**Examples:**

Blocking:
> Cannot save: Prof. Sharma is already teaching CSE-B in Monday Period 3.
> Try: Prof. Iyer is available.

Warning:
> Warning: Prof. Sharma will exceed the weekly load limit (20/18 hours).
> [Accept and continue]

Informational:
> Note: This elective's subject overlaps with "Advanced Databases" in Basket B.

### 2.3 Post-save validation

**Pattern:**
- Save action always goes through the backend for authoritative validation
- If backend rejects the save (e.g., a Blocking conflict appeared between edit-time check and save-time check), show a Toast (danger variant) with the reason and keep the Drawer open

**Copy template:**
```
Could not save: [reason].
```

---

## Pattern 3 — Bulk import error handling

Bulk import handles a specific failure mode: partial validity across many rows. This pattern is only used in the Bulk Import Stepper.

### 3.1 Row-level error display

**Pattern:**
- Every row shows a status column (✓ or ✗)
- Failed rows show the specific error inline in a details column
- Failed rows can be inspected but not fixed inline — user re-uploads with corrections
- Header shows summary: "N valid, M with errors"

**Copy template for row error:**
```
Row [N]: [specific error]
```

**Examples:**
> Row 12: Faculty ID "F-045" already exists
> Row 27: Subject code is required
> Row 33: Load limit must be a number

### 3.2 Confirm-step summary

**Pattern:**
- Step 4 of the stepper shows: valid count, skipped count, breakdown by error type if useful
- Explicit acknowledgment that skipped rows will not be imported

**Copy template:**
```
[N] rows will be added.
[M] rows have errors and will not be imported. [Download error report]

[Cancel] [Import [N] rows]
```

---

## Pattern 4 — Read-only ↔ editable state transitions

Per Principle 5, read-only and editable are designed states, not variations of one component. This pattern documents when and how the system transitions between them.

### 4.1 Timetable state → view state mapping

| Timetable state | Admin sees | HOD sees | Others see |
|---|---|---|---|
| No timetable yet | Empty state + Generate CTA | Nothing (no Approvals) | Empty state |
| Draft | Edit variant | Nothing (nothing to approve yet) | Empty state (unchanged from previous published) |
| Pending HOD Approval | Read-only + locked banner ("Waiting for HOD response — edits disabled") + Generate blocked | Read-only + Approve/Request changes | Empty state (unchanged) |
| Approved | Read-only + Publish CTA visible | Read-only | Empty state (unchanged) |
| Published | Read-only (with historical implication — the current live one) + Delete draft option available | Read-only | Read-only (Read-Only shell) |

### 4.2 Transition triggers and animations

**Draft → Pending HOD Approval:**
- Trigger: Admin clicks Send for Approval + confirms. The confirm **is** the trigger — there is no external step and no "mark it complete" round-trip (§6.1, `INTERACTION_DECISIONS.md` §11)
- Grid visually locks: fields become read-only, hover states removed
- Status Pill transitions with `--duration-default` + `--ease-standard`
- Toast appears (success variant): "Sent for HOD review. Waiting for approval."

**Pending HOD Approval → Approved:**
- Trigger: HOD clicks Approve
- Admin sees status change on next visit (no live push in v1)
- HOD sees success toast + return to Approvals list

**Pending HOD Approval → Draft (Rejection):**
- Trigger: HOD clicks Reject + provides reason
- Grid becomes editable again for Admin
- Status Pill returns to Draft
- Toast (warning variant) for Admin on next visit: "HOD requested changes. See message." — *built 2026-08-01; it fires once per rejection, tracked at module scope rather than component state, since the Timetable page remounts on every navigation and component state would re-announce the same rejection each time Admin opened the screen.*

**Approved → Published:**
- Trigger: Admin clicks Publish + type-to-confirm + Publish (see Pattern 1.2)
- Grid state unchanged (already read-only in Approved)
- Status Pill transitions
- Timestamp appears next to Published label
- Toast (success): "Timetable published. Now visible to all users."

---

## Pattern 5 — Empty and loading state patterns

### 5.1 Empty states — what's expected here vs. what to do next

Per Principle 3, Empty States always tell the user what should happen. Three sub-patterns based on context.

**Zero-state (nothing yet):**
```
[Icon: empty/document]
No [things] yet
[Description: What this section is for, one sentence]
[Primary CTA: How to add the first one]
```

Example:
> [document icon]
> No faculty added yet
> Faculty need to be added before subjects can be mapped.
> [Add Faculty] [Bulk Import]

**Filter-empty (nothing matches):**
```
[Icon: search-empty]
No results
Try adjusting your filters or search terms.
[Clear filters]
```

**Waiting-for-others (things are pending):**
```
[Icon: clock]
[Specific waiting message]
[Description of who/what you're waiting on]
```

Example (HOD, no pending approvals):
> [clock icon]
> No approvals pending
> When Admin sends a timetable for review, it will appear here.

### 5.2 Loading states

**Skeleton pattern:** Used when content structure is knowable — table rows loading, cards loading, grid loading.

**Spinner pattern:** Used for actions with unknown structure — button loading state, page transitions, initial app load.

**Progress bar pattern:** Used when duration is measurable — bulk import row processing, generation with visible steps.

**Rule:** Never combine two of these for the same task. Choose the one that matches the nature of the wait.

---

## Pattern 6 — Status transitions

The 5-state timetable lifecycle (No Timetable Yet → Draft → Pending HOD Approval → Approved → Published) has specific interaction patterns beyond the visual transitions in Pattern 4.

### 6.1 Send for Approval (Draft → Pending HOD Approval)

**Uses:** Dialog (`Size=default`, 560px). See `INTERACTION_DECISIONS.md` §11.

> **The email hand-off is removed (2026-07-17, Prakash).** This pattern used to hand the Admin off to their own mail client: a **To:** field, a **[Prepare email]** action, and a *"mark it complete here"* round-trip the Admin had to finish before the status would move. All of it is gone. **Confirming now sets Pending HOD Approval directly** and locks the timetable. The HOD finds the item in their Approvals nav on next login — which is what F-04 step 1 always described, independently of any email.
>
> **This closes a hole rather than opening one.** Under the email model the status transition depended on an affordance that was never built: Admin was told to "mark it complete" with nothing to click, so **Draft → Pending had no trigger at all**. Removing the hand-off removes the need for one — the confirm *is* the trigger.
>
> ⚠️ **Known inconsistency, accepted deliberately.** §6.1 and §6.2 are now the same shape — title, description, one textarea, Cancel + confirm — but use **different components**: §6.1 a Dialog (560px), §6.2 a Confirmation Dialog (`Reversible`, 400px, textarea in its Content slot). There is no principled reason for the split. It is the existing build, kept to avoid a rebuild (Prakash, 2026-07-17). **If the two ever need to match, §6.1 is the one to move** — §6.2 proves a Confirmation Dialog hosts a textarea at 400px, and sending for approval destroys nothing, so `Reversible` would be the right variant.

**Pattern:**
- Dialog appears when Admin clicks "Send for Approval"
- Contents:
  - Reminder that sending locks the timetable from further edits until HOD responds
  - Optional note to HOD (textarea) — shown to HOD alongside the timetable (F-04 step 3)
  - Actions: Cancel + Send for approval
- On confirm: status moves **Draft → Pending HOD Approval** immediately, the timetable locks, and the success Toast fires (§4.2). No external step, no round-trip.

**Copy template:**
```
Title: Send for approval
Description:
This will lock the timetable from edits until HOD approves or requests changes.

Note to HOD (optional): [textarea]   (shown to HOD with the timetable)

[Cancel] [Send for approval]
```

### 6.2 HOD Reject action

**Uses:** Confirmation Dialog + textarea input.

**Pattern:**
- HOD clicks Reject → modal appears requiring a reason
- Reason is required (Reject button disabled until non-empty)
- On confirm: status returns to Draft, Admin sees warning toast on next visit

**Copy template:**
```
Title: Request changes to this timetable?
Description:
This will return the timetable to Draft state for Admin to revise. Please explain what needs to change.

Reason for changes (required): [textarea]

[Cancel] [Request changes]
```

Note: labeled "Request changes" rather than "Reject" throughout the UI — HOD isn't rejecting a person's work, they're asking for revisions. The underlying state transition is the same, but the language is more collaborative.

### 6.3 Regenerate warning (Draft state, existing edits)

**Uses:** Confirmation Dialog (**Destructive** variant).

> **Repointed 2026-07-17** — was *"Reversible variant with warning"*, which the 3-variant split made self-contradictory: **Reversible** is now an info circle with a Primary confirm and carries no warning at all. Regenerating destroys manual edits, which is §1.1's family — a bounded loss only Admin sees, no type-to-confirm. Hence **Destructive**. ✅ **Built 2026-07-17** — `Admin — Regenerate confirmation` on the Admin Screens page.

**Pattern:**
- If Admin clicks Regenerate while Draft has edits, warn before proceeding.

**Copy template:**
```
Title: Regenerate this timetable?
Description:
Regenerating will replace the current Draft, including any manual edits you've made.

[Cancel] [Regenerate]
```

---

## Pattern 7 — Login and credential errors

**Context:** Credentials are system-generated and issued to users, not self-registered. There is no self-service password reset — recovery happens by contacting Admin. Login is a single shared form for all 5 roles with a role-select dropdown (`COMPONENTS.md` §G.3) — this introduces a third error case beyond the original two.

**Pattern:**
- Invalid credentials: generic message, doesn't reveal whether the identifier or password was wrong (standard security practice)
- Role mismatch: valid credentials, but the selected role doesn't match the account's actual role — distinct message, since the fix is different (change the dropdown, not the password)
- Account disabled: distinct message, since this isn't a credential-guessing scenario
- No lockout after repeated failures — unlimited attempts are allowed, since there's no self-service recovery path to fall back on if an account got locked
- All cases: same visual treatment (error banner + field flagging), differing only in copy

- **Server unreachable:** the request never arrived — API down, wrong port, or the user is offline. Distinct message, because the fix is neither the password nor the role dropdown.

**Copy templates:**
```
Incorrect ID/email or password.
This account isn't registered as [selected role]. Check your role selection and try again.
This account is inactive. Contact your administrator.
Can't reach the server. Check your connection — if this continues, contact your administrator.
```

> ⚠️ **Added 2026-08-01 after this cost real debugging time.** With the API stopped, login showed the catch-all *"Something went wrong. Please try again."* Two things were wrong with it. It reads as a **credentials** failure, sitting where the other three login errors sit — so the natural conclusion is "my password is wrong" or "the backend rejected me", and the actual cause (nothing listening on the port) is invisible. And **"try again" is advice that cannot work**: an unreachable server fails identically on every retry, so the copy sends the user into a loop.
>
> `fetch` *rejects* rather than resolving when a request never reaches a server, so this never had an HTTP status or an error code to switch on and fell through to the generic branch. The API client now normalises that rejection into a typed `NETWORK_ERROR`, which means **every** caller — not just Login — can distinguish "the server said no" from "there was no server". Say what is wrong and who can fix it; never offer a retry that is guaranteed to fail.

**What this deliberately excludes:** "Forgot password?" link, self-service reset flow, security questions, email-based recovery, and any attempt-lockout mechanism. The footer line "Trouble logging in? Contact your administrator." is the entire recovery path — this is intentional given the credential model, not an oversight.

---

## Reusable copy templates (quick reference)

### Success messages
```
[Thing] added.
[Thing] updated.
[Thing] saved.
Sent for HOD review.
Timetable published.
```

### Loading messages
```
Loading...
Generating timetable...
Validating rows...
Saving...
```

### Empty states
```
No [things] yet
No results
No approvals pending
Nothing scheduled
```

### Error toasts
```
Could not save. [Specific reason.]
Something went wrong. [Try again]
Unable to load data. [Retry]
```

Never use:
- "Oops"
- "Uh oh"
- Multiple exclamation marks
- Emojis
- "Great!" / "Awesome!" / "Perfect!"
- Passive voice ("The item was saved")

---

## What this document does not decide

- Specific icons per state — Lucide icon selection is Figma-time craft (constrained by `FOUNDATIONS.md` §9).
- Backend API contracts for validation, save, conflict responses — backend developer scope.
- Specific timing values beyond what's already in `FOUNDATIONS.md` §6.
- Per-component accessibility annotations — `ACCESSIBILITY.md`.

---

## Pattern 8 — Draft lifecycle

Three specific interaction patterns govern how Admin creates, manages, and removes drafts across the timetable lifecycle.

### 8.1 Generation gating — cannot generate while Pending HOD Approval

**Trigger:** Admin attempts to generate a new timetable while status is **Pending HOD Approval**.

**Pattern:** Generation is blocked. Admin sees a Toast (danger variant) explaining why. The Generate action is also visually disabled on the Timetable screen in this state — the Toast only fires if Admin somehow reaches the action (e.g., via keyboard).

**Toast copy:**
```
Can't generate a new timetable — waiting for HOD's response. Generation is available again if HOD requests changes.
```

**When generation IS allowed:**
- First timetable ever (Setup complete, status is "No timetable yet")
- After HOD has requested changes (status returns to Draft — Admin edits existing draft OR regenerates)
- Not at any other time: Approved and Published states also block generation

> ⚠️ **The gating is built; the Toast is deliberately not.** Generate/Regenerate are **hidden** outside Draft rather than rendered-and-disabled, so there is no control left to activate — not by click, not by keyboard. The Toast as specified could only ever fire from a path that doesn't exist, so building it would add unreachable code that reads as covered behaviour. Build it if a reachable attempt is ever reintroduced (a retained keyboard shortcut, or switching the buttons from hidden to disabled).

### 8.2 Draft count — warning on 3rd draft

**Context:** Admin can hold a maximum of 2 drafts at a time (Draft 1 = original; Draft 2 = post-HOD-changes revision, kept for comparison while working). A 3rd draft is a rare but possible edge case (e.g., HOD requests changes a second time).

**Trigger:** Admin generates a timetable that would become the 3rd draft in the current cycle.

**Pattern:** Generation is not blocked (this is a soft warning, not a hard stop), but a persistent warning banner appears on the Draft screen for that 3rd draft.

**Warning banner copy (persistent, on Draft screen):**
```
This is your final draft. Review all changes carefully before resubmitting — HOD has already reviewed two versions.
```

**What this is not:** A blocking toast or a disabled Generate button. The warning appears after generation succeeds, as a banner on the resulting Draft screen — Admin is already in the draft, not stopped from getting there.

### 8.4 Draft history — empty state

**Added 2026-08-01.** The Status Pill's destination is the draft-history panel, but that panel had **no designed empty state** — it simply didn't render when there was nothing archived, so the pill pointed at a screen that wasn't there.

**Screen:** `Admin — Draft history (empty)` — Figma `548:11261`.

```
Draft history
Past drafts HOD has already reviewed, kept for comparison.

        ⏱  No drafts yet
        Currently there are no drafts. A draft is kept here once HOD
        reviews a version and you regenerate, so you can compare them.
```

The body copy names **what will populate it**, not just that it's empty. "No drafts yet" alone leaves the user unsure whether the feature is broken, unavailable to them, or simply unused — naming the trigger (HOD review → regenerate) turns an empty screen into an explanation of the draft lifecycle.

The lifecycle actions (Regenerate / Send for approval) are **not** on this view, and neither is the "Last edited …" caption — both belong to the editing screen this was cloned from. A history view acts on past drafts, not the current one.

The panel is titled **Draft history**, not "Manage drafts" — with nothing in it there is nothing to manage, and the title has to hold for both states.

See `DOMAIN_COMPONENTS.md` §1 for the consequence this has for when the Status Pill is interactive. Built in both design and frontend 2026-08-01.

### 8.3 Delete draft — confirmation dialog

**When available:** Admin can delete a draft at two points:
1. **At publish time** — the Publish confirmation screen offers Admin the option to delete existing drafts as part of the finalization step ("Clean up drafts before making this live")
2. **After publishing** — Admin can return to the Timetable area post-publish and delete drafts as a cleanup action

**What is NOT allowed:** Deleting a draft while a timetable is in Pending HOD Approval or Approved state — drafts are preserved as an audit trail during the active review cycle.

**Pattern:** Confirmation Dialog (**Destructive** variant per Pattern 1.1).

**Copy template:**
```
Title: Delete this draft?
Description: This will permanently remove Draft [N] from the timetable history. This cannot be undone.

[Cancel] [Delete draft]
```

> ✅ **Resolved 2026-07-17.** This copy's *"This cannot be undone."* used to contradict §1.1, which promised *"You can re-add it later if needed."* **§1.1 dropped the re-add promise** — so a Destructive dialog now states the consequence without claiming reversibility, and this dialog is consistent with the pattern it belongs to. It stays in §1.1's family (Destructive variant, no type-to-confirm): deleting a draft removes one bounded object only Admin sees, which is not §1.2's blast radius.

**On confirm:** Draft is removed. If this was the last remaining draft, the draft count resets to 0 — a new timetable cycle starts fresh.

**Note:** Draft count also resets to 0 whenever all drafts are deleted, regardless of whether a new timetable is generated immediately after. The count tracks how many drafts exist in the current cycle, not a lifetime total.

---

## Pattern 9 — Editing and removing a Setup record

> **Added 2026-08-01.** Setup was create-and-read only. Nine screens let Admin *add* a Faculty, Subject, Room, Lab, Section, Coordinator, Mapping, Time Slot or Elective Basket, and nothing let them **correct one**. Reported as: *"there is no edit option in each step — by mistake if admin enters wrong data he should be able to edit the entry."* Delete was half-specified: §1.1 already listed *"Removing a Faculty, Subject, Lab, Room, Section"* and gave the confirmation copy, but no screen had a control that could trigger it. This pattern supplies the missing affordance and the edit flow; §1.1 remains the authority for the removal confirmation itself.

### 9.1 The affordance

Every Setup table row ends with an Actions column — **Edit** and **Delete** Icon Buttons, always visible (`COMPONENTS.md` G.1). Not a hover reveal, not an overflow menu: see G.1's note for why.

### 9.2 Edit a record

**Uses:** the same Dialog as Add Single Record, in an Edit configuration.

Four differences from Add, and only four — reusing the Add form is the point, because a divergent edit form is how the two drift apart:

| | Add | Edit |
|---|---|---|
| Title | `Add subject` | `Edit subject` |
| Fields | empty / placeholder | **pre-filled with the current values** |
| Confirm button | `Add subject` | `Save changes` |
| On success toast | `Subject added.` | `Changes saved.` |

**Pre-filling is the whole feature.** An "edit" dialog that opens blank is a second Add dialog wearing a different title — the user cannot see what they are correcting, and any field they leave alone is silently blanked.

**Validation:** identical to Add (Pattern 2.1, inline on blur). An edit that violates a rule the record already violated is still blocked — Save is not a lower bar than Add.

> **Elective Baskets are the one exception, and only to the *container*.** A basket is built on its own full-page config screen rather than the shared dialog (F-06 — the nested "list of electives inside the basket" doesn't fit a small modal), so Edit reopens **that page** pre-filled, not a dialog: `Edit elective basket` with `Save changes`. The four deltas above still hold; only the surface differs. Figma `543:11060`, route `/setup/elective-baskets/:basketId/edit`.
>
> Two things this exception forces, both easy to get wrong:
> - **The basket's own period must stay selectable.** Conflict #12 hides periods already taken by another basket in the same year — computed naively, reopening a basket would hide its *current* slot and show the field as invalid. The basket being edited is excluded from that set.
> - **Electives are replaced wholesale on save, not diffed.** The page edits the basket as one document; a partial merge would need an identity for rows the UI never tracked. The old rows are removed via `delete-orphan`, verified to leave no orphaned electives behind.

**Cancel** discards changes and closes with no confirmation. The dialog is small, the changes are visible, and an "are you sure" on a two-field form is noise. (This differs deliberately from the Cell Edit Drawer, which holds more state.)

**On confirm:** dialog closes, the row updates in place, success Toast. The row does not re-sort or move even if the edited field is the sort key — a row jumping away from the cursor at the moment of saving reads as data loss. Re-sorting happens on the next load or an explicit re-sort.

### 9.3 Remove a record

Delete **branches on whether the record is still in use** (`INTERACTION_DECISIONS.md` §12.3, decided 2026-08-01). Clicking Delete does not always lead to the same dialog.

```
Delete clicked
   ├── no live dependents  → 9.3a  Destructive confirmation  → removed
   └── has live dependents → 9.3b  Blocked, dependents listed → not removed
```

"Live dependents" means active configuration — mappings, basket electives, coordinator↔lab links, and the current editable draft. Entries in a **published or archived** timetable do not count; see §12.4 for why (they are snapshots, and counting them would freeze Setup for the whole term).

#### 9.3a No dependents — Destructive confirmation

**Uses:** Confirmation Dialog (**Destructive** variant) — Pattern 1.1, unchanged.

```
Title: Remove [record name]?
Description: This will remove [record name] from the [category] list.

[Cancel] [Remove]
```

> Remove Data Structures?
> This will remove Data Structures from the subject list.
> [Cancel] [Remove]

#### 9.3b Has dependents — blocked, and the dependents are shown

**Uses:** Confirmation Dialog (**Reversible** variant — info icon, no destructive action). It is not a confirmation: there is nothing to confirm, so no Destructive button appears.

```
Title: Can't remove [record name]
Description: It's still used in [N] places. Reassign or remove those first.

  [ [N] [dependent type]        [identifying detail] ]
  [ [N] [dependent type]        [identifying detail] ]

[Close] [View [primary dependent type]]
```

**Example:**
> ⓘ **Can't remove Data Structures**
> It's still used in 2 places. Reassign or remove those first.
> | 2 Subject–Faculty mappings | III-CSE-A, B |
> | 1 elective basket | 3rd Year — Basket A |
> [Close] [View mappings]

Three rules make this a block rather than a dead end — a bare *"can't delete this"* is worse than the problem it prevents:

1. **List the dependents, don't just count them.** "Used in 2 places" alone sends Admin hunting across nine screens.
2. **Carry identifying detail** on each row (*which* sections, *which* basket), so the target is recognisable before navigating.
3. **The primary action navigates.** `View mappings` goes to the dependent, filtered to this record where possible. Close is the secondary. The exit from a block is a route onward, not dismissal.

When more than one dependent type exists, the primary action targets the largest group; the rest are reachable from their listed rows.

**Figma:** blocked state `529:10812`; destructive state `523:11413`.

### 9.4 What is not editable

Row actions appear only on records Admin owns in Setup. They do **not** appear on:

- **Time Slot Grid** — the one Setup screen deliberately excluded. `INTERACTION_DECISIONS.md` §8.1 settled the daily schedule as *"a fixed college-wide constant — not configurable by Admin through the Time Slot Grid setup screen"* (confirmed 2026-07-16). Putting Edit/Delete on those rows would offer control the system does not grant, and would let Admin delete the Lunch break — which §8.2's lab-placement rules depend on. The screen stays a read-only reference. Its own open question (keep as reference vs. drop from Setup entirely) is unchanged by this pattern.
- **Generated timetable entries** — edited through the Cell Edit Drawer (§10), which enforces conflict rules the Setup form has no concept of.
- **Read-only role views**, which have no mutating actions at all.

> The general rule: a row gets Edit/Delete when Admin *authored* the record. Where the data is a constant the product asserts, showing an edit control is a false affordance — the same class of bug as the un-clickable Status Pill (`DOMAIN_COMPONENTS.md` §1), just inverted.
