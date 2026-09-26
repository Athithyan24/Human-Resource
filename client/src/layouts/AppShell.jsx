import { Outlet, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../store/auth";
import { useUi } from "../store/ui";
import { CommandPalette } from "../components/CommandPalette";
import { ToastHost } from "../components/ToastHost";

export function AppShell() {
  const user = useAuth((s) => s.user);
  const setMobile = useUi((s) => s.setMobileOpen);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="paper-grid min-h-screen md:flex">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between px-4 py-3 md:hidden">
          <button onClick={() => setMobile(true)}>
            <Menu />
          </button>
          <span className="display text-xl">Arclight</span>
          <span className="w-6" />
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <ToastHost />
    </div>
  );
}
