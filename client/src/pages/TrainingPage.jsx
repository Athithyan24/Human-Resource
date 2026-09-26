import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../store/auth";
import { PageHeader, Surface, Button, Field, inputClass } from "../components/ui";
import { Modal } from "../components/Modal";
import { fullName } from "../utils/format";

export function TrainingPage() {
  const role = useAuth((s) => s.user?.role);
  const me = useAuth((s) => s.user);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["train"], queryFn: async () => (await api.get("/training")).data });
  const { data: people } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: "workshop", assignedTo: [] });
  const create = useMutation({
    mutationFn: () => api.post("/training", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["train"] });
      setOpen(false);
    },
  });
  const complete = useMutation({
    mutationFn: (id) => api.post(`/training/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["train"] }),
  });
  return (
    <>
      <PageHeader
        kicker="Learning"
        title="Workshops and courses"
        hint="Assigned by admin. Mark complete when the session is actually done."
        actions={role === "admin" && <Button onClick={() => setOpen(true)}>Assign</Button>}
      />
      <div className="space-y-3">
        {(data?.items || []).map((t) => {
          const done = t.completions?.some((c) => String(c.employee) === String(me?.employee?._id));
          return (
            <Surface key={t._id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase text-copper">{t.kind}</p>
                <h3 className="display text-2xl">{t.title}</h3>
                <p className="text-sm text-ink/50">{t.description}</p>
                <p className="mt-1 text-xs text-ink/40">{t.completions?.length || 0} completed</p>
              </div>
              {!done && role !== "admin" && <Button onClick={() => complete.mutate(t._id)}>Mark complete</Button>}
            </Surface>
          );
        })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Assign learning">
        <div className="space-y-3">
          <Field label="Title">
            <input className={inputClass} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Kind">
            <select className={inputClass} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="program">Program</option>
              <option value="workshop">Workshop</option>
              <option value="course">Course</option>
              <option value="material">Material</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea className={inputClass} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="People">
            <select
              multiple
              className={`${inputClass} h-28`}
              onChange={(e) => setForm({ ...form, assignedTo: [...e.target.selectedOptions].map((o) => o.value) })}
            >
              {(people?.items || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
          </Field>
          <Button className="w-full" onClick={() => create.mutate()}>
            Assign
          </Button>
        </div>
      </Modal>
    </>
  );
}
