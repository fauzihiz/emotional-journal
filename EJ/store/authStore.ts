import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  isActivated: boolean | null; // null means we haven't checked yet
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setInitialized: (initialized: boolean) => void;
  setActivated: (isActivated: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  isActivated: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
  setInitialized: (initialized) => set({ initialized }),
  setActivated: (isActivated) => set({ isActivated }),
  signOut: () => set({ session: null, user: null, isActivated: null }),
}));
