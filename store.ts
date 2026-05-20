import { create } from 'zustand';
import { UserProfile } from './types';
import { INITIAL_USER } from './constants';

interface UserState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (updates) => set((state) => {
    if (!state.user) return state;
    const updatedUser = { ...state.user, ...updates };
    localStorage.setItem('career_ready_user', JSON.stringify(updatedUser));
    return { user: updatedUser };
  }),
  logout: () => {
    localStorage.removeItem('cr_onboarding_complete');
    localStorage.removeItem('career_ready_user');
    set({ user: null });
  }
}));
