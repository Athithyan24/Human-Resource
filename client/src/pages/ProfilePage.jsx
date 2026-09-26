import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { api } from "../services/api";
import { PageHeader, Surface, Button } from "../components/ui";
import { fullName, fmtDate } from "../utils/format";
import { SceneLottie } from "../components/SceneLottie";
import { LOTTIE } from "../utils/format";

export function ProfilePage() {
  const { id } = useParams();
  const { data } = useQuery({
    queryKey: ["employee", id],
    queryFn: async () => (await api.get(`/employees/${id}`)).data,
  });
  const e = data?.item;
  if (!e) return null;

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text("Arclight — employee card", 20, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${fullName(e)}  ·  ${e.employeeId}`, 20, 40);
    doc.text(`${e.designation}  ·  ${e.department?.name || ""}`, 20, 50);
    doc.text(`Joined ${fmtDate(e.joiningDate)}  ·  ${e.status}`, 20, 60);
    doc.text(e.email, 20, 70);
    doc.save(`${e.employeeId}.pdf`);
  };

  return (
    <>
      <PageHeader
        kicker={e.employeeId}
        title={fullName(e)}
        hint={`${e.designation} · ${e.department?.name} · ${e.team?.name || "No team yet"}`}
        actions={<Button onClick={exportPdf}>Export card</Button>}
      />
      {e.status === "onboarding" && (
        <Surface className="mb-6 flex items-center gap-4">
          <SceneLottie src={LOTTIE.welcome} className="h-24 w-24" />
          <div>
            <p className="display text-2xl">Still landing</p>
            <p className="text-sm text-ink/50">Onboarding is open. Pair them with the lead and the handbook.</p>
          </div>
        </Surface>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Contact</p>
          <p className="mt-2 text-sm">{e.email}</p>
          <p className="text-sm">{e.phone}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Lifecycle</p>
          <p className="mt-2 capitalize">{e.lifecycleStage}</p>
          <p className="text-sm text-ink/45">Joined {fmtDate(e.joiningDate)}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/40">Reports to</p>
          <p className="mt-2">{fullName(e.manager) || "Studio admin"}</p>
        </Surface>
      </div>
    </>
  );
}
