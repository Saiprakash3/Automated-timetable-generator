# Frontend Structure — Automated Timetable Generator

**Status:** Source of truth for `Frontend/`'s layout (closes `FRONTEND_DOCUMENTATION_CHECKLIST.md` §5). Written 2026-07-17, before any scaffolding exists — `Frontend/` is currently empty.

---

## 1. Tech stack

**Locked** (`PROJECT_BRIEF.md` — *"not to be revisited without critical reason"*):
- React.js

**Established by the design system** (referenced repeatedly across `FOUNDATIONS.md`, `DESIGN_PRINCIPLES.md`, `ACCESSIBILITY.md`, `DOMAIN_COMPONENTS.md`, `COMPONENTS.md`):
- **shadcn/ui** as the component baseline (Radix primitives underneath — handles most ARIA/keyboard behavior per `ACCESSIBILITY.md`)
- **Tailwind CSS** (every spacing/color/radius token in `FOUNDATIONS.md` is expressed with a Tailwind equivalent)
- **Lucide** icons (shadcn's default)

**Proposed now — not decided anywhere else, flag if you want something different:**
- **TypeScript.** `Backend/API_CONTRACT.md` is a fully-shaped contract; building against it in plain JS throws that structure away the moment it's consumed. shadcn's own CLI generates `.tsx`.
- **Vite.** The standard zero-config pairing for React + Tailwind + shadcn/ui today. Not Next.js — nothing here needs server rendering or a marketing site, it's an authenticated internal tool. Not Create React App — deprecated.
- **react-router-dom v6.** Nothing else specifies routing; this is the minimal standard choice for a role-routed SPA.

---

## 2. State management — resolving the "no Context" question

The checklist's already-resolved decision is *"Plain React hooks only, no Context/Zustand/Redux."* Taken literally, this excludes Context too — which raises a real question the checklist doesn't address: how does session/auth state reach every page without prop-drilling through three shells?

**Resolution:** a custom hook (`useSession`) built on React's own `useSyncExternalStore` — a built-in hook, not a library, not a Provider tree. A module-level object holds the session; `login()`/`logout()` mutate it and notify subscribers.

```ts
// src/hooks/useSession.ts (sketch)
type Session = { user: User | null; token: string | null };
let session: Session = { user: null, token: null };
const listeners = new Set<() => void>();

export function login(user: User, token: string) {
  session = { user, token };
  sessionStorage.setItem("session", JSON.stringify(session));
  listeners.forEach((l) => l());
}
export function logout() {
  session = { user: null, token: null };
  sessionStorage.removeItem("session");
  listeners.forEach((l) => l());
}
export function useSession() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => session
  );
}
```

Token storage is `sessionStorage` — see `FRONTEND_DOCUMENTATION_CHECKLIST.md` §1 for the reasoning. Any other genuinely cross-cutting state (none identified beyond session right now) would use the same pattern, not a new one.

---

## 3. Folder tree

```
Frontend/
├── FRONTEND_STRUCTURE.md          ← this file
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx                     ← router setup + role-based route guards
    ├── styles/
    │   └── tokens.css              ← FOUNDATIONS.md §2-9 as CSS custom properties (manual transcription, per checklist §6)
    ├── components/                 ← TYPE-BASED: generic, shadcn-derived primitives (COMPONENTS.md)
    │   ├── ui/                     ← shadcn CLI output (Button, Input, Dialog, Toast, Select, Tabs, ...)
    │   └── domain/                 ← the 13 custom components (DOMAIN_COMPONENTS.md):
    │                                  TimetableGrid (Edit + Read-Only), Cell, ConflictBadge, StatusPill,
    │                                  ReviewNote, TimestampCaption, SetupChecklistRow, SetupProgressSummary,
    │                                  CellEditDrawer, BulkImportStepper, ElectiveBasketConfig, ViewControls
    ├── layouts/                    ← the 3 shells (COMPONENTS.md §H)
    │   ├── AdminShell.tsx
    │   ├── HodShell.tsx
    │   └── ReadOnlyShell.tsx        ← shared by Faculty/Student/LabCo/HOD-as-teacher (checklist §7)
    ├── pages/                      ← ROLE-BASED (per checklist decision)
    │   ├── admin/
    │   │   ├── SetupOverview.tsx
    │   │   ├── setup/               ← 9 category screens: Faculty, Subjects, Labs, Rooms, Sections,
    │   │   │                           Time Slots, Lab Coordinators, Subject-Faculty Mapping, Elective Baskets
    │   │   └── timetable/           ← Draft (+ review-and-edit, changes-requested, 3rd-draft variants),
    │   │                              Published, Approved, Pending, Generating, Generation Failed
    │   ├── hod/
    │   │   ├── ApprovalsList.tsx
    │   │   ├── ApprovalDetail.tsx
    │   │   └── MyTimetable.tsx
    │   └── readonly/
    │       └── MyTimetable.tsx      ← ONE page, role-filtered by session — not one page per role
    ├── features/                    ← FEATURE-BASED, per checklist decision — only these two
    │   ├── conflict-checking/       ← calls POST /conflicts/check; owns severity → color mapping and
    │   │                              ConflictBadge display logic (INTERACTION_DECISIONS.md §1.3)
    │   └── scheduling-validation/   ← client-side pre-checks: lunch exclusion, lab consecutive-period
    │                                  rules, elective-basket clashes (DOMAIN_COMPONENTS.md §5.1)
    ├── hooks/                       ← TYPE-BASED: useSession, useToast, useMediaQuery, etc.
    ├── services/                    ← TYPE-BASED
    │   └── api/
    │       ├── client.ts            ← base URL + auth header + centralized 401 handling (logout + redirect)
    │       ├── auth.ts
    │       ├── timetables.ts
    │       └── conflicts.ts
    └── types/                       ← TYPE-BASED: mirrors API_CONTRACT.md shapes exactly
                                        (User, Timetable, Entry, Conflict, ConflictSeverity, WorkflowState)
```

### Why this mix (not all type-based, not all feature-based)

- **`components/`, `hooks/`, `services/`, `types/` — type-based.** Reused everywhere regardless of role; grouping by type keeps "where's the Button" a one-hop answer.
- **`pages/` — role-based.** A page belongs to exactly one role's experience; this is also how Setup/Timetable/Approvals/My-Timetable naturally cluster in the actual product.
- **`features/conflict-checking/` and `features/scheduling-validation/` — feature-based, and *only* these two.** They're the one place real logic (not just display) is genuinely cross-cutting and non-trivial — everything else is either a dumb component or a thin API call, and doesn't earn its own vertical slice.

---

## 4. Routing (proposed — needs your confirmation alongside the stack defaults in §1)

| Path | Role(s) | Shell |
|---|---|---|
| `/login` | (unauthenticated) | none |
| `/setup/*`, `/timetable` | admin | AdminShell |
| `/approvals`, `/approvals/:id`, `/my-timetable` | hod | HodShell |
| `/my-timetable` | faculty, student, lab_coordinator | ReadOnlyShell |

A single route guard reads `useSession().user.role`: redirects to `/login` if there's no session, or to the correct shell's landing page if the role doesn't match the current route group.

---

## 5. Environment variables

`.env.example` (closes part of checklist §2):

```
VITE_API_BASE_URL=http://localhost:4000/api
```

Nothing else is needed yet — no feature flags exist in current scope (Lab Coordinator ships alongside everyone else, not gated behind a flag).

---

## 6. What this document does not do

- **Doesn't scaffold the project yet** — no `npm create vite`, no `shadcn init`. That's the next concrete step, and it needs a yes/no on the TypeScript/Vite/React-Router defaults in §1 first, since those aren't established anywhere else.
- **Doesn't write component code** — components get built page-by-page once scaffolding exists.
- **Doesn't resolve the rest of checklist §2** (feature flags beyond what's noted above) **or §3** (browser support target) — untouched, still open.
