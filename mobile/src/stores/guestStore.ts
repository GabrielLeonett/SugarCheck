import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const GUEST_STORAGE_KEY = 'sugarcheck_guest_v1';

export interface GuestProfile {
  id: string;
  name: string;
  weight: number;
  height: number;
  sex: string;
  birthDate: string;
  emergencyContact: {
    id: string;
    name: string;
    relationship: string;
    phone: string;
  };
  goal: string;
  glucoseRange: {
    hypo: number;
    hyper: number;
  };
  avatar: string;
  createdAt: string;
}

export interface GuestRecord {
  id: string;
  createdAt: string;
  [key: string]: string | number | null;
}

export interface GuestRecords {
  glucose: GuestRecord[];
  hba1c: GuestRecord[];
  insulin: GuestRecord[];
  physical: GuestRecord[];
}

interface PersistedGuestState {
  profile: GuestProfile | null;
  records: GuestRecords;
  caminoProgress: number;
  isGuestMode: boolean;
  pendingImport: boolean;
}

interface GuestState extends PersistedGuestState {
  hydrate: () => Promise<void>;
  startGuest: (profile: GuestProfile) => Promise<void>;
  updateProfile: (profile: GuestProfile) => Promise<void>;
  setGuestMode: (enabled: boolean) => Promise<void>;
  beginAccountSession: () => Promise<void>;
  setPendingImport: (pending: boolean) => Promise<void>;
  setCaminoProgress: (level: number) => Promise<void>;
  saveRecord: (bucket: keyof GuestRecords, record: GuestRecord) => Promise<void>;
  clearGuestData: () => Promise<void>;
}

const emptyRecords = (): GuestRecords => ({
  glucose: [],
  hba1c: [],
  insulin: [],
  physical: [],
});

export const createGuestId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

const persist = async (state: PersistedGuestState): Promise<void> => {
  await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state));
};

const initialState: PersistedGuestState = {
  profile: null,
  records: emptyRecords(),
  caminoProgress: 0,
  isGuestMode: false,
  pendingImport: false,
};

export const useGuestStore = create<GuestState>((set, get) => ({
  ...initialState,

  hydrate: async () => {
    const stored = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
    if (!stored) return;

    const parsed: Partial<PersistedGuestState> = JSON.parse(stored);
    const hydrated: PersistedGuestState = {
      profile: parsed.profile ?? null,
      records: { ...emptyRecords(), ...parsed.records },
      caminoProgress: typeof parsed.caminoProgress === 'number' && Number.isInteger(parsed.caminoProgress)
        ? parsed.caminoProgress
        : 0,
      isGuestMode: parsed.isGuestMode === true && parsed.profile != null,
      pendingImport: parsed.pendingImport === true,
    };
    set(hydrated);
  },

  startGuest: async (profile) => {
    const bmi = profile.weight / ((profile.height / 100) ** 2);
    const initialPhysicalRecord: GuestRecord = {
      id: profile.id,
      peso: profile.weight,
      altura: profile.height,
      imcValue: Number(bmi.toFixed(1)),
      categoria: bmi < 18.5 ? 'Bajo peso' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Sobrepeso' : 'Obesidad',
      fecha: profile.createdAt,
      createdAt: profile.createdAt,
    };
    const records = {
      ...get().records,
      physical: [
        initialPhysicalRecord,
        ...get().records.physical.filter((record) => record.id !== profile.id),
      ],
    };
    const next = { ...get(), profile, records, isGuestMode: true, pendingImport: false };
    const persisted: PersistedGuestState = {
      profile: next.profile,
      records: next.records,
      caminoProgress: next.caminoProgress,
      isGuestMode: next.isGuestMode,
      pendingImport: next.pendingImport,
    };
    await persist(persisted);
    set(persisted);
  },

  updateProfile: async (profile) => {
    const next = { ...get(), profile };
    const persisted: PersistedGuestState = {
      profile: next.profile,
      records: next.records,
      caminoProgress: next.caminoProgress,
      isGuestMode: next.isGuestMode,
      pendingImport: next.pendingImport,
    };
    await persist(persisted);
    set(persisted);
  },

  setGuestMode: async (enabled) => {
    const next = { ...get(), isGuestMode: enabled };
    const persisted: PersistedGuestState = {
      profile: next.profile,
      records: next.records,
      caminoProgress: next.caminoProgress,
      isGuestMode: next.isGuestMode,
      pendingImport: next.pendingImport,
    };
    await persist(persisted);
    set(persisted);
  },

  beginAccountSession: async () => {
    const current = get();
    const persisted: PersistedGuestState = {
      profile: current.profile,
      records: current.records,
      caminoProgress: current.caminoProgress,
      isGuestMode: false,
      pendingImport: current.profile !== null && (current.isGuestMode || current.pendingImport),
    };
    set(persisted);
    await persist(persisted);
  },

  setPendingImport: async (pending) => {
    const next = { ...get(), pendingImport: pending };
    const persisted: PersistedGuestState = {
      profile: next.profile,
      records: next.records,
      caminoProgress: next.caminoProgress,
      isGuestMode: next.isGuestMode,
      pendingImport: next.pendingImport,
    };
    await persist(persisted);
    set(persisted);
  },

  setCaminoProgress: async (level) => {
    const next = { ...get(), caminoProgress: level };
    const persisted: PersistedGuestState = {
      profile: next.profile,
      records: next.records,
      caminoProgress: next.caminoProgress,
      isGuestMode: next.isGuestMode,
      pendingImport: next.pendingImport,
    };
    await persist(persisted);
    set(persisted);
  },

  saveRecord: async (bucket, record) => {
    const records = get().records;
    const current = records[bucket];
    const nextRecords = {
      ...records,
      [bucket]: [record, ...current.filter((item) => item.id !== record.id)],
    };
    const next = { ...get(), records: nextRecords };
    const persisted: PersistedGuestState = {
      profile: next.profile,
      records: next.records,
      caminoProgress: next.caminoProgress,
      isGuestMode: next.isGuestMode,
      pendingImport: next.pendingImport,
    };
    await persist(persisted);
    set(persisted);
  },

  clearGuestData: async () => {
    const persisted: PersistedGuestState = {
      ...initialState,
      records: emptyRecords(),
    };
    await persist(persisted);
    set(persisted);
  },
}));
