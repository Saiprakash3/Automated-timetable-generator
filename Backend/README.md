# Mock Backend — Timetable Generator

A throwaway Express server implementing `API_CONTRACT.md` with in-memory-ish dummy data (persisted to `db.json` on disk, resets when you edit the file back).

**Purpose:** lets frontend development proceed against real endpoint shapes without waiting for the actual Node.js/SQL backend. When the backend developer joins, this folder is reference only — it should be discarded, not extended. Build the real backend to match `API_CONTRACT.md`, not this file's internals (e.g. real auth needs real hashing/JWT — this uses a trivial base64 token, which is intentionally not secure).

## Setup

```bash
cd mock-backend
npm install
npm start
```

Runs on `http://localhost:4000`. Frontend's `services/api/client.ts` should point its base URL here during development.

## Test logins

| identifier | password | role |
|---|---|---|
| A001 | admin123 | admin |
| H001 | hod123 | hod |
| F1023 | fac123 | faculty |
| LC004 | labco123 | lab_coordinator |
| S3021 | stu123 | student |

## What's implemented

- `POST /api/auth/login`, `/logout`, `GET /api/auth/me`
- `GET /api/timetables`, `GET /api/timetables/:id`, `GET /api/timetables/me`
- `POST /api/timetables`, `PATCH /api/timetables/:id`
- `POST /api/timetables/:id/send-for-approval`
- `POST /api/timetables/:id/approve`
- `POST /api/timetables/:id/request-changes`
- `POST /api/timetables/:id/publish`
- `POST /api/conflicts/check` (returns a fixed set of example conflicts — enough to build the Conflict Badge/drawer UI against, not real conflict-detection logic)

## What's NOT implemented (deliberately out of scope for now)

- User management / setup wizard endpoints
- Bulk import
- Real conflict-detection algorithm (the check endpoint returns canned data)
- Real security (token is just base64 of the user id — do not reuse this pattern)

See `API_CONTRACT.md` for full request/response shapes and the reasoning behind each decision baked into this contract (approval vs publish as separate steps, HOD "Request changes" language, extensible conflict taxonomy, etc).
