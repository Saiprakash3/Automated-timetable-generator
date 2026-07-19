import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { Toaster } from "@/components/ui/sonner";
import { LANDING_ROUTE } from "@/lib/landingRoute";
import type { Role } from "@/types";
import Login from "@/pages/Login";
import AdminShell from "@/layouts/AdminShell";
import SetupOverview from "@/pages/admin/SetupOverview";
import FacultySetup from "@/pages/admin/setup/Faculty";
import SubjectsSetup from "@/pages/admin/setup/Subjects";
import RoomsSetup from "@/pages/admin/setup/Rooms";
import LabsSetup from "@/pages/admin/setup/Labs";
import SectionsSetup from "@/pages/admin/setup/Sections";
import TimeSlotsSetup from "@/pages/admin/setup/TimeSlots";
import LabCoordinatorsSetup from "@/pages/admin/setup/LabCoordinators";
import SubjectFacultyMappingSetup from "@/pages/admin/setup/SubjectFacultyMapping";
import ElectiveBasketsSetup from "@/pages/admin/setup/ElectiveBaskets";
import ElectiveBasketConfig from "@/pages/admin/setup/ElectiveBasketConfig";
import TimetableGenerate from "@/pages/admin/timetable/Generate";
import HodShell from "@/layouts/HodShell";
import HodApprovals from "@/pages/hod/Approvals";
import HodApprovalDetail from "@/pages/hod/ApprovalDetail";
import ReadOnlyShell from "@/layouts/ReadOnlyShell";
import MyTimetable from "@/pages/readonly/MyTimetable";

/**
 * Route guard, as a layout route (renders <Outlet /> when authenticated
 * instead of taking children) — lets AdminShell nest underneath it while
 * still getting its own Outlet for pages. Redirects to /login if there's
 * no session.
 */
function RequireAuth() {
  const { user } = useSession();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/**
 * Role-vs-route-group mismatch guard — every shell now has a real landing
 * page (LANDING_ROUTE), so a mismatched role (e.g. a Faculty account
 * hitting /setup) redirects there instead of rendering a shell that isn't
 * theirs. Nested under RequireAuth, so `user` is always set here; the null
 * check is pure TS narrowing, not a real path (RequireAuth already handles
 * "not logged in").
 */
function RequireRole({ allow }: { allow: Role[] }) {
  const { user } = useSession();
  if (!user) return null;
  if (!allow.includes(user.role)) return <Navigate to={LANDING_ROUTE[user.role]} replace />;
  return <Outlet />;
}

/** Placeholder for a route that's real (linkable from the sidebar) but not built yet. */
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h1 className="font-heading text-h1 font-semibold text-foreground">{title}</h1>
      <p className="font-body text-muted-foreground">Not built yet — coming soon.</p>
    </div>
  );
}

/** Distinguishes a genuinely unmatched URL from "not logged in" — an
 *  authenticated user hitting a typo'd link shouldn't look logged out. */
function NotFound() {
  const { user } = useSession();
  if (!user) return <Navigate to="/login" replace />;
  return <ComingSoon title="Page not found" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<RequireRole allow={["admin"]} />}>
            <Route element={<AdminShell />}>
              <Route path="/setup" element={<SetupOverview />} />
              <Route path="/setup/faculty" element={<FacultySetup />} />
              <Route path="/setup/subjects" element={<SubjectsSetup />} />
              <Route path="/setup/rooms" element={<RoomsSetup />} />
              <Route path="/setup/labs" element={<LabsSetup />} />
              <Route path="/setup/sections" element={<SectionsSetup />} />
              <Route path="/setup/time-slots" element={<TimeSlotsSetup />} />
              <Route path="/setup/lab-coordinators" element={<LabCoordinatorsSetup />} />
              <Route path="/setup/subject-faculty-mapping" element={<SubjectFacultyMappingSetup />} />
              <Route path="/setup/elective-baskets" element={<ElectiveBasketsSetup />} />
              <Route path="/setup/elective-baskets/new" element={<ElectiveBasketConfig />} />
              <Route path="/setup/:category" element={<ComingSoon title="Setup category" />} />
              <Route path="/timetable" element={<TimetableGenerate />} />
            </Route>
          </Route>

          <Route element={<RequireRole allow={["hod"]} />}>
            <Route element={<HodShell />}>
              <Route path="/approvals" element={<HodApprovals />} />
              <Route path="/approvals/:id" element={<HodApprovalDetail />} />
            </Route>
          </Route>

          {/* Faculty / Student / Lab Coordinator / HOD-on-mobile all land here — one
              page, role-filtered by session (FRONTEND_STRUCTURE.md §3, checklist §7).
              HOD is included: HOD also teaches and reads their own schedule here. */}
          <Route element={<RequireRole allow={["faculty", "student", "lab_coordinator", "hod"]} />}>
            <Route element={<ReadOnlyShell />}>
              <Route path="/my-timetable" element={<MyTimetable />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
