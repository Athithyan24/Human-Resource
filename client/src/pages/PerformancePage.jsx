import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { api } from "../services/api";
import { useAuth } from "../store/auth";
import { PageHeader, Surface, Button } from "../components/ui";
import { fullName, LOTTIE } from "../utils/format";
import { SceneLottie } from "../components/SceneLottie";

export function PerformancePage() {
  const role = useAuth((s) => s.user?.role);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["perf"], queryFn: async () => (await api.get("/performance")).data });
  const { data: weekly } = useQuery({ queryKey: ["weekly"], queryFn: async () => (await api.get("/analytics/weekly")).data });
  const gen = useMutation({
    mutationFn: () => api.post("/performance/generate", { period: new Date().toISOString().slice(0, 7) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perf"] }),
  });
  const chart = (data?.items || []).map((r) => ({ name: r.employee?.firstName, score: r.score }));
  return (
    <>
      <PageHeader
        kicker="Craft"
        title="Performance, scored without theatre"
        hint="Attendance 20 · delivery 40 · reports 20 · productivity 20."
        actions={role === "admin" && <Button onClick={() => gen.mutate()}>Run this month</Button>}
      />
      <div className="mb-6 flex items-center gap-4">
        <SceneLottie src={LOTTIE.award} className="h-28 w-28" />
        <Surface className="flex-1">
          <p className="text-sm text-ink/50">Team comparison</p>
          <div className="h-40">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#2c4a3e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      </div>
      <div className="space-y-3">
        {(data?.items || []).map((r) => (
          <Surface key={r._id}>
            <div className="flex justify-between">
              <p className="font-medium">
                {fullName(r.employee)} · {r.period}
              </p>
              <span className="text-copper">{r.grade}</span>
            </div>
            <p className="mt-1 display text-3xl">{r.score}</p>
            <p className="text-xs text-ink/45">
              Att {Math.round(r.attendanceRate)} · Tasks {Math.round(r.taskCompletion)} · Reports {Math.round(r.timelyReporting)} · Prod {Math.round(r.productivity)}
            </p>
          </Surface>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink/40">{weekly?.assignments?.length || 0} assignment rows in weekly analytics</p>
    </>
  );
}
