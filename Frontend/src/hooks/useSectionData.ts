import type { Section } from "@/types";
import { setupApi } from "@/services/api/setup";
import { createSetupStore } from "./createSetupStore";

const store = createSetupStore<Section>({
  label: "sections",
  list: setupApi.getSections,
  update: setupApi.updateSection,
  remove: setupApi.deleteSection,
  create: setupApi.createSection,
});

export const addSection = store.add;
export const updateSection = store.update;
export const removeSection = store.remove;
export const refreshSections = store.refresh;
export const useSectionData = store.useData;
export const useSectionsLoading = store.useIsLoading;
