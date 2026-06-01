import { create } from "zustand";

type AppState = {
  sidebarOpen: boolean;
  notificationOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  setNotificationOpen: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  notificationOpen: false,
  setSidebarOpen: (value) => set({ sidebarOpen: value }),
  setNotificationOpen: (value) => set({ notificationOpen: value })
}));
