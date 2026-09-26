import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { PageHeader, Surface, Button } from "../components/ui";
import { fullName } from "../utils/format";

export function ReviewsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["tasks"], queryFn: async () => (await api.get("/tasks")).data });
  const patch = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/assignments/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const waiting = (data?.items || []).flatMap((t) =>
    (t.assignments || []).filter((a) => a.status === "under_review").map((a) => ({ ...a, taskTitle: t.title }))
  );
  return (
    <>
      <PageHeader kicker="Lead review" title="Submissions on your desk" hint="Accept to complete. Send back to in progress if the file is thin." />
      <div className="space-y-3">
        {waiting.length === 0 && <Surface>Review tray is clear.</Surface>}
        {waiting.map((a) => (
          <Surface key={a._id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{a.taskTitle}</p>
              <p className="text-sm text-ink/50">{fullName(a.employee)}</p>
              {(a.deliverables || []).map((d, i) => (
                <a key={i} href={d.url} className="mr-2 text-xs text-copper" target="_blank" rel="noreferrer">
                  {d.name}
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => patch.mutate({ id: a._id, status: "in_progress" })}>
                Return
              </Button>
              <Button onClick={() => patch.mutate({ id: a._id, status: "completed" })}>Accept</Button>
            </div>
          </Surface>
        ))}
      </div>
    </>
  );
}
