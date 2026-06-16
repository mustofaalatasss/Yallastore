import { create } from 'zustand';

interface UIState {
  logoAppeared: boolean;
  setLogoAppeared: (status: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  logoAppeared: false,
  setLogoAppeared: (status) => set({ logoAppeared: status }),
}));
