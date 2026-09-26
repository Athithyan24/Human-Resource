import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

function Count({ value }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    const c = animate(mv, Number(value) || 0, { duration: 0.9 });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

export function Kpi({ label, value, suffix = "", hint }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass hairline rounded-[24px] p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink/40 dark:text-paper/40">{label}</p>
      <p className="display mt-3 text-4xl">
        <Count value={value} />
        {suffix}
      </p>
      {hint && <p className="mt-2 text-xs text-ink/45 dark:text-paper/45">{hint}</p>}
    </motion.div>
  );
}

export function SkeletonRows({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.08 }}
          className="h-12 rounded-[16px] bg-mist/70 dark:bg-white/5"
        />
      ))}
    </div>
  );
}

export function EmptyState({ lottie, title, hint, children }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      {lottie}
      <h3 className="display mt-2 text-2xl">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink/50 dark:text-paper/50">{hint}</p>
      {children}
    </div>
  );
}
