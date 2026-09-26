import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../store/auth";
import { PageHeader, Surface, Button, Field, inputClass } from "../components/ui";
import { Modal } from "../components/Modal";
import { fullName, fmtDate, LOTTIE } from "../utils/format";
import { SceneLottie } from "../components/SceneLottie";

export function LeavesPage() {
  const role = useAuth((s) => s.user?.role);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["leaves"], queryFn: async () => (await api.get("/leaves")).data });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "casual" });
  const apply = useMutation({
    mutationFn: () => api.post("/leaves", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setOpen(false);
    },
  });
  const review = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/leaves/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaves"] }),
  });
  return (
    <>
      <PageHeader
        kicker="Time off"
        title="Leave desk"
        hint="Employee asks. Lead decides. Admin keeps the record."
        actions={role === "employee" && <Button onClick={() => setOpen(true)}>Apply</Button>}
      />
      <SceneLottie src={LOTTIE.calendar} className="mb-4 h-28 w-28" />
      <div className="space-y-3">
        {(data?.items || []).map((l) => (
          <Surface key={l._id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium capitalize">
                {l.type} · {fullName(l.employee)}
              </p>
              <p className="text-sm text-ink/50">
                {fmtDate(l.from)} → {fmtDate(l.to)} · {l.status}
              </p>
              <p className="text-xs text-ink/40">{l.reason}</p>
            </div>
            {role !== "employee" && l.status === "pending" && (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => review.mutate({ id: l._id, status: "rejected" })}>
                  Reject
                </Button>
                <Button onClick={() => review.mutate({ id: l._id, status: "approved" })}>Approve</Button>
              </div>
            )}
          </Surface>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Ask for leave">
        <div className="space-y-3">
          <Field label="Type">
            <select className={inputClass} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="emergency">Emergency</option>
            </select>
          </Field>
          <Field label="From">
            <input type="date" className={inputClass} onChange={(e) => setForm({ ...form, from: e.target.value })} />
          </Field>
          <Field label="To">
            <input type="date" className={inputClass} onChange={(e) => setForm({ ...form, to: e.target.value })} />
          </Field>
          <Field label="Reason">
            <textarea className={inputClass} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={() => apply.mutate()}>
            Send to lead
          </Button>
        </div>
      </Modal>
    </>
  );
}
