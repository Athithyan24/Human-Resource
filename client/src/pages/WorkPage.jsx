import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../store/auth";
import { PageHeader, Surface, Button, Field, inputClass } from "../components/ui";
import { Modal } from "../components/Modal";
import { EmptyState, SkeletonRows } from "../components/Kpi";
import { SceneLottie } from "../components/SceneLottie";
import { LOTTIE, fullName } from "../utils/format";
import { motion } from "framer-motion";

const COLS = ["assigned", "started", "in_progress", "under_review", "completed"];

export function WorkPage() {
  const role = useAuth((s) => s.user?.role);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: async () => (await api.get("/tasks")).data });
  const { data: people } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: async () => (await api.get("/teams")).data });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ priority: "medium", memberIds: [] });

  const create = useMutation({
    mutationFn: () => api.post("/tasks", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
    },
  });
  const patchAssign = useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/assignments/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const items = data?.items || [];
  const by = (st) => items.filter((t) => t.status === st || t.assignments?.some((a) => a.status === st));

  if (isLoading) return <SkeletonRows />;

  return (
    <>
      <PageHeader
        kicker="Work board"
        title="What is actually in motion"
        hint="Priority, deadline, owners. Leads split work. Employees push status and files."
        actions={
          (role === "admin" || role === "team_leader") && <Button onClick={() => setOpen(true)}>New work</Button>
        }
      />
      {items.length === 0 ? (
        <EmptyState lottie={<SceneLottie src={LOTTIE.workflow} className="h-40 w-40" />} title="Board is empty" hint="Assign the first slice of work." />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLS.map((col) => (
            <div key={col} className="min-w-[240px] flex-1">
              <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink/40">{col.replace("_", " ")}</p>
              <div className="space-y-3">
                {items
                  .filter((t) => t.status === col)
                  .map((t) => (
                    <motion.div key={t._id} whileHover={{ y: -3 }}>
                      <Surface>
                        <p className="text-[11px] uppercase text-copper">{t.priority}</p>
                        <h3 className="mt-1 font-medium">{t.title}</h3>
                        <p className="mt-1 text-xs text-ink/45">{t.assignedTeam?.name}</p>
                        {(t.assignments || []).map((a) => (
                          <div key={a._id} className="mt-2 flex items-center justify-between text-xs">
                            <span>{fullName(a.employee)}</span>
                            {role === "employee" && (
                              <select
                                className="rounded-lg bg-mist px-1 py-0.5 dark:bg-white/10"
                                value={a.status}
                                onChange={(e) => patchAssign.mutate({ id: a._id, status: e.target.value, progress: a.progress })}
                              >
                                {COLS.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                        {role === "employee" &&
                          t.assignments
                            ?.filter((a) => a.employee?._id === useAuth.getState().user?.employee?._id)
                            .map((a) => (
                              <label key={`${a._id}-file`} className="mt-2 block text-[11px] text-copper">
                                Upload deliverable
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={async (ev) => {
                                    const file = ev.target.files?.[0];
                                    if (!file) return;
                                    const fd = new FormData();
                                    fd.append("file", file);
                                    await api.post(`/assignments/${a._id}/deliverables`, fd);
                                    qc.invalidateQueries({ queryKey: ["tasks"] });
                                  }}
                                />
                              </label>
                            ))}
                      </Surface>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Assign work">
        <div className="space-y-3">
          <Field label="Title">
            <input className={inputClass} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea className={inputClass} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Priority">
            <select className={inputClass} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Deadline">
            <input type="date" className={inputClass} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </Field>
          {role === "admin" && (
            <Field label="Team">
              <select className={inputClass} onChange={(e) => setForm({ ...form, assignedTeam: e.target.value })}>
                <option>Select</option>
                {(teams?.items || []).map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Members">
            <select
              multiple
              className={`${inputClass} h-28`}
              onChange={(e) =>
                setForm({ ...form, memberIds: [...e.target.selectedOptions].map((o) => o.value) })
              }
            >
              {(people?.items || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
          </Field>
          <Button className="w-full" onClick={() => create.mutate()}>
            Publish
          </Button>
        </div>
      </Modal>
    </>
  );
}
