import type { Subject } from "@/types";
import { setupApi } from "@/services/api/setup";
import { createSetupStore } from "./createSetupStore";

const store = createSetupStore<Subject>({
  label: "subjects",
  list: setupApi.getSubjects,
  update: setupApi.updateSubject,
  remove: setupApi.deleteSubject,
  create: setupApi.createSubject,
});

export const addSubject = store.add;
export const updateSubject = store.update;
export const removeSubject = store.remove;
export const refreshSubjects = store.refresh;
export const useSubjectData = store.useData;
export const useSubjectsLoading = store.useIsLoading;
