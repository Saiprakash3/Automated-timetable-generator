import type { Room } from "@/types";
import { setupApi } from "@/services/api/setup";
import { createSetupStore } from "./createSetupStore";

const store = createSetupStore<Room>({
  label: "rooms",
  list: setupApi.getRooms,
  update: setupApi.updateRoom,
  remove: setupApi.deleteRoom,
  create: setupApi.createRoom,
});

export const addRoom = store.add;
export const updateRoom = store.update;
export const removeRoom = store.remove;
export const refreshRooms = store.refresh;
export const useRoomData = store.useData;
export const useRoomsLoading = store.useIsLoading;
