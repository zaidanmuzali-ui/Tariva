import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

interface AppState {
  // User State
  user: User | null;
  isPro: boolean;
  setUser: (user: User | null) => void;
  setIsPro: (isPro: boolean) => void;

  // UI State
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;
  
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Session/Auth Readiness
  isAuthReady: boolean;
  setAuthReady: (ready: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isPro: false,
      setUser: (user) => set({ user }),
      setIsPro: (isPro) => set({ isPro }),

      language: 'id',
      setLanguage: (language) => set({ language }),

      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      isAuthReady: false,
      setAuthReady: (isAuthReady) => set({ isAuthReady }),
    }),
    {
      name: 'tariva-storage',
      partialize: (state) => ({ 
        language: state.language, 
        theme: state.theme 
      }), // Persist only preferences
    }
  )
);
