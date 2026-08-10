import type { LabCoordinator } from "@/types";
import { setupApi } from "@/services/api/setup";
import { createSetupStore } from "./createSetupStore";

/**
 * Backed by the `lab_coordinators` table, which did not exist until this was
 * wired up — Lab Coordinators previously lived only as a user *role* and as a
 * `lab_coordinator_id` FK on timetable entries, with no setup-time record.
 */
const store = createSetupStore<LabCoordinator>({
  label: "lab coordinators",
  list: setupApi.getLabCoordinators,
  update: setupApi.updateLabCoordinator,
  remove: setupApi.deleteLabCoordinator,
  create: setupApi.createLabCoordinator,
});

export const addLabCoordinator = store.add;
export const updateLabCoordinator = store.update;
export const removeLabCoordinator = store.remove;
export const refreshLabCoordinators = store.refresh;
export const useLabCoordinatorData = store.useData;
export const useLabCoordinatorsLoading = store.useIsLoading;
