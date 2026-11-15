/**
 * Store de sincronización. Guarda el último timestamp de pull y los cambios
 * pendientes que aún no se han subido al servidor.
 */
import { create } from 'zustand';
import type { SyncTableName, TableChanges, SyncChangesPayload } from './sync.types';

interface SyncState {
  /** Último timestamp de pull recibido del servidor (epoch ms). */
  lastPulledAt: number | null;
  /** Cambios acumulados localmente por tabla. */
  pendingChanges: Partial<Record<SyncTableName, TableChanges>>;
  /** Indica si hay una sincronización en curso. */
  syncing: boolean;
  /** Último error de sincronización. */
  lastError: string | null;

  setLastPulledAt: (ts: number | null) => void;
  addPendingChange: (table: SyncTableName, change: TableChanges) => void;
  clearPendingChanges: (tables?: SyncTableName[]) => void;
  setSyncing: (syncing: boolean) => void;
  setLastError: (error: string | null) => void;
  buildPayload: () => SyncChangesPayload;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  lastPulledAt: null,
  pendingChanges: {},
  syncing: false,
  lastError: null,

  setLastPulledAt: (ts) => set({ lastPulledAt: ts }),

  addPendingChange: (table, change) => {
    const existing = get().pendingChanges[table] || {};
    set({
      pendingChanges: {
        ...get().pendingChanges,
        [table]: {
          created: [...(existing.created ?? []), ...(change.created ?? [])],
          updated: [...(existing.updated ?? []), ...(change.updated ?? [])],
          deleted: [...(existing.deleted ?? []), ...(change.deleted ?? [])],
        },
      },
    });
  },

  clearPendingChanges: (tables) => {
    if (tables) {
      set({
        pendingChanges: Object.fromEntries(
          Object.entries(get().pendingChanges).filter(
            ([k]) => !tables.includes(k as SyncTableName)
          ),
        ),
      });
    } else {
      set({ pendingChanges: {} });
    }
  },

  setSyncing: (syncing) => set({ syncing }),

  setLastError: (error) => set({ lastError: error }),

  buildPayload: () => {
    const { pendingChanges, lastPulledAt } = get();
    const changes: Record<string, unknown> = {};
    for (const [table, tc] of Object.entries(pendingChanges)) {
      changes[table] = tc;
    }
    return { changes, lastPulledAt } as SyncChangesPayload;
  },
}));
