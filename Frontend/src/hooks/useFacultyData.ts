import type { Faculty } from "@/types";
import { setupApi } from "@/services/api/setup";
import { createSetupStore } from "./createSetupStore";

const store = createSetupStore<Faculty>({
  label: "faculty",
  list: setupApi.getFaculty,
  update: setupApi.updateFaculty,
  remove: setupApi.deleteFaculty,
  create: setupApi.createFaculty,
});

export const addFaculty = store.add;
export const updateFaculty = store.update;
export const removeFaculty = store.remove;
export const refreshFaculty = store.refresh;
export const useFacultyData = store.useData;
export const useFacultyLoading = store.useIsLoading;
