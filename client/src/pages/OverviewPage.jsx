import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../services/api";
import { useAuth } from "../store/auth";
import { PageHeader, Surface, Button } from "../components/ui";
import { Kpi, SkeletonRows } from "../components/Kpi";
import { fullName } from "../utils/format";

export function OverviewPage() {
  const role = useAuth((s) => s.user?.role);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });
  if (isLoading) return <SkeletonRows rows={6} />;
  if (role === "admin") return <AdminView data={data} />;
  if (role === "team_leader") return <LeadView data={data} />;
  return <EmployeeView data={data} />;
}

function AdminView({ data }) {
  const k = data.kpis || {};
  return (
    <>
      <PageHeader
        kicker="Studio overview"
        title="How the floor is moving"
        hint="Headcount, cadence, and the quiet numbers people ops actually reads."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="People" value={k.employees} hint="Active + onboarding" />
        <Kpi label="Teams" value={k.teams} />
        <Kpi label="Attendance" value={k.attendanceRate} suffix="%" />
        <Kpi label="Work closed" value={k.taskCompletion} suffix="%" />
        <Kpi label="Leave queue" value={k.pendingLeaves} />
        <Kpi label="Departments" value={k.departments} />
        <Kpi label="Late today" value={k.late} />
        <Kpi label="Performance index" value={k.performanceIndex} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Surface>
          <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-ink/40">Attendance trend</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts?.attendance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,24,20,0.08)" />
                <XAxis dataKey="_id" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="#2c4a3e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Surface>
        <Surface>
          <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-ink/40">Department weight</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts?.departments || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,24,20,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="count" fill="#b4532a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      </div>
    </>
  );
}

function LeadView({ data }) {
  const k = data.kpis || {};
  return (
    <>
      <PageHeader kicker="Lead desk" title="Your floor today" hint="Projects, reviews waiting, and your own assignments from admin." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Team" value={k.members} />
        <Kpi label="Projects" value={k.projects} />
        <Kpi label="Pending reviews" value={k.pendingReviews} />
        <Kpi label="Present" value={k.present} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Surface>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-ink/40">Waiting on you</p>
          {(data.pendingReviews || []).length === 0 && <p className="text-sm text-ink/45">Nothing in the review tray.</p>}
          {(data.pendingReviews || []).map((a) => (
            <div key={a._id} className="flex items-center justify-between border-b border-ink/6 py-3 last:border-0">
              <div>
                <p className="font-medium">{a.task?.title}</p>
                <p className="text-xs text-ink/45">{fullName(a.employee)}</p>
              </div>
              <Link to="/app/reviews" className="text-sm text-copper">
                Open
              </Link>
            </div>
          ))}
        </Surface>
        <Surface>
          <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-ink/40">Assigned to you</p>
          {(data.myAssignments || []).map((a) => (
            <p key={a._id} className="py-2 text-sm">
              {a.task?.title} · {a.status}
            </p>
          ))}
        </Surface>
      </div>
    </>
  );
}

function EmployeeView({ data }) {
  const k = data.kpis || {};
  return (
    <>
      <PageHeader
        kicker="Your day"
        title="Work, hours, and the next report"
        hint="Two-hour logs keep the studio honest. Next slot is on the right."
        actions={
          <Link to="/app/reports">
            <Button>File a 2-hour report</Button>
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open work" value={k.open} />
        <Kpi label="Reports today" value={k.reports} suffix="/4" />
        <Kpi label="Hours" value={k.workingHours} />
        <Kpi label="Score" value={k.score} hint={k.grade} />
      </div>
      <Surface className="mt-6">
        <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-ink/40">Today’s tasks</p>
        {(data.assignments || []).map((a) => (
          <div key={a._id} className="flex items-center justify-between py-3 border-b border-ink/6 last:border-0">
            <div>
              <p className="font-medium">{a.task?.title}</p>
              <p className="text-xs capitalize text-ink/45">{a.status.replace("_", " ")} · {a.progress}%</p>
            </div>
            <Link to="/app/work" className="text-sm text-copper">
              Update
            </Link>
          </div>
        ))}
      </Surface>
    </>
  );
}
