export type Role = "admin" | "hod" | "faculty" | "lab_coordinator" | "student";

export interface User {
  id: string;
  name: string;
  role: Role;
  department: string;
  /** Student accounts only — db.json carries these, and the mock backend
   *  now actually sends them (previously stripped in the login/me response;
   *  see Backend/mock-backend/server.js). Used to filter My Timetable to
   *  the student's own section. */
  year?: number;
  section?: string;
}

/** Display labels for the role select — COMPONENTS.md §G.3's exact ordering. */
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  hod: "HOD",
  faculty: "Faculty",
  lab_coordinator: "Lab Coordinator",
  student: "Student",
};

export const ROLE_OPTIONS = Object.keys(ROLE_LABELS) as Role[];
