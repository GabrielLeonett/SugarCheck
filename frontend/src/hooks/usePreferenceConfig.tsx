import { create } from "zustand";
import { preferenceApi } from "../apis/preference_config";
import type { Preference } from "../schemas/preference_config";

interface PreferenceConfigState {
    preference: Preference | null;
    save: (currentPrefs: Preference) => Promise<void>;
    changeAvatar: (img: string) => void;
    load: () => Promise<void>; // Renombrado a 'load' por claridad
}

export const usePreferenceConfig = create<PreferenceConfigState>((set, get) => ({
    // Intentamos parsear del localStorage, si no hay nada, inicializamos en null
    preference: localStorage.getItem('preference_config') 
        ? JSON.parse(localStorage.getItem('preference_config')!) 
        : null,

    changeAvatar: (img: string) => set((state) => ({
        preference: state.preference 
            ? { ...state.preference, profileImg: img } 
            : null
    })),

    save: async (currentPrefs: Preference) => {
        try {
            await preferenceApi.savePreferences(currentPrefs);
            
            // Actualizamos estado y persistimos
            set({ preference: currentPrefs });
            localStorage.setItem('preference_config', JSON.stringify(currentPrefs));
            
            console.log("Preferencia guardada exitosamente");
        } catch (error) {
            console.error("Error al guardar en el store:", error);
            throw error;
        }
    },

    load: async () => {
        try {
            const data = await preferenceApi.getPreferences();
            if (data) {
                set({ preference: data });
                localStorage.setItem('preference_config', JSON.stringify(data));
            }
        } catch (error) {
            console.error("Error al cargar las preferencias:", error);
            throw error;
        }
    },
}));