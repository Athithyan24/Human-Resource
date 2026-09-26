import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { PageHeader, Surface, Button, Field, inputClass } from "../components/ui";
import { useAuth } from "../store/auth";
import { fullName } from "../utils/format";
import { SceneLottie } from "../components/SceneLottie";
import { LOTTIE } from "../utils/format";

export function ReportsPage() {
  const role = useAuth((s) => s.user?.role);
  const qc = useQueryClient();
  const { data: today } = useQuery({ queryKey: ["reports-today"], queryFn: async () => (await api.get("/reports/today")).data });
  const { data } = useQuery({ queryKey: ["reports"], queryFn: async () => (await api.get("/reports")).data });
  const { data: tasks } = useQuery({ queryKey: ["tasks"], queryFn: async () => (await api.get("/tasks")).data });
  const [form, setForm] = useState({ slot: "10:00" });
  const submit = useMutation({
    mutationFn: () => api.post("/reports", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["reports-today"] });
    },
  });
  const submittedSlots = new Set((today?.submitted || []).map((r) => r.slot));

  return (
    <>
      <PageHeader
        kicker="Cadence"
        title="Two-hour work log"
        hint="10:00 · 12:00 · 14:00 · 16:00. Late after fifteen minutes."
      />
      <div className="mb-6 flex items-start gap-4">
        <SceneLottie src={LOTTIE.clock} className="h-28 w-28" />
        <div className="flex flex-wrap gap-2">
          {(today?.slots || ["10:00", "12:00", "14:00", "16:00"]).map((s) => (
            <span
              key={s}
              className={`rounded-full px-4 py-2 text-sm ${submittedSlots.has(s) ? "bg-pine text-white" : "bg-mist"}`}
            >
              {s} {submittedSlots.has(s) ? "in" : "open"}
            </span>
          ))}
        </div>
      </div>
      {role === "employee" && (
        <Surface className="mb-6 space-y-3">
          <Field label="Slot">
            <select className={inputClass} value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
              {(today?.slots || []).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Linked work">
            <select className={inputClass} onChange={(e) => setForm({ ...form, task: e.target.value })}>
              <option value="">Optional</option>
              {(tasks?.items || []).map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Work done">
            <textarea className={inputClass} onChange={(e) => setForm({ ...form, workDone: e.target.value })} />
          </Field>
          <Field label="Current progress">
            <input className={inputClass} onChange={(e) => setForm({ ...form, currentProgress: e.target.value })} />
          </Field>
          <Field label="Blockers">
            <input className={inputClass} onChange={(e) => setForm({ ...form, blockers: e.target.value })} />
          </Field>
          <Field label="Next activity">
            <input className={inputClass} onChange={(e) => setForm({ ...form, nextActivity: e.target.value })} />
          </Field>
          <Button onClick={() => submit.mutate()}>File this slot</Button>
        </Surface>
      )}
      <Surface>
        {(data?.items || []).map((r) => (
          <div key={r._id} className="border-b border-ink/6 py-3 last:border-0">
            <p className="text-sm font-medium">
              {fullName(r.employee)} · {r.slot} {r.isLate ? "· late" : ""}
            </p>
            <p className="text-sm text-ink/60">{r.workDone}</p>
            <p className="text-xs text-ink/40">{r.nextActivity}</p>
          </div>
        ))}
      </Surface>
    </>
  );
}
