import type { ElectiveBasket } from "@/types";
import { setupApi } from "@/services/api/setup";
import { createSetupStore } from "./createSetupStore";

/**
 * Backed by the `elective_baskets` + `electives` tables, which did not exist
 * until this was wired up — a basket previously survived only as the `basket`
 * string column on generated timetable entries, so the configuration itself
 * had nowhere to live. The nested electives are created with the basket in a
 * single request (see setupApi.createElectiveBasket).
 */
const store = createSetupStore<ElectiveBasket>({
  label: "elective baskets",
  list: setupApi.getElectiveBaskets,
  create: setupApi.createElectiveBasket,
  update: setupApi.updateElectiveBasket,
  remove: setupApi.deleteElectiveBasket,
});

export const addElectiveBasket = store.add;
export const updateElectiveBasket = store.update;
export const removeElectiveBasket = store.remove;
export const refreshElectiveBaskets = store.refresh;
export const useElectiveBasketData = store.useData;
export const useElectiveBasketsLoading = store.useIsLoading;
