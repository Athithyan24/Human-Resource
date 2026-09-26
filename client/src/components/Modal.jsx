import { AnimatePresence, motion } from "framer-motion";

export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.94, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative z-10 max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-foam p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] dark:bg-[#1c1a17]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="display text-2xl">{title}</h2>
              <button onClick={onClose} className="text-sm text-ink/40 dark:text-paper/40">
                Close
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
