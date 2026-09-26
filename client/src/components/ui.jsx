import { motion } from "framer-motion";

export function PageHeader({ kicker, title, hint, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && (
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-copper">{kicker}</p>
        )}
        <h1 className="display text-4xl font-medium tracking-tight text-ink dark:text-paper md:text-5xl">{title}</h1>
        {hint && <p className="mt-2 max-w-xl text-sm text-ink/55 dark:text-paper/55">{hint}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Surface({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`glass hairline rounded-[24px] p-5 md:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Button({ children, variant = "solid", className = "", ...props }) {
  const styles = {
    solid: "bg-ink text-paper dark:bg-paper dark:text-ink",
    ghost: "bg-transparent hairline text-ink dark:text-paper",
    copper: "bg-copper text-white",
    quiet: "bg-mist/70 text-ink dark:bg-white/8 dark:text-paper",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[16px] px-4 py-2.5 text-sm font-medium transition hover:opacity-90 disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-[0.16em] text-ink/45 dark:text-paper/45">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[16px] border-0 bg-white/70 px-3.5 py-2.5 text-sm outline-none ring-1 ring-ink/10 focus:ring-2 focus:ring-copper/40 dark:bg-white/5 dark:ring-white/10";
