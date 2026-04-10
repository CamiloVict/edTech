import { create } from 'zustand';

type UiState = {
  lastBootstrapPath: string | null;
  setLastBootstrapPath: (path: string | null) => void;
};

/**
 * Estado de UI global mínimo (evita prop drilling de flags puntuales).
 * El estado de servidor sigue viviendo en React Query.
 */
export const useUiStore = create<UiState>((set) => ({
  lastBootstrapPath: null,
  setLastBootstrapPath: (path) => set({ lastBootstrapPath: path }),
}));
