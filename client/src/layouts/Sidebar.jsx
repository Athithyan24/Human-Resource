import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Bell,
  BriefcaseBusiness,
  Building2,
  Calendar,
  ClipboardList,
  Clock3,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Search,
  Sun,
  Users,
  UserRoundPlus,
  GraduationCap,
  LogOut,
  Megaphone,
  GitBranch,
  PanelLeft,
} from "lucide-react";
import { useAuth } from "../store/auth";
import { useTheme, useUi } from "../store/ui";
import { roleLabel } from "../utils/format";

const NAV = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/directory", label: "Directory", icon: Users, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/org", label: "Studio map", icon: Building2, roles: ["admin"] },
  { to: "/app/people", label: "Accounts", icon: UserRoundPlus, roles: ["admin"] },
  { to: "/app/lifecycle", label: "Lifecycle", icon: GitBranch, roles: ["admin"] },
  { to: "/app/work", label: "Work", icon: ClipboardList, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/reports", label: "2-hour log", icon: Clock3, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/reviews", label: "Reviews", icon: BriefcaseBusiness, roles: ["admin", "team_leader"] },
  { to: "/app/attendance", label: "Attendance", icon: Calendar, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/leaves", label: "Leaves", icon: FileText, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/performance", label: "Performance", icon: Award, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/announcements", label: "Bulletin", icon: Megaphone, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/documents", label: "Library", icon: FileText, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/training", label: "Training", icon: GraduationCap, roles: ["admin", "team_leader", "employee"] },
  { to: "/app/messages", label: "Desk chat", icon: MessageSquare, roles: ["admin", "team_leader", "employee"] },
];

function Item({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink to={to} end={to === "/app"}>
      {({ isActive }) => (
        <span className="relative flex items-center gap-3 rounded-[16px] px-3 py-2 text-[13.5px]">
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-[16px] bg-ink text-paper dark:bg-paper"
            />
          )}
          <span className={`relative z-10 ${isActive ? "text-paper dark:text-ink" : "text-ink/70 dark:text-paper/70"}`}>
            <Icon size={18} />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`relative z-10 truncate ${isActive ? "text-paper dark:text-ink" : "text-ink/70 dark:text-paper/70"}`}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const collapsed = useUi((s) => s.collapsed);
  const toggle = useUi((s) => s.toggleCollapsed);
  const mobileOpen = useUi((s) => s.mobileOpen);
  const setMobile = useUi((s) => s.setMobileOpen);
  const setCommand = useUi((s) => s.setCommandOpen);
  const { dark, toggle: toggleTheme } = useTheme();
  const nav = useNavigate();
  const items = NAV.filter((n) => n.roles.includes(user?.role));

  const inner = (
    <motion.aside
      animate={{ width: collapsed ? 84 : 268 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="flex h-full flex-col border-r border-ink/8 bg-foam/80 px-3 py-4 backdrop-blur-xl dark:border-white/8 dark:bg-[#141210]/90"
    >
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-[16px] bg-ink text-paper dark:bg-paper dark:text-ink">
          ⌁
        </div>
        {!collapsed && (
          <div>
            <p className="display text-lg leading-none text-ink dark:text-paper">Arclight</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/50 dark:text-paper/50">People desk</p>
          </div>
        )}
        <button className="ml-auto hidden md:block" onClick={toggle}>
          <PanelLeft size={16} />
        </button>
      </div>
      <button
        onClick={() => setCommand(true)}
        className="mb-4 flex items-center gap-2 rounded-[16px] bg-mist/80 px-3 py-2 text-xs text-ink/50 dark:bg-white/5 dark:text-paper/50"
      >
        <Search size={14} /> {!collapsed && <span>Search · ⌘K</span>}
      </button>
      <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto pr-1">
        {items.map((n) => (
          <Item key={n.to} {...n} collapsed={collapsed} />
        ))}
      </nav>
      <div className="mt-3 space-y-2 border-t border-ink/8 pt-3 dark:border-white/8">
        <NavLink to="/app/notifications" className="flex items-center gap-3 px-3 py-2 text-sm">
          <Bell size={18} /> {!collapsed && "Signals"}
        </NavLink>
        <button onClick={toggleTheme} className="flex w-full items-center gap-3 px-3 py-2 text-sm">
          {dark ? <Sun size={18} /> : <Moon size={18} />} {!collapsed && (dark ? "Daylight" : "Night desk")}
        </button>
        <button
          onClick={() => {
            logout();
            nav("/login");
          }}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-copper"
        >
          <LogOut size={18} /> {!collapsed && "Sign out"}
        </button>
        {!collapsed && (
          <p className="px-3 pt-1 text-[11px] text-ink/40">
            {user?.username}
            <br />
            {roleLabel[user?.role]}
          </p>
        )}
      </div>
    </motion.aside>
  );

  return (
    <>
      <div className="hidden h-screen sticky top-0 md:block">{inner}</div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink/40" onClick={() => setMobile(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="absolute inset-y-0 left-0">
              {inner}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
