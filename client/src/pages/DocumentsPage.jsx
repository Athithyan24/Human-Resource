import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../store/auth";
import { PageHeader, Surface, Button, Field, inputClass } from "../components/ui";
import { Modal } from "../components/Modal";

export function DocumentsPage() {
  const role = useAuth((s) => s.user?.role);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["docs"], queryFn: async () => (await api.get("/documents")).data });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "policy" });
  const create = useMutation({
    mutationFn: () => api.post("/documents", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["docs"] });
      setOpen(false);
    },
  });
  return (
    <>
      <PageHeader
        kicker="Library"
        title="Policies and joining paper"
        hint="Handbook, offers, guidelines — readable, not a dump."
        actions={role === "admin" && <Button onClick={() => setOpen(true)}>Add</Button>}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {(data?.items || []).map((d) => (
          <Surface key={d._id}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-copper">{d.category}</p>
            <h3 className="display mt-1 text-2xl">{d.title}</h3>
            <p className="mt-2 text-sm text-ink/50">{d.description}</p>
            {d.fileUrl && (
              <a className="mt-3 inline-block text-sm text-copper" href={d.fileUrl} target="_blank" rel="noreferrer">
                Open file
              </a>
            )}
          </Surface>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="File in the library">
        <div className="space-y-3">
          <Field label="Title">
            <input className={inputClass} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Category">
            <select className={inputClass} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="policy">Policy</option>
              <option value="guideline">Guideline</option>
              <option value="offer">Offer</option>
              <option value="hr">HR</option>
              <option value="training">Training</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea className={inputClass} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={() => create.mutate()}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}
