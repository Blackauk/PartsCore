import { create } from 'zustand';

export const useUI = create((set) => ({
  modals: {
    profile: false,
    notifications: false,
    help: false,
    changelog: false,
    shortcuts: false,
    quick: false,
    feedback: false,
    confirmLogout: false,
  },
  openModal: (key) => set((s) => ({ modals: { ...s.modals, [key]: true } })),
  closeModal: (key) => set((s) => ({ modals: { ...s.modals, [key]: false } })),
}));


