import { api } from "./client";
import type { Faculty, Subject, Room, Lab, Section } from "@/types";

export interface SubjectFacultyMapping {
  id: string;
  subject_id: string;
  faculty_id: string;
  section_id: string;
}

export const setupApi = {
  // Faculty
  getFaculty: () => api.get<Faculty[]>("/setup/faculty"),
  createFaculty: (body: Omit<Faculty, "id"> & { id?: string }) => api.post<Faculty>("/setup/faculty", body),
  deleteFaculty: (id: string) => api.post<void>(`/setup/faculty/${id}`),

  // Subjects
  getSubjects: () => api.get<Subject[]>("/setup/subjects"),
  createSubject: (body: Omit<Subject, "id"> & { id?: string }) => api.post<Subject>("/setup/subjects", body),

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
