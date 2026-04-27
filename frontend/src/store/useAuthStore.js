import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  updateUser: (updates) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updates } });
    }
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Purge everything to be safe
      localStorage.clear();
    }
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
  loadUser: () => {
    // No longer loading from local storage to prevent stale "User" names
    set({ user: null, isAuthenticated: false });
  },
  saveUser: (user) => {
    // No longer saving to local storage to force a fresh backend fetch
    set({ user, isAuthenticated: true });
  }
}));

export default useAuthStore;
