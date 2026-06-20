import { create } from "zustand";
import GlucoAstro from '../assets/profile/GlucoAstro.png';

// 1. Definimos la interfaz del estado global
interface ProfileAvatarState {
    avatarSelected: string;
    changeAvatar: (img: string) => void;
}

// 2. Creamos el store con la sintaxis correcta de Zustand
export const useProfileAvatar = create<ProfileAvatarState>((set) => ({
    // Estado inicial (reemplaza al useState de React)
    avatarSelected: GlucoAstro,

    // Función/Acción para actualizar el estado (usa la función 'set' de Zustand)
    changeAvatar: (img: string) => set({ avatarSelected: img }),
}));