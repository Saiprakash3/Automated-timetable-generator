import { api } from "./client";
import type {
  Faculty,
  Subject,
  SubjectType,
  Room,
  Lab,
  Section,
  SubjectFacultyMapping,
  LabCoordinator,
  ElectiveBasket,
  Elective,
} from "@/types";

/**
 * The backend speaks snake_case and, for several entities, a genuinely
 * different field set from the client domain model (Subject carries
 * code/department/year/weekly_lectures server-side but credits/type/
 * defaultFacultyId client-side; Room is room_number/building/is_lab vs. a
 * bare number). Earlier revisions papered over this by declaring
 * `api.get<Faculty[]>("/setup/faculty")` — a lie to the type checker, since
 * what actually arrives is `{can_serve_as_lab_coordinator}` and every
 * camelCase read comes back `undefined`. It never surfaced only because the
 * tables were empty and the mock fallback always won.
 *
 * So: DTO types describe what the wire really carries, and explicit mappers
 * convert. The mappers are the single place the two shapes are reconciled.
 */

// ---------- DTOs (exactly what the API returns) ----------

interface FacultyDto {
  id: string;
  name: string;
  department: string;
  can_serve_as_lab_coordinator: boolean;
  can_teach_subject_ids: string[] | null;
}

interface SubjectDto {
  id: string;
  code: string;
  name: string;
  department: string;
  year: number;
  weekly_lectures: number;
  requires_lab: boolean;
  credits: number | null;
  subject_type: string | null;
  default_faculty_id: string | null;
}

interface RoomDto {
  id: string;
  room_number: string;
  building: string;
  capacity: number;
  is_lab: boolean;
}

interface LabDto {
  id: string;
  name: string;
  department: string;
  capacity: number;
  room: string | null;
  equipment: string | null;
  available: boolean;
}

interface SectionDto {
  id: string;
  year: number;
  name: string;
  department: string;
  student_count: number | null;
}

interface MappingDto {
  id: string;
  subject_id: string;
  faculty_id: string;
  section_id: string;
}

interface LabCoordinatorDto {
  id: string;
  name: string;
  department: string;
  lab_ids: string[];
}

interface ElectiveDto {
  id: string;
  subject_id: string;
  faculty_id: string;
  room_id: string;
}

interface ElectiveBasketDto {
  id: string;
  name: string;
  year: number;
  period: number;
  section_ids: string[];
  electives: ElectiveDto[];
}

// ---------- DTO -> domain ----------

const toFaculty = (d: FacultyDto): Faculty => ({
  id: d.id,
  name: d.name,
  department: d.department,
  canServeAsLabCoordinator: d.can_serve_as_lab_coordinator ?? false,
  // NULL from a pre-existing row becomes [] — which conflict #18 reads as
  // "unrestricted", not "teaches nothing". See the type's own note.
  canTeachSubjectIds: d.can_teach_subject_ids ?? [],
});

const toSubject = (d: SubjectDto): Subject => ({
  id: d.id,
  name: d.name,
  code: d.code,
  // `credits` drives the generator's period budget, so a null must not become
  // NaN downstream — fall back to the server's weekly_lectures, then to 1.
  credits: d.credits ?? d.weekly_lectures ?? 1,
  type: (d.subject_type as SubjectType | null) ?? (d.requires_lab ? "lab" : "regular"),
  defaultFacultyId: d.default_faculty_id ?? "",
});

const toRoom = (d: RoomDto): Room => ({
  id: d.id,
  number: d.room_number,
  capacity: d.capacity,
});

const toLab = (d: LabDto): Lab => ({
  id: d.id,
  name: d.name,
  room: d.room ?? "",
  capacity: d.capacity,
  equipment: d.equipment ?? "",
  // Defaulting a null to `true` rather than `false`: a lab with no explicit
  // flag is usable, and defaulting to false would silently empty the
  // generator's lab pool.
  available: d.available ?? true,
});

const toSection = (d: SectionDto): Section => ({
  id: d.id,
  year: d.year,
  name: d.name,
  studentCount: d.student_count ?? 0,
});

