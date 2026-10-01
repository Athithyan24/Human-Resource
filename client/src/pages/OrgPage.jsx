import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { PageHeader, Surface, Button, Field, inputClass } from "../components/ui";
import { Modal } from "../components/Modal";
import { useUi } from "../store/ui";
import { fullName } from "../utils/format";
import { SceneLottie } from "../components/SceneLottie";
import { LOTTIE } from "../utils/format";
import { EmptyState } from "../components/Kpi";

export function OrgPage() {
  const qc = useQueryClient();
  const toast = useUi((s) => s.pushToast);
  const { data: depts } = useQuery({ queryKey: ["depts"], queryFn: async () => (await api.get("/departments")).data });
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: async () => (await api.get("/teams")).data });
  const { data: people } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });
  const [deptOpen, setDeptOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [form, setForm] = useState({});

  const createDept = useMutation({
    mutationFn: (body) => api.post("/departments", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["depts"] });
      setDeptOpen(false);
      toast("Department on the map");
    },
  });
  const createTeam = useMutation({
    mutationFn: (body) => api.post("/teams", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      setTeamOpen(false);
      toast("Team assembled");
    },
  });

  return (
    <>
      <PageHeader
        kicker="Studio map"
        title="Departments & crews"
        hint="Name the rooms first. Then the people."
        actions={
          <>
            <Button variant="ghost" onClick={() => setDeptOpen(true)}>
              New department
            </Button>
            <Button onClick={() => setTeamOpen(true)}>New team</Button>
          </>
        }
      />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(depts?.items || []).map((d) => (
          <Surface key={d._id}>
            <p className="text-[11px] tracking-[0.16em] text-copper">{d.code}</p>
            <h3 className="display mt-1 text-2xl">{d.name}</h3>
            <p className="mt-2 text-sm text-ink/50">{d.description}</p>
          </Surface>
        ))}
      </div>
      <h2 className="display mb-4 text-3xl">Teams</h2>
      {(teams?.items || []).length === 0 ? (
        <EmptyState lottie={<SceneLottie src={LOTTIE.team} />} title="No crews yet" hint="Spin up a team and pick a lead." />
      ) : (
        <div className="space-y-3">
          {(teams?.items || []).map((t) => (
            <Surface key={t._id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="display text-2xl">{t.name}</h3>
                <p className="text-sm text-ink/50">{t.department?.name}</p>
                <p className="mt-2 text-sm">
                  <span className="text-ink/50">Members: </span>
                  {(t.members || []).length > 0 ? t.members.map(fullName).join(", ") : "None assigned"}
                </p>
                <p className="mt-1 text-sm">
                  <span className="text-ink/50">Team leader: </span>
                  {fullName(t.leader)}
                </p>
              </div>
            </Surface>
          ))}
        </div>
      )}

      <Modal open={deptOpen} onClose={() => setDeptOpen(false)} title="Add a department">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            createDept.mutate(form);
          }}
        >
          <Field label="Name">
            <input className={inputClass} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Code">
            <input className={inputClass} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </Field>
          <Field label="Note">
            <textarea className={inputClass} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Button className="w-full">Create</Button>
        </form>
      </Modal>
      <Modal open={teamOpen} onClose={() => setTeamOpen(false)} title="Assemble a team">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            createTeam.mutate(form);
          }}
        >
          <Field label="Name">
            <input className={inputClass} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Department">
            <select className={inputClass} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">Select</option>
              {(depts?.items || []).map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lead">
            <select className={inputClass} onChange={(e) => setForm({ ...form, leader: e.target.value })}>
              <option value="">Select</option>
              {(people?.items || []).map((p) => (
                <option key={p._id} value={p._id}>
                  {fullName(p)}
                </option>
              ))}
            </select>
          </Field>
          <Button className="w-full">Create</Button>
        </form>
      </Modal>
    </>
  );
}
