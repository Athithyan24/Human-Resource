import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { PageHeader, Surface, Button } from "../components/ui";
import { Kpi } from "../components/Kpi";
import { fullName } from "../utils/format";
import { SceneLottie } from "../components/SceneLottie";
import { LOTTIE } from "../utils/format";
import { useAuth } from "../store/auth";

export function AttendancePage() {
  const qc = useQueryClient();
  const role = useAuth((s) => s.user?.role);
  const { data } = useQuery({ queryKey: ["attendance"], queryFn: async () => (await api.get("/attendance")).data });
  const { data: heat } = useQuery({ queryKey: ["heatmap"], queryFn: async () => (await api.get("/attendance/heatmap")).data });
  const punch = useMutation({
    mutationFn: (kind) => api.post(`/attendance/${kind}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
  return (
    <>
      <PageHeader
        kicker="Presence"
        title="Who is actually here"
        hint="Check-in after 10:15 is late. Check-out before 17:00 is an early exit."
        actions={
          role !== "admin" && (
            <>
              <Button variant="ghost" onClick={() => punch.mutate("check-in")}>
                Check in
              </Button>
              <Button onClick={() => punch.mutate("check-out")}>Check out</Button>
            </>
          )
        }
      />
      <div className="mb-6 flex items-center gap-4">
        <SceneLottie src={LOTTIE.clock} className="h-24 w-24" />
        <div className="grid flex-1 grid-cols-3 gap-3">
          <Kpi label="Present" value={data?.metrics?.present} />
          <Kpi label="Late" value={data?.metrics?.late} />
          <Kpi label="Records" value={data?.metrics?.records} />
        </div>
      </div>
      <Surface className="mb-4">
        <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink/40">Heat · last punches</p>
        <div className="flex flex-wrap gap-1">
          {(heat?.items || []).map((h) => (
            <span
              key={h._id}
              title={h.date}
              className={`h-4 w-4 rounded-sm ${h.late ? "bg-copper/70" : h.checkIn ? "bg-pine" : "bg-mist"}`}
            />
          ))}
        </div>
      </Surface>
      <Surface className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-ink/40">
            <tr>
              <th className="pb-2">Person</th>
              <th className="pb-2">In</th>
              <th className="pb-2">Out</th>
              <th className="pb-2">Hours</th>
              <th className="pb-2">Flag</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((a) => (
              <tr key={a._id} className="border-t border-ink/6">
                <td className="py-3">{fullName(a.employee)}</td>
                <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "—"}</td>
                <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "—"}</td>
                <td>{a.workingHours}</td>
                <td>{a.late ? "Late" : a.earlyExit ? "Early" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>
    </>
  );
}
