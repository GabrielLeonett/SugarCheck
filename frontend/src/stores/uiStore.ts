import { create } from 'zustand';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info' | 'critical';

export interface ToastItem {
  id: string;
  severity: ToastSeverity;
  title?: string;
  message: string;
}

interface UiState {
  toasts: ToastItem[];
  showToast: (severity: ToastSeverity, message: string, title?: string, durationMs?: number) => void;
  dismissToast: (id: string) => void;
}

let toastId = 0;

const DEFAULT_DURATION: Record<ToastSeverity, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 7000,
  critical: 10000,
};

export const useUiStore = create<UiState>((set) => ({
  toasts: [],

  showToast: (severity, message, title, durationMs) => {
    const id = `toast-${++toastId}-${Date.now()}`;
    const duration = durationMs ?? DEFAULT_DURATION[severity];

    set((state) => ({ toasts: [...state.toasts, { id, severity, message, title }] }));

    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));