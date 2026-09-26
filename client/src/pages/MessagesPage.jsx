import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../services/api";
import { PageHeader, Surface, Button, inputClass } from "../components/ui";

export function MessagesPage() {
  const qc = useQueryClient();
  const { data: teams } = useQuery({ queryKey: ["teams"], queryFn: async () => (await api.get("/teams")).data });
  const [team, setTeam] = useState("");
  const { data } = useQuery({
    queryKey: ["messages", team],
    queryFn: async () => (await api.get("/messages", { params: team ? { team } : {} })).data,
  });
  const [text, setText] = useState("");
  const send = useMutation({
    mutationFn: () => api.post("/messages", { team: team || undefined, text }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
  return (
    <>
      <PageHeader kicker="Desk chat" title="Team thread" hint="Mentions are names in the copy. Keep it short." />
      <select className={`${inputClass} mb-4 max-w-xs`} value={team} onChange={(e) => setTeam(e.target.value)}>
        <option value="">My team</option>
        {(teams?.items || []).map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>
      <Surface className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto">
        {(data?.items || []).map((m) => (
          <div key={m._id}>
            <p className="text-[11px] text-ink/40">{m.from?.username}</p>
            <p className="text-sm">{m.text}</p>
          </div>
        ))}
      </Surface>
      <div className="flex gap-2">
        <input className={inputClass} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write to the crew…" />
        <Button onClick={() => send.mutate()}>Send</Button>
      </div>
    </>
  );
}
