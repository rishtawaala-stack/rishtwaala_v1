import { create } from 'zustand';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  lastNotifiedId: null,

  fetchNotifications: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;

      const res = await api.get('/notifications');
      const data = res.data?.data || res.data;
      const newNotifications = data?.notifications || [];
      const newUnreadCount = data?.unread_count || 0;
      
      // Trigger toasts for new unread notifications
      const unread = newNotifications.filter(n => !n.is_read);
      if (unread.length > 0) {
        const latest = unread[0];
        const state = get();
        
        if (latest.id !== state.lastNotifiedId) {
          toast(latest.body, {
            icon: latest.type === 'new_interest' ? '💕' : latest.type === 'message' ? '💬' : '🔔',
            duration: 5000,
            id: `realtime-${latest.id}` // Prevent duplicate toasts for same ID
          });
          set({ lastNotifiedId: latest.id });
        }
      }

      set({ 
        notifications: newNotifications,
        unreadCount: newUnreadCount,
        loading: false 
      });
    } catch (err) {
      console.error("Store fetch notifications failed:", err);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      const { notifications, unreadCount } = get();
      set({
        notifications: notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
        unreadCount: Math.max(0, unreadCount - 1)
      });
    } catch (err) {
      console.error("Mark as read failed:", err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post('/notifications/read-all');
      const { notifications } = get();
      set({
        notifications: notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      });
    } catch (err) {
      console.error("Mark all as read failed:", err);
    }
  }
}));

export default useNotificationStore;