const toMapping = (d: MappingDto): SubjectFacultyMapping => ({
  id: d.id,
  subjectId: d.subject_id,
  facultyId: d.faculty_id,
  sectionId: d.section_id,
});

const toLabCoordinator = (d: LabCoordinatorDto): LabCoordinator => ({
  id: d.id,
  name: d.name,
  department: d.department,
  labIds: d.lab_ids ?? [],
});

const toElective = (d: ElectiveDto): Elective => ({
  id: d.id,
  subjectId: d.subject_id,
  facultyId: d.faculty_id,
  roomId: d.room_id,
});

const toElectiveBasket = (d: ElectiveBasketDto): ElectiveBasket => ({
  id: d.id,
  name: d.name,
  year: d.year,
  period: d.period,
  sectionIds: d.section_ids ?? [],
  electives: (d.electives ?? []).map(toElective),
});

// ---------- domain -> DTO (create payloads) ----------

const fromFaculty = (f: Omit<Faculty, "id"> & { id?: string }) => ({
  id: f.id,
  name: f.name,
  department: f.department,
  can_serve_as_lab_coordinator: f.canServeAsLabCoordinator,
  can_teach_subject_ids: f.canTeachSubjectIds,
});

const fromSubject = (s: Omit<Subject, "id"> & { id?: string }) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  credits: s.credits,
  subject_type: s.type,
  default_faculty_id: s.defaultFacultyId || null,
  // Kept in sync so server-side consumers that read the original columns
  // (conflict detection, generation) still see coherent values.
  weekly_lectures: s.credits,
  requires_lab: s.type === "lab",
});

const fromRoom = (r: Omit<Room, "id"> & { id?: string }) => ({
  id: r.id,
  room_number: r.number,
  capacity: r.capacity,
});

const fromLab = (l: Omit<Lab, "id"> & { id?: string }) => ({
  id: l.id,
  name: l.name,
  capacity: l.capacity,
  room: l.room,
  equipment: l.equipment,
  available: l.available,
});

const fromSection = (s: Omit<Section, "id"> & { id?: string }) => ({
  id: s.id,
  year: s.year,
  name: s.name,
  student_count: s.studentCount,
});

const fromMapping = (m: Omit<SubjectFacultyMapping, "id"> & { id?: string }) => ({
  id: m.id,
  subject_id: m.subjectId,
  faculty_id: m.facultyId,
  section_id: m.sectionId,
});

const fromLabCoordinator = (c: Omit<LabCoordinator, "id"> & { id?: string }) => ({
  id: c.id,
  name: c.name,
  department: c.department,
  lab_ids: c.labIds,
});

const fromElectiveBasket = (b: Omit<ElectiveBasket, "id"> & { id?: string }) => ({
  id: b.id,
  name: b.name,
  year: b.year,
  period: b.period,
  section_ids: b.sectionIds,
  electives: b.electives.map((e) => ({
    id: e.id,
    subject_id: e.subjectId,
    faculty_id: e.facultyId,
    room_id: e.roomId,
  })),
});

