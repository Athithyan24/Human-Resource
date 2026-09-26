import { Plus, Clock3, CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../store/auth";

export function QuickActions() {
  const role = useAuth((s) => s.user?.role);
  const nav = useNavigate();
  if (role !== "employee") return null;
  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-30 flex flex-col gap-2"
    >
      <button
        onClick={() => nav("/app/reports")}
        className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper shadow-[0px_8px_32px_rgba(0,0,0,0.08)]"
        title="2-hour report"
      >
        <Clock3 size={18} />
      </button>
      <button
        onClick={() => nav("/app/attendance")}
        className="grid h-12 w-12 place-items-center rounded-full bg-copper text-white shadow-[0px_8px_32px_rgba(0,0,0,0.08)]"
        title="Attendance"
      >
        <CalendarCheck size={18} />
      </button>
      <button
        onClick={() => nav("/app/leaves")}
        className="grid h-12 w-12 place-items-center rounded-full bg-pine text-white shadow-[0px_8px_32px_rgba(0,0,0,0.08)]"
        title="Leave"
      >
        <Plus size={18} />
      </button>
    </motion.div>
  );
}
