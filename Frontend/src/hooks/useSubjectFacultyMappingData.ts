import type { SubjectFacultyMapping } from "@/types";
import { setupApi } from "@/services/api/setup";
import { createSetupStore } from "./createSetupStore";

const store = createSetupStore<SubjectFacultyMapping>({
  label: "subject–faculty mappings",
  list: setupApi.getMappings,
  update: setupApi.updateMapping,
  remove: setupApi.deleteMapping,
  create: setupApi.createMapping,
});

export const addMapping = store.add;
export const updateMapping = store.update;
export const removeMapping = store.remove;
export const refreshMappings = store.refresh;
export const useSubjectFacultyMappingData = store.useData;
export const useMappingsLoading = store.useIsLoading;
