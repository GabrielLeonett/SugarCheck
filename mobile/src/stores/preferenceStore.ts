import { create } from 'zustand';
import { preferenceApi } from '../apis/preference';
import type { Preference } from '../types';

interface PreferenceConfigState {
  preference: Preference | null;
  save: (currentPrefs: Preference) => Promise<void>;
  load: () => Promise<void>;
  changeAvatar: (img: string) => void;
}

export const preferenceStore = create<PreferenceConfigState>((set) => ({
  preference: null,

  changeAvatar: (img: string) =>
    set((state) => ({
      preference: state.preference ? { ...state.preference, profileImg: img } : null,
    })),

  save: async (currentPrefs: Preference) => {
    await preferenceApi.savePreferences(currentPrefs);
    set({ preference: currentPrefs });
  },

  load: async () => {
    const data = await preferenceApi.getPreferences();
    if (data) {
      set({ preference: data });
    }
  },
}));

export const usePreferenceConfig = preferenceStore;
