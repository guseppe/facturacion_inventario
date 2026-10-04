import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  isAuthenticated: () => get().user !== null,
  isAdmin: () => get().user?.role === 'ADMIN',
}));
