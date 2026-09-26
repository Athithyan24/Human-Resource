import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { PageHeader, Surface, inputClass } from "../components/ui";
import { SkeletonRows, EmptyState } from "../components/Kpi";
import { SceneLottie } from "../components/SceneLottie";
import { LOTTIE, fullName } from "../utils/format";
import { useState } from "react";

export function DirectoryPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/employees")).data,
  });
  const items = (data?.items || []).filter((e) =>
    `${e.firstName} ${e.lastName} ${e.employeeId} ${e.designation}`.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <>
      <PageHeader kicker="Directory" title="Everyone on the floor" hint="Not a grid of clones — names, craft, and where they sit." />
      <input className={`${inputClass} mb-6 max-w-md`} placeholder="Filter by name, ID, craft…" value={q} onChange={(e) => setQ(e.target.value)} />
      {isLoading ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <EmptyState lottie={<SceneLottie src={LOTTIE.team} />} title="Quiet floor" hint="No one matches that filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((e) => (
            <Link key={e._id} to={`/app/directory/${e._id}`}>
              <Surface className="h-full hover:-translate-y-0.5 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] tracking-[0.16em] text-copper">{e.employeeId}</p>
                    <h3 className="display mt-1 text-2xl">{fullName(e)}</h3>
                    <p className="text-sm text-ink/50">{e.designation}</p>
                  </div>
                  <span className="rounded-full bg-mist px-3 py-1 text-[11px] capitalize dark:bg-white/10">{e.status}</span>
                </div>
                <p className="mt-4 text-xs text-ink/45">
                  {e.department?.name} · {e.team?.name || "Unassigned"}
                </p>
              </Surface>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
