import { useSyncExternalStore, useEffect } from "react";
import { toast } from "sonner";
import { ApiError, type Dependent } from "@/services/api/client";

/**
 * Every setup category is the same store: a list read from Postgres once, and
 * an add that writes through. They used to be eight hand-rolled copies, each
 * seeded with a hardcoded sample array and each swallowing API errors with
 * `.catch(() => {})` — which is why the app looked populated while all six
 * setup tables were empty: the fallback always won and nothing ever said so.
 *
 * Two deliberate changes from that shape:
 *
 * 1. The initial list is `[]`, not sample data. An empty setup screen is the
 *    truth when the table is empty; inventing rows hides it.
 * 2. Failures surface as a toast instead of being swallowed. A silent catch
 *    turns "the backend is down" into "you have no faculty", which reads as
 *    data loss to the user.
 *
 * The store lives at module scope, so the fetch happens once per page load
 * rather than once per mounted component.
 */
export interface SetupStore<T> {
  useData: () => T[];
  /**
   * True until the first fetch settles. Callers that draw conclusions from an
   * empty list — "0 of 9 complete", "No faculty added yet" — must wait for
   * this, otherwise they assert "you have no data" during every page load and
   * then snap to the real state. That flash reads as data loss.
   */
  useIsLoading: () => boolean;
  add: (record: Omit<T, "id">) => Promise<T | null>;
  update: (id: string, record: Omit<T, "id">) => Promise<T | null>;
  /**
   * Resolves `{ ok: true }` on success, or `{ ok: false, dependents }` when the
   * server refuses because the record is still in use. Deliberately not a
   * throw: "still referenced" is an expected outcome the UI renders as a
   * dialog, not an exception (INTERACTION_DECISIONS.md §12.3).
   */
  remove: (id: string) => Promise<{ ok: boolean; message?: string; dependents?: Dependent[] }>;
  /** Re-fetch from the server, e.g. after a write made elsewhere. */
  refresh: () => Promise<void>;
}

interface SetupStoreConfig<T> {
  /** Human-readable plural, used in error copy ("Couldn't load faculty"). */
  label: string;
  list: () => Promise<T[]>;
  create: (record: Omit<T, "id"> & { id?: string }) => Promise<T>;
  /** Optional so a category with no edit/delete UI yet still compiles. */
  update?: (id: string, record: Omit<T, "id">) => Promise<T>;
  remove?: (id: string) => Promise<void>;
}

export function createSetupStore<T extends { id: string }>({
  label,
  list,
  create,
  update: updateFn,
  remove: removeFn,
}: SetupStoreConfig<T>): SetupStore<T> {
  let items: T[] = [];
  let loaded = false;
  // Distinct from `loaded`: that guards against double-fetching, this reports
  // whether the first fetch has *settled*. They differ for the whole duration
  // of the request, which is exactly the window the UI was misreading.
  let settled = false;
  const listeners = new Set<() => void>();

  function notify() {
    for (const listener of listeners) listener();
  }

  async function load() {
    // Guard set before the await so concurrent mounts can't double-fetch.
    if (loaded) return;
    loaded = true;
    try {
      items = await list();
    } catch {
      // Allow a later refresh() to retry; the failure is already visible.
      loaded = false;
      toast.error(`Couldn't load ${label}.`, {
        description: "Check that the backend is running, then reload.",
      });
    } finally {
      // Settled either way — a failed load must not leave the UI spinning
      // forever, it should fall through to the empty state with the toast.
      settled = true;
      notify();
    }
  }

  async function refresh() {
    loaded = false;
    await load();
  }

  async function add(record: Omit<T, "id">): Promise<T | null> {
    try {
      // The server assigns the id, so the record is committed to the store
      // from the response rather than from an optimistic local guess — a
      // client-invented `${Date.now()}` id would not match the row in
      // Postgres and would break any later delete/update by id.
      const created = await create(record);
      items = [...items, created];
      notify();
      return created;
    } catch {
      toast.error(`Couldn't save to ${label}.`, {
        description: "The change was not stored. Check the backend and retry.",
      });
      return null;
    }
  }

  async function update(id: string, record: Omit<T, "id">): Promise<T | null> {
    if (!updateFn) return null;
    try {
      const saved = await updateFn(id, record);
      items = items.map((i) => (i.id === id ? saved : i));
      notify();
      return saved;
    } catch {
      toast.error(`Couldn't save changes to ${label}.`, {
        description: "The record was not updated. Check the backend and retry.",
      });
      return null;
    }
  }

  async function remove(id: string): Promise<{ ok: boolean; message?: string; dependents?: Dependent[] }> {
    if (!removeFn) return { ok: false, message: "Removing isn't supported here yet." };
    try {
      await removeFn(id);
      items = items.filter((i) => i.id !== id);
      notify();
      return { ok: true };
    } catch (err) {
      // A 409 is not a failure to report as an error toast — it's the
      // documented "blocked, here's what's using it" outcome, and the caller
      // renders it as a dialog listing the dependents.
      if (err instanceof ApiError && err.code === "HAS_DEPENDENTS") {
        return { ok: false, message: err.message, dependents: err.dependents ?? [] };
      }
      toast.error(`Couldn't remove from ${label}.`, {
        description: "The record was not removed. Check the backend and retry.",
      });
      return { ok: false };
    }
  }

  function useData() {
    useEffect(() => {
      void load();
    }, []);

    return useSyncExternalStore(
      (callback) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
      },
      () => items,
    );
  }

  function useIsLoading() {
    useEffect(() => {
      void load();
    }, []);

    return useSyncExternalStore(
      (callback) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
      },
      () => !settled,
    );
  }

  return { useData, useIsLoading, add, update, remove, refresh };
}
