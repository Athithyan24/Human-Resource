import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { PageHeader, Surface, Button } from "../components/ui";
import { fmtDate } from "../utils/format";

export function NotificationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notes"], queryFn: async () => (await api.get("/notifications")).data });
  const read = useMutation({
    mutationFn: () => api.post("/notifications/read"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
  return (
    <>
      <PageHeader
        kicker="Signals"
        title="What needs a look"
        hint="Assignments, leave, cadence, reviews."
        actions={<Button variant="ghost" onClick={() => read.mutate()}>Mark all read</Button>}
      />
      <div className="space-y-2">
        {(data?.items || []).map((n, i) => (
          <motion.div key={n._id} initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}>
            <Surface className={n.read ? "opacity-60" : ""}>
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-ink/50">{n.body}</p>
              <p className="mt-1 text-xs text-ink/35">{fmtDate(n.createdAt)}</p>
              {n.link && (
                <Link className="text-xs text-copper" to={`/app${n.link.replace(/^\//, "/")}`}>
                  Open
                </Link>
              )}
            </Surface>
          </motion.div>
        ))}
      </div>
    </>
  );
}
