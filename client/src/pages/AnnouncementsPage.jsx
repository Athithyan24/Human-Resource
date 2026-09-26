import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../store/auth";
import { PageHeader, Surface, Button, Field, inputClass } from "../components/ui";
import { Modal } from "../components/Modal";
import { fmtDate } from "../utils/format";

export function AnnouncementsPage() {
  const role = useAuth((s) => s.user?.role);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["ann"], queryFn: async () => (await api.get("/announcements")).data });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "update" });
  const create = useMutation({
    mutationFn: () => api.post("/announcements", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ann"] });
      setOpen(false);
    },
  });
  return (
    <>
      <PageHeader
        kicker="Bulletin"
        title="What the studio should know"
        hint="Updates, policy, meetings, events — one wall."
        actions={role === "admin" && <Button onClick={() => setOpen(true)}>Post</Button>}
      />
      <div className="space-y-4">
        {(data?.items || []).map((a) => (
          <Surface key={a._id}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-copper">{a.type}</p>
            <h3 className="display mt-1 text-3xl">{a.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{a.body}</p>
            <p className="mt-3 text-xs text-ink/35">{fmtDate(a.createdAt)}</p>
          </Surface>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Post to the wall">
        <div className="space-y-3">
          <Field label="Title">
            <input className={inputClass} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Type">
            <select className={inputClass} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="update">Update</option>
              <option value="policy">Policy</option>
              <option value="meeting">Meeting</option>
              <option value="event">Event</option>
            </select>
          </Field>
          <Field label="Body">
            <textarea className={inputClass} rows={5} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={() => create.mutate()}>
            Publish
          </Button>
        </div>
      </Modal>
    </>
  );
}
