import { create } from 'zustand';

type SessionRole = 'consumer' | 'provider' | null;

type SessionState = {
  role: SessionRole;
  setRole: (role: SessionRole) => void;
  clear: () => void;
};

/**
 * Estado de UI / sesión local (no reemplaza auth remota).
 * Un hook/store por responsabilidad: aquí solo rol seleccionado en onboarding.
 */
export const useSessionStore = create<SessionState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  clear: () => set({ role: null }),
}));
