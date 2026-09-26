import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { PageHeader, Button, Field, inputClass, Surface } from "../components/ui";
import { Modal } from "../components/Modal";
import { useUi } from "../store/ui";
import { AnimatePresence, motion } from "framer-motion";

const STEPS = ["Identity", "Seat", "Credentials"];

export function PeoplePage() {
  const qc = useQueryClient();
  const toast = useUi((s) => s.pushToast);
  const { data: depts } = useQuery({ queryKey: ["depts"], queryFn: async () => (await api.get("/departments")).data });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: async () => (await api.get("/teams")).data });
  const { data: people } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("employee");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: (body) => api.post(kind === "leader" ? "/leaders" : "/employees", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
      setStep(0);
      toast("Account ready — share credentials in person");
    },
  });

  return (
    <>
      <PageHeader
        kicker="Accounts"
        title="Bring someone onto the floor"
        hint="Leaders and employees get a username, a seat, and a first day status of onboarding."
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setKind("leader");
                setOpen(true);
              }}
            >
              New lead
            </Button>
            <Button
              onClick={() => {
                setKind("employee");
                setOpen(true);
              }}
            >
              New employee
            </Button>
          </>
        }
      />
      <Surface>
        <p className="mb-4 text-sm text-ink/50">{people?.items?.length || 0} records</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-ink/40">
              <tr>
                <th className="pb-3">ID</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Seat</th>
                <th className="pb-3">Login</th>
              </tr>
            </thead>
            <tbody>
              {(people?.items || []).map((e, i) => (
                <motion.tr key={e._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-t border-ink/6">
                  <td className="py-3">{e.employeeId}</td>
                  <td>
                    {e.firstName} {e.lastName}
                  </td>
                  <td>{e.team?.name}</td>
                  <td>{e.user?.username}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>
      <Modal open={open} onClose={() => setOpen(false)} title={kind === "leader" ? "Create team lead" : "Create employee"}>
        <div className="mb-4 flex gap-2 text-xs">
          {STEPS.map((s, i) => (
            <span key={s} className={`rounded-full px-3 py-1 ${i === step ? "bg-ink text-paper" : "bg-mist"}`}>
              {s}
            </span>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }} className="space-y-3">
            {step === 0 && (
              <>
                <Field label="First name">
                  <input className={inputClass} onChange={(e) => set("firstName", e.target.value)} />
                </Field>
                <Field label="Last name">
                  <input className={inputClass} onChange={(e) => set("lastName", e.target.value)} />
                </Field>
                <Field label="Email">
                  <input className={inputClass} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="Phone">
                  <input className={inputClass} onChange={(e) => set("phone", e.target.value)} />
                </Field>
              </>
            )}
            {step === 1 && (
              <>
                <Field label="Department">
                  <select className={inputClass} onChange={(e) => set("department", e.target.value)}>
                    <option value="">Select</option>
                    {(depts?.items || []).map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Team">
                  <select className={inputClass} onChange={(e) => set("team", e.target.value)}>
                    <option value="">Select</option>
                    {(teams?.items || []).map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Designation">
                  <input className={inputClass} onChange={(e) => set("designation", e.target.value)} />
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Username">
                  <input className={inputClass} onChange={(e) => set("username", e.target.value)} />
                </Field>
                <Field label="Temporary password">
                  <input className={inputClass} onChange={(e) => set("password", e.target.value)} />
                </Field>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="mt-5 flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
          ) : (
            <Button onClick={() => create.mutate({ ...form, role: kind === "leader" ? "team_leader" : "employee" })}>Create account</Button>
          )}
        </div>
      </Modal>
    </>
  );
}
