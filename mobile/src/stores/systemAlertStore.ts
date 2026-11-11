import { create } from 'zustand';

import type { SystemAlertOptions } from '@/src/types/systemAlert';

export type SystemAlertInstance = SystemAlertOptions & { id: number };

interface SystemAlertState {
  current: SystemAlertInstance | null;
  show: (options: SystemAlertOptions) => number;
  hide: (id?: number) => void;
}

let nextId = 1;

/**
 * Hook del store. El nombre debe empezar por `use` para que React Compiler
 * (activado en app.json) lo reconozca como hook y no memoice su resultado.
 */
export const useSystemAlertStore = create<SystemAlertState>((set, get) => ({
  current: null,

  show: (options) => {
    const id = nextId++;
    set({ current: { ...options, id } });
    return id;
  },

  hide: (id) => {
    const current = get().current;
    if (!current) return;
    if (id !== undefined && current.id !== id) return;
    set({ current: null });
  },
}));

/** Abre una alerta del sistema. Devuelve su id. */
export function showSystemAlert(options: SystemAlertOptions) {
  return useSystemAlertStore.getState().show(options);
}

/** Cierra la alerta actual (o la indicada si coincide). */
export function hideSystemAlert(id?: number) {
  useSystemAlertStore.getState().hide(id);
}

export function showErrorAlert(message: string, title = 'Error') {
  return showSystemAlert({
    type: 'error',
    title,
    description: message,
    buttons: [{ text: 'Aceptar', color: 'danger' }],
  });
}

export function showSuccessAlert(
  message: string,
  title = 'Guardado',
  afterClose?: () => void | Promise<void>,
  image?: SystemAlertOptions['image']
) {
  return showSystemAlert({
    type: 'success',
    title,
    description: message,
    image,
    buttons: [{ text: 'Aceptar', color: 'primary', onPress: afterClose }],
  });
}

export interface ShowConfirmAlertOptions {
  title: string;
  description?: string;
  image?: SystemAlertOptions['image'];
  confirmText?: string;
  cancelText?: string;
  /** Usa el botón de confirmación en rojo. */
  destructive?: boolean;
  type?: SystemAlertOptions['type'];
  onConfirm?: () => void | Promise<void>;
}

export function showConfirmAlert({
  title,
  description,
  image,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  destructive = false,
  type,
  onConfirm,
}: ShowConfirmAlertOptions) {
  return showSystemAlert({
    type: type ?? (destructive ? 'warning' : 'info'),
    title,
    description,
    image,
    buttons: [
      { text: cancelText, variant: 'outlined', color: 'secondary' },
      {
        text: confirmText,
        color: destructive ? 'danger' : 'primary',
        onPress: onConfirm,
      },
    ],
  });
}
