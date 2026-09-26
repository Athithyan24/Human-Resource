import { AnimatePresence, motion } from "framer-motion";
import { useUi } from "../store/ui";

export function ToastHost() {
  const toast = useUi((s) => s.toast);
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70]">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className="pointer-events-auto rounded-[20px] bg-ink px-4 py-3 text-sm text-paper shadow-[0px_8px_32px_rgba(0,0,0,0.08)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