export const setupApi = {
  // Faculty
  getFaculty: () => api.get<FacultyDto[]>("/setup/faculty").then((r) => r.map(toFaculty)),
  createFaculty: (body: Omit<Faculty, "id"> & { id?: string }) =>
    api.post<FacultyDto>("/setup/faculty", fromFaculty(body)).then(toFaculty),
  updateFaculty: (id: string, body: Omit<Faculty, "id">) =>
    api.put<FacultyDto>(`/setup/faculty/${id}`, fromFaculty({ ...body, id })).then(toFaculty),
  deleteFaculty: (id: string) => api.delete<void>(`/setup/faculty/${id}`),

  // Subjects
  getSubjects: () => api.get<SubjectDto[]>("/setup/subjects").then((r) => r.map(toSubject)),
  createSubject: (body: Omit<Subject, "id"> & { id?: string }) =>
    api.post<SubjectDto>("/setup/subjects", fromSubject(body)).then(toSubject),
  updateSubject: (id: string, body: Omit<Subject, "id">) =>
    api.put<SubjectDto>(`/setup/subjects/${id}`, fromSubject({ ...body, id })).then(toSubject),
  deleteSubject: (id: string) => api.delete<void>(`/setup/subjects/${id}`),

  // Rooms
  getRooms: () => api.get<RoomDto[]>("/setup/rooms").then((r) => r.map(toRoom)),
  createRoom: (body: Omit<Room, "id"> & { id?: string }) =>
    api.post<RoomDto>("/setup/rooms", fromRoom(body)).then(toRoom),
  updateRoom: (id: string, body: Omit<Room, "id">) =>
    api.put<RoomDto>(`/setup/rooms/${id}`, fromRoom({ ...body, id })).then(toRoom),
  deleteRoom: (id: string) => api.delete<void>(`/setup/rooms/${id}`),

  // Labs
  getLabs: () => api.get<LabDto[]>("/setup/labs").then((r) => r.map(toLab)),
  createLab: (body: Omit<Lab, "id"> & { id?: string }) =>
    api.post<LabDto>("/setup/labs", fromLab(body)).then(toLab),
  updateLab: (id: string, body: Omit<Lab, "id">) =>
    api.put<LabDto>(`/setup/labs/${id}`, fromLab({ ...body, id })).then(toLab),
  deleteLab: (id: string) => api.delete<void>(`/setup/labs/${id}`),

  // Sections
  getSections: () => api.get<SectionDto[]>("/setup/sections").then((r) => r.map(toSection)),
  createSection: (body: Omit<Section, "id"> & { id?: string }) =>
    api.post<SectionDto>("/setup/sections", fromSection(body)).then(toSection),
  updateSection: (id: string, body: Omit<Section, "id">) =>
    api.put<SectionDto>(`/setup/sections/${id}`, fromSection({ ...body, id })).then(toSection),
  deleteSection: (id: string) => api.delete<void>(`/setup/sections/${id}`),

  // Subject-Faculty Mappings
  getMappings: () => api.get<MappingDto[]>("/setup/mappings").then((r) => r.map(toMapping)),
  createMapping: (body: Omit<SubjectFacultyMapping, "id"> & { id?: string }) =>
    api.post<MappingDto>("/setup/mappings", fromMapping(body)).then(toMapping),
  updateMapping: (id: string, body: Omit<SubjectFacultyMapping, "id">) =>
    api.put<MappingDto>(`/setup/mappings/${id}`, fromMapping({ ...body, id })).then(toMapping),
  deleteMapping: (id: string) => api.delete<void>(`/setup/mappings/${id}`),

  // Lab Coordinators
  getLabCoordinators: () =>
    api.get<LabCoordinatorDto[]>("/setup/lab-coordinators").then((r) => r.map(toLabCoordinator)),
  createLabCoordinator: (body: Omit<LabCoordinator, "id"> & { id?: string }) =>
    api
      .post<LabCoordinatorDto>("/setup/lab-coordinators", fromLabCoordinator(body))
      .then(toLabCoordinator),
  updateLabCoordinator: (id: string, body: Omit<LabCoordinator, "id">) =>
    api.put<LabCoordinatorDto>(`/setup/lab-coordinators/${id}`, fromLabCoordinator({ ...body, id })).then(toLabCoordinator),
  deleteLabCoordinator: (id: string) => api.delete<void>(`/setup/lab-coordinators/${id}`),

  // Elective Baskets
  getElectiveBaskets: () =>
    api.get<ElectiveBasketDto[]>("/setup/elective-baskets").then((r) => r.map(toElectiveBasket)),
  createElectiveBasket: (body: Omit<ElectiveBasket, "id"> & { id?: string }) =>
    api
      .post<ElectiveBasketDto>("/setup/elective-baskets", fromElectiveBasket(body))
      .then(toElectiveBasket),
  updateElectiveBasket: (id: string, body: Omit<ElectiveBasket, "id">) =>
    api
      .put<ElectiveBasketDto>(`/setup/elective-baskets/${id}`, fromElectiveBasket({ ...body, id }))
      .then(toElectiveBasket),
  deleteElectiveBasket: (id: string) => api.delete<void>(`/setup/elective-baskets/${id}`),
};
