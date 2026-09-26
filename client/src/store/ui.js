import { create } from "zustand";

export const useUi = create((set) => ({
  collapsed: false,
  mobileOpen: false,
  commandOpen: false,
  toast: null,
  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  pushToast: (toast) => {
    set({ toast });
    setTimeout(() => set({ toast: null }), 3200);
  },
}));

export function useTheme() {
  const dark = document.documentElement.classList.contains("dark");
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("arclight-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
  };
  return { dark, toggle };
}

if (typeof document !== "undefined") {
  const saved = localStorage.getItem("arclight-theme");
  if (saved === "dark") document.documentElement.classList.add("dark");
}
