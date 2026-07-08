import { create } from "zustand";
import { preferenceApi } from "../apis/preference_config";
import type { Preference } from "../schemas/preference_config";

interface PreferenceConfigState {
    preference: Preference | null;
    save: (currentPrefs: Preference) => Promise<void>;
    changeAvatar: (img: string) => void;
    load: () => Promise<void>; 
}

// ➔ 1. Creamos el store base sin la palabra "use". Es un objeto JavaScript puro.
export const preferenceStore = create<PreferenceConfigState>((set) => ({
    preference: null,

    changeAvatar: (img: string) => set((state) => ({
        preference: state.preference
            ? { ...state.preference, profileImg: img }
            : null
    })),

    save: async (currentPrefs: Preference) => {
        try {
            await preferenceApi.savePreferences(currentPrefs);
            set({ preference: currentPrefs });
            console.log("Preferencia guardada exitosamente");
        } catch (error) {
            console.error("Error al guardar en el store:", error);
            throw error;
        }
    },

    load: async () => {
        try {
            const data = await preferenceApi.getPreferences();
            console.log(data)
            if (data) {
                set({ preference: data });
            }
        } catch (error) {
            console.error("Error al cargar las preferencias:", error);
            throw error;
        }
    },
}));

// ➔ 2. Exportamos el Hook para tus componentes visuales de React/React Native (Mantiene compatibilidad)
export const usePreferenceConfig = preferenceStore;