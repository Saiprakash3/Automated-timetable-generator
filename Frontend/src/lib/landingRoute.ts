import type { Role } from "@/types";

/**
 * Post-login landing route per role — also the redirect target when a
 * logged-in user's role doesn't match the route group they've hit (App.tsx's
 * RequireRole). Shared between Login.tsx and App.tsx rather than duplicated;
 * not authoritative on its own — the backend independently validates
 * selectedRole against the credential (COMPONENTS.md §G.3's "critical
 * security note"), this only decides where to send someone afterward.
 */
export const LANDING_ROUTE: Record<Role, string> = {
  admin: "/setup",
  hod: "/approvals",
  faculty: "/my-timetable",
  lab_coordinator: "/my-timetable",
  student: "/my-timetable",
};
