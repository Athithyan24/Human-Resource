export const fullName = (e) => (e ? `${e.firstName} ${e.lastName}` : "—");

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export const roleLabel = {
  admin: "People Admin",
  team_leader: "Team Lead",
  employee: "Employee",
};

export const LOTTIE = {
  office: "https://assets2.lottiefiles.com/packages/lf20_puciaact.json",
  welcome: "https://assets9.lottiefiles.com/packages/lf20_u4yrau.json",
  team: "https://assets4.lottiefiles.com/packages/lf20_vndxdt4u.json",
  clock: "https://assets1.lottiefiles.com/packages/lf20_p8bfn5to.json",
  workflow: "https://assets10.lottiefiles.com/packages/lf20_w51pcehl.json",
  calendar: "https://assets2.lottiefiles.com/packages/lf20_q5camcxj.json",
  award: "https://assets7.lottiefiles.com/packages/lf20_touohxv0.json",
  error: "https://assets9.lottiefiles.com/packages/lf20_suhe7qtm.json",
};
