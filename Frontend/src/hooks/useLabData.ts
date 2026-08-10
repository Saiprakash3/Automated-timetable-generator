import type { Lab } from "@/types";
import { setupApi } from "@/services/api/setup";
import { createSetupStore } from "./createSetupStore";

const store = createSetupStore<Lab>({
  label: "labs",
  list: setupApi.getLabs,
  update: setupApi.updateLab,
  remove: setupApi.deleteLab,
  create: setupApi.createLab,
});

export const addLab = store.add;
export const updateLab = store.update;
export const removeLab = store.remove;
export const refreshLabs = store.refresh;
export const useLabData = store.useData;
export const useLabsLoading = store.useIsLoading;
