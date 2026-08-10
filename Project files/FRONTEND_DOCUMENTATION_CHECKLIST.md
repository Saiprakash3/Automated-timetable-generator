# Frontend Documentation Checklist

**Workflow stage:** Frontend Documentation (after Claude Design Review + Prototype Review, before Claude Code Development)

**Status:** In progress

This is the operational checklist for this stage, following the same pattern as FIGMA_BUILD_CHECKLIST.md — items are tracked here as they're resolved, with output going into the relevant doc/file.

---

## Already resolved (carried over from earlier decisions)

These don't need re-deciding — listed here so this checklist is a complete picture of the stage, not just the open items.

| Item | Decision | Where documented |
|---|---|---|
| API contract | Auth, Timetable CRUD, Conflict Check endpoints specified, with mock backend | `Backend/API_CONTRACT.md`, `Backend/mock backend/` |
| Conflict severity → color mapping | `bg=100/fg=700/border=500` per tier (danger/blocking, warning, info) | `Design System/FOUNDATIONS.md` §10.2 |
| Workflow-state → color mapping | draft=neutral, pending=warning, approved=success, **published=primary** | `Design System/FOUNDATIONS.md` §10.2 |
| Lab Coordinator shell | Shares the one Read-Only shell with Faculty/Student/HOD-as-teacher — not a 4th shell | `Design System/COMPONENTS.md` §H (built as a single shared shell in Figma) |
| Folder structure / naming | Mixed pattern — type-based for components/hooks/services/types, role-based for pages/, feature-based only for conflict-checking + scheduling-validation | Decision log |
| State management | Plain React hooks only, no Context/Zustand/Redux | Decision log |
| Responsive scope | Admin/HOD-approval desktop-only; Faculty/Student/Lab Coordinator/HOD-mobile(→Faculty view) desktop+mobile | Decision log |
| Testing strategy | Deferred to Testing stage — not decided here | Decision log |
| Component states | All 35 components have states built in Figma | Prototype/Figma |

---

## Open items for this stage

### 1. Auth / session behavior ✅ DECIDED (2026-07-17)

- [x] **Token storage: `sessionStorage`.** Not `localStorage` (would be a de facto "remember me," which is explicitly out of scope below) and not pure in-memory (loses the whole session — and any unsaved multi-step progress in Setup/Bulk-Import/Manual-Edit — on an accidental refresh, which is a real usability cost for an internal tool where that's a routine mistake). `sessionStorage` clears on tab/browser close, survives a refresh. Mock backend's token is a trivial base64 string, not a real JWT, per `Backend/mock backend/README.md` — real implementation should issue a proper signed JWT; the storage *location* decision doesn't change either way.
- [x] **Session length: 8 hours from login.** Matches a single workday for a college internal tool — long enough to cover one sitting without re-login friction, bounded rather than indefinite. Implemented in the mock server (`SESSION_TTL_MS`) so this is actually testable, not just documented.
- [x] **Mid-session expiry: silent redirect to `/login` + an explanatory toast** — *"Your session expired. Please log in again."* Not a scary error state; expiry is routine, consistent with `PATTERNS.md`'s consequence-first, no-"Oops" tone. Triggered by any `401 UNAUTHENTICATED` response from the API client (see `Frontend/FRONTEND_STRUCTURE.md`).
- [x] **ROLE_MISMATCH UI — confirmed, matches Pattern 7 exactly.** `PATTERNS.md` §7 already specifies the copy (*"This account isn't registered as [selected role]..."*) and treatment (same visual pattern as other login errors, differing only in copy). Nothing left to decide; the mock server already returns this shape.
- [x] **"Remember me": out of scope.** Consistent with the already-established no-self-service-password-reset decision (`COMPONENTS.md` §G.3 — *"Trouble logging in? Contact your administrator"* is the entire recovery path). Adding persistent remember-me would cut against that established minimalism for no corresponding need.

### 2. Environment / config
- [ ] Dev vs prod API base URL handling (`.env` convention)
- [ ] Any feature flags needed at launch (e.g. toggling Lab Coordinator module if it ships later than the rest)
- [ ] Values needed in `.env.example`

### 3. Browser support target
- [ ] Minimum supported browsers (affects whether polyfills / CSS fallbacks are needed)
- [ ] Any specific mobile browser constraints for Faculty/Student/Lab Coordinator mobile views

### 4. Component definition-of-done
- [ ] Confirm per-component "done" criteria before Claude Code Development starts, e.g.:
  - Matches Figma visually (spacing, color tokens, typography)
  - Keyboard accessible per ACCESSIBILITY.md annotation for that component
  - Responsive if the component appears in an in-scope mobile view
  - All documented states implemented (default/hover/focus/error/loading/empty/disabled as applicable)
- [ ] Decide if this is a shared checklist per component or just an implicit standard

### 5. Frontend structure reference ✅ DONE (2026-07-17) → `Frontend/FRONTEND_STRUCTURE.md`
- [x] Formalized. Folder tree, the type/role/feature-based split applied concretely, and the "no Context" state-management question resolved (a `useSyncExternalStore`-based `useSession` hook — plain React, no library, no Provider tree).
- ⚠️ Contains **proposed defaults needing your confirmation**: TypeScript, Vite, react-router-dom — none of these were established anywhere in the docs (`PROJECT_BRIEF.md`'s locked stack says only "React.js"). Flagged distinctly from the confirmed parts (shadcn/ui, Tailwind, Lucide) in the doc itself.

### 6. Design token handoff
- [x] ✅ **Both color questions resolved** (2026-07-17) — real CSS custom properties already exist in `FOUNDATIONS.md` §10.2 and are the basis of the whole Figma build: conflict severity `bg=100/fg=700/border=500` per tier; workflow-state draft=neutral/pending=warning/approved=success/**published=primary**. Checklist was simply unchecked; nothing was actually open.
- [ ] Still to decide: manual transcription vs. Figma plugin/API export into `frontend/src/styles/tokens.css`. Given the token set is small (~40 vars) and stable, manual transcription is the pragmatic default — flag if you want a scripted export instead.

### 7. Lab Coordinator shell decision
- [x] ✅ **Resolved by construction** — there is only one Read-Only Shell component in Figma, shared by Faculty/Student/Lab Coordinator/HOD-as-teacher, role-filtered by data not by a separate layout. No 4th shell needed in `layouts/`.

---

## Not in scope for this stage
(explicitly deferred, listed so nobody re-opens them here)
- Testing strategy → Testing stage
- Bulk Import Stepper / Setup Wizard endpoints → added when those screens are built
- Real conflict-detection algorithm → backend developer, post-handoff

---

## Next step
Work through sections 1–7 above. Recommend one short session per section rather than all at once, consistent with your usual documentation-first, one-decision-at-a-time pattern. Once resolved, this checklist closes out and Claude Code Development can begin.
