import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        localStorage.setItem("arclight_token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("arclight_token");
        set({ token: null, user: null });
      },
    }),
    {
      name: "arclight-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.token) localStorage.setItem("arclight_token", state.token);
      },
    }
  )
);
