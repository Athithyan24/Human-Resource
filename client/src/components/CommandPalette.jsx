import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../services/api";
import { useUi } from "../store/ui";
import { fullName } from "../utils/format";

export function CommandPalette() {
  const open = useUi((s) => s.commandOpen);
  const setOpen = useUi((s) => s.setCommandOpen);
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const { data } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => (await api.get("/search", { params: { q } })).data,
    enabled: open && q.length > 1,
  });

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const go = (path) => {
    setOpen(false);
    nav(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            className="relative mx-auto mt-[12vh] w-[min(640px,92vw)] rounded-[24px] bg-foam p-3 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] dark:bg-[#1c1a17]"
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search people, work, or jump…"
              className="w-full rounded-[16px] bg-transparent px-4 py-3 text-lg outline-none"
            />
            <div className="mt-2 space-y-1 px-2 pb-2 text-sm">
              {[
                ["/app", "Studio overview"],
                ["/app/directory", "Employee directory"],
                ["/app/work", "Work board"],
                ["/app/attendance", "Attendance"],
                ["/app/leaves", "Leave desk"],
              ].map(([p, l]) => (
                <button key={p} onClick={() => go(p)} className="block w-full rounded-[16px] px-3 py-2 text-left hover:bg-mist/80 dark:hover:bg-white/5">
                  {l}
                </button>
              ))}
              {data?.employees?.map((e) => (
                <button
                  key={e._id}
                  onClick={() => go(`/app/directory/${e._id}`)}
                  className="block w-full rounded-[16px] px-3 py-2 text-left hover:bg-mist/80"
                >
                  {fullName(e)} · {e.employeeId}
                </button>
              ))}
              {data?.tasks?.map((t) => (
                <button key={t._id} onClick={() => go("/app/work")} className="block w-full rounded-[16px] px-3 py-2 text-left hover:bg-mist/80">
                  {t.title}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
