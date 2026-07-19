import type { TimetableEntry, User, Faculty, LabCoordinator } from "@/types";

/**
 * F-08's "resolved read-only schedule for the logged-in user." The real
 * API contract (`GET /timetables/me`) resolves this server-side by matching
 * `entry.facultyId`/`entry.labCoordinatorId` directly against the
 * authenticated user's own id — that only works when Faculty/Lab
 * Coordinator records ARE user accounts. In this project they aren't: the
 * mock backend's auth accounts (F1023 "Dr. Ramesh Kumar", H001 "Dr. Lakshmi
 * Prasad", etc.) are a separate identity space from the Setup-side sample
 * data generated for this build (Sharma/Iyer/Nair/Gupta/Rao as Faculty;
 * K. Srinivas/Dr. Anitha Rao/etc. as Lab Coordinators) — a known,
 * documented mismatch (see the Lab Coordinators build notes). The one
 * property that CAN coincidentally line up is a person's name, so that's
 * what this matches on. Logging in as a real seeded account whose name
 * doesn't happen to match anything in Setup's sample data (most of them)
 * correctly falls through to the "No assignments" empty state — that's
 * honest given the data, not a bug.
 */
export function resolveMyEntries(
  user: User,
  entries: TimetableEntry[],
  faculty: Faculty[],
  coordinators: LabCoordinator[],
): TimetableEntry[] {
  if (user.role === "student") {
    if (user.year == null || !user.section) return [];
    const label = `${user.year}${user.section}`;
    return entries.filter((e) => e.section === label || e.sections?.includes(label));
  }

  if (user.role === "lab_coordinator") {
    const match = coordinators.find((c) => c.name === user.name);
    if (!match) return [];
    return entries.filter((e) => e.labCoordinatorId === match.id);
  }

  // faculty and hod (HOD teaches too, per PROJECT_BRIEF.md).
  const match = faculty.find((f) => f.name === user.name);
  if (!match) return [];
  return entries.filter((e) => e.facultyId === match.id);
}
