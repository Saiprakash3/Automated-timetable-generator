import { api } from "./client";
import type { Faculty, Subject, Room, Lab, Section } from "@/types";

export interface SubjectFacultyMapping {
  id: string;
  subject_id: string;
  faculty_id: string;
  section_id: string;
}

export interface CreateSubjectPayload {
  id?: string;
  code: string;
  name: string;
  department?: string;
  year?: number;
  weekly_lectures?: number;
  requires_lab?: boolean;
  credits?: number;
  type?: string;
  defaultFacultyId?: string;
}

export interface CreateFacultyPayload {
  id?: string;
  name: string;
  department?: string;
  can_serve_as_lab_coordinator?: boolean;
}

export const setupApi = {
  // Faculty
  getFaculty: () => api.get<Faculty[]>("/setup/faculty"),
  createFaculty: (body: CreateFacultyPayload) => api.post<Faculty>("/setup/faculty", body),
  deleteFaculty: (id: string) => api.post<void>(`/setup/faculty/${id}`),

  // Subjects
  getSubjects: () => api.get<Subject[]>("/setup/subjects"),
  createSubject: (body: CreateSubjectPayload) => api.post<Subject>("/setup/subjects", body),

  // Rooms
  getRooms: () => api.get<Room[]>("/setup/rooms"),
  createRoom: (body: Omit<Room, "id"> & { id?: string }) => api.post<Room>("/setup/rooms", body),

  // Labs
  getLabs: () => api.get<Lab[]>("/setup/labs"),
  createLab: (body: Omit<Lab, "id"> & { id?: string }) => api.post<Lab>("/setup/labs", body),

  // Sections
  getSections: () => api.get<Section[]>("/setup/sections"),
  createSection: (body: Omit<Section, "id"> & { id?: string }) => api.post<Section>("/setup/sections", body),

  // Mappings
  getMappings: () => api.get<SubjectFacultyMapping[]>("/setup/mappings"),
  createMapping: (body: Omit<SubjectFacultyMapping, "id"> & { id?: string }) =>
    api.post<SubjectFacultyMapping>("/setup/mappings", body),
};
