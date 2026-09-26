import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { PageHeader, Surface, Button, Field, inputClass } from "../components/ui";
import { Modal } from "../components/Modal";
import { fullName, fmtDate } from "../utils/format";

export function LifecyclePage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["lifecycle"], queryFn: async () => (await api.get("/lifecycle")).data });
  const { data: people } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });
  const [growth, setGrowth] = useState(false);
  const [exit, setExit] = useState(false);
  const [form, setForm] = useState({ kind: "promotion" });

  const grow = useMutation({
    mutationFn: () => api.post(`/employees/${form.employee}/growth`, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lifecycle"] });
      setGrowth(false);
    },
  });
  const resign = useMutation({
    mutationFn: () => api.post("/resignations", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lifecycle"] });
      setExit(false);
    },
  });
  const patchExit = useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/resignations/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lifecycle"] }),
  });

  return (
    <>
      <PageHeader
        kicker="Lifecycle"
        title="Hire, grow, move, leave"
        hint="Promotion, transfer, reward, notice, clearance — one ribbon, not five modules."
        actions={
          <>
            <Button variant="ghost" onClick={() => setGrowth(true)}>
              Growth
            </Button>
            <Button variant="copper" onClick={() => setExit(true)}>
              Start exit
            </Button>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Surface>
          <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink/40">Growth log</p>
          {(data?.promotions || []).map((p) => (
            <div key={p._id} className="border-b border-ink/6 py-3 last:border-0">
              <p className="font-medium">
                {fullName(p.employee)} · {p.kind}
              </p>
              <p className="text-xs text-ink/45">
                {p.fromDesignation} → {p.toDesignation} · {fmtDate(p.effectiveDate)}
              </p>
            </div>
          ))}
        </Surface>
        <Surface>
          <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink/40">Exits</p>
          {(data?.resignations || []).map((r) => (
            <div key={r._id} className="border-b border-ink/6 py-3 last:border-0">
              <p className="font-medium">
                {fullName(r.employee)} · {r.status}
              </p>
              <p className="text-xs text-ink/45">{r.reason}</p>
              {r.status !== "completed" && (
                <button
                  className="mt-2 text-xs text-copper"
                  onClick={() => patchExit.mutate({ id: r._id, status: "completed", finalStatus: "cleared" })}
                >
                  Mark clearance complete
                </button>
              )}
            </div>
          ))}
        </Surface>
      </div>
      <Surface className="mt-4">
        <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink/40">Activity</p>
        {(data?.logs || []).map((l) => (
          <p key={l._id} className="py-1.5 text-sm">
            {l.action} · {fullName(l.employee)} · {fmtDate(l.createdAt)}
          </p>
        ))}
      </Surface>
      <Modal open={growth} onClose={() => setGrowth(false)} title="Promotion, transfer, reward">
        <div className="space-y-3">
          <Field label="Employee">
            <select className={inputClass} onChange={(e) => setForm({ ...form, employee: e.target.value })}>
              <option>Select</option>
              {(people?.items || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kind">
            <select className={inputClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="promotion">Promotion</option>
              <option value="transfer">Transfer</option>
              <option value="reward">Reward</option>
            </select>
          </Field>
          <Field label="New designation">
            <input className={inputClass} onChange={(e) => setForm({ ...form, toDesignation: e.target.value })} />
          </Field>
          <Field label="Note">
            <textarea className={inputClass} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={() => grow.mutate()}>
            Record
          </Button>
        </div>
      </Modal>
      <Modal open={exit} onClose={() => setExit(false)} title="Notice period">
        <div className="space-y-3">
          <Field label="Employee">
            <select className={inputClass} onChange={(e) => setForm({ ...form, employee: e.target.value })}>
              <option>Select</option>
              {(people?.items || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reason">
            <textarea className={inputClass} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </Field>
          <Button className="w-full" onClick={() => resign.mutate()}>
            Open notice
          </Button>
        </div>
      </Modal>
    </>
  );
}
