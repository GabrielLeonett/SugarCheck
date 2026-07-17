import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import { apiPrivate } from '../apis/axios';
import { useAuthStore } from './authStore';
import type { NotificationItem } from '../types/types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  socket: Socket | null;
  fetchNotifications: (filter?: 'all' | 'unread') => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: NotificationItem) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  socket: null,

  fetchNotifications: async (filter) => {
    set({ loading: true });
    try {
      const params = filter ? { filter } : {};
      const res = await apiPrivate.get('/notification', { params });
      const notifications = res.data as NotificationItem[];
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      });
    } catch {
      console.warn('Error fetching notifications, usando datos mock');
      import('../stores/notificationMock').then((m) => {
        const mock = m.MOCK_NOTIFICATIONS;
        set({
          notifications: mock,
          unreadCount: mock.filter((n: NotificationItem) => !n.read).length,
        });
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await apiPrivate.get('/notification/unread-count');
      set({ unreadCount: res.data.count });
    } catch {
      // silent
    }
  },

  markAsRead: async (id) => {
    const prev = get().notifications;
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });
    try {
      await apiPrivate.patch(`/notification/${id}/read`);
    } catch {
      set({ notifications: prev, unreadCount: prev.filter((n) => !n.read).length });
    }
  },

  markAllAsRead: async () => {
    const prevCount = get().unreadCount;
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    try {
      await apiPrivate.patch('/notification/read-all');
    } catch {
      set((state) => ({
        unreadCount: prevCount,
        notifications: state.notifications.map((n) => ({ ...n, read: false })),
      }));
    }
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),

  connectSocket: () => {
    const existing = get().socket;
    if (existing?.connected) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const socket = io(`${BASE_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('new_notification', (notification: NotificationItem) => {
      get().addNotification(notification);
    });

    socket.on('unread_count', ({ count }: { count: number }) => {
      set({ unreadCount: count });
    });

    socket.on('connect_error', () => {
      console.warn('Socket de notificaciones desconectado');
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
