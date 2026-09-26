import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import { User } from "./models/User.js";
import { Employee } from "./models/Employee.js";
import { Department } from "./models/Department.js";
import { Team } from "./models/Team.js";
import { Task } from "./models/Task.js";
import { TaskAssignment } from "./models/TaskAssignment.js";
import { TaskReport } from "./models/TaskReport.js";
import { Attendance } from "./models/Attendance.js";
import { LeaveRequest } from "./models/LeaveRequest.js";
import { Announcement } from "./models/Announcement.js";
import { Document } from "./models/Document.js";
import { TrainingProgram } from "./models/TrainingProgram.js";
import { PerformanceReview } from "./models/PerformanceReview.js";
import { Notification } from "./models/Notification.js";
import { EmployeeActivityLog } from "./models/EmployeeActivityLog.js";
import { Resignation } from "./models/Resignation.js";
import { Promotion } from "./models/Promotion.js";
import { Message } from "./models/Message.js";
import { Counter } from "./models/Counter.js";
import { computePerformance } from "./utils/performance.js";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

async function wipe() {
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Department.deleteMany({}),
    Team.deleteMany({}),
    Task.deleteMany({}),
    TaskAssignment.deleteMany({}),
    TaskReport.deleteMany({}),
    Attendance.deleteMany({}),
    LeaveRequest.deleteMany({}),
    Announcement.deleteMany({}),
    Document.deleteMany({}),
    TrainingProgram.deleteMany({}),
    PerformanceReview.deleteMany({}),
    Notification.deleteMany({}),
    EmployeeActivityLog.deleteMany({}),
    Resignation.deleteMany({}),
    Promotion.deleteMany({}),
    Message.deleteMany({}),
    Counter.deleteMany({}),
  ]);
}

async function person({ username, password, role, firstName, lastName, email, phone, department, team, designation, manager, seq, status = "active" }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash, role });
  const employeeId = `EMP${String(seq).padStart(5, "0")}`;
  const employee = await Employee.create({
    employeeId,
    user: user._id,
    firstName,
    lastName,
    email,
    phone,
    department,
    team,
    designation,
    manager,
    status,
    lifecycleStage: status === "onboarding" ? "onboarding" : "active",
    joiningDate: new Date("2025-04-01"),
  });
  user.employee = employee._id;
  await user.save();
  await Counter.findOneAndUpdate({ key: "employee" }, { seq }, { upsert: true });
  return { user, employee };
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await connectDb(process.env.MONGO_URI);
  await wipe();

  const departments = await Department.insertMany([
    { name: "Human Resources", code: "HR", description: "People operations, policy, and employee care." },
    { name: "Software Development", code: "ENG", description: "Product engineering across web and platform." },
    { name: "AI & Data Science", code: "AI", description: "Models, evaluation, and applied research." },
    { name: "Testing & QA", code: "QA", description: "Quality, reliability, and release confidence." },
    { name: "Cloud Operations", code: "CLO", description: "Infrastructure, observability, and uptime." },
    { name: "Cyber Security", code: "SEC", description: "Identity, threat response, and secure delivery." },
    { name: "Technical Support", code: "SUP", description: "Customer reliability and incident desk." },
  ]);
  const byCode = Object.fromEntries(departments.map((d) => [d.code, d]));

  const adminHash = await bcrypt.hash("Harbor#2026", 10);
  const admin = await User.create({ username: "harbor.admin", passwordHash: adminHash, role: "admin" });

  const ira = await person({
    username: "ira.mehta",
    password: "Leader#2026",
    role: "team_leader",
    firstName: "Ira",
    lastName: "Mehta",
    email: "ira.mehta@arclight.studio",
    phone: "+91 98100 11001",
    department: byCode.ENG._id,
    designation: "Engineering Lead",
    seq: 1,
  });
  const kabir = await person({
    username: "kabir.rao",
    password: "Leader#2026",
    role: "team_leader",
    firstName: "Kabir",
    lastName: "Rao",
    email: "kabir.rao@arclight.studio",
    phone: "+91 98100 11002",
    department: byCode.ENG._id,
    designation: "Backend Lead",
    seq: 2,
  });
  const noor = await person({
    username: "noor.das",
    password: "Leader#2026",
    role: "team_leader",
    firstName: "Noor",
    lastName: "Das",
    email: "noor.das@arclight.studio",
    phone: "+91 98100 11003",
    department: byCode.QA._id,
    designation: "QA Lead",
    seq: 3,
  });
  const ved = await person({
    username: "ved.iyer",
    password: "Leader#2026",
    role: "team_leader",
    firstName: "Ved",
    lastName: "Iyer",
    email: "ved.iyer@arclight.studio",
    phone: "+91 98100 11004",
    department: byCode.CLO._id,
    designation: "DevOps Lead",
    seq: 4,
  });
  const zara = await person({
    username: "zara.khan",
    password: "Leader#2026",
    role: "team_leader",
    firstName: "Zara",
    lastName: "Khan",
    email: "zara.khan@arclight.studio",
    phone: "+91 98100 11005",
    department: byCode.AI._id,
    designation: "AI Lead",
    seq: 5,
  });

  const frontend = await Team.create({
    name: "Frontend Team",
    department: byCode.ENG._id,
    leader: ira.employee._id,
    members: [ira.employee._id],
  });
  const backend = await Team.create({
    name: "Backend Team",
    department: byCode.ENG._id,
    leader: kabir.employee._id,
    members: [kabir.employee._id],
  });
  const qa = await Team.create({
    name: "QA Team",
    department: byCode.QA._id,
    leader: noor.employee._id,
    members: [noor.employee._id],
  });
  const devops = await Team.create({
    name: "DevOps Team",
    department: byCode.CLO._id,
    leader: ved.employee._id,
    members: [ved.employee._id],
  });
  const ai = await Team.create({
    name: "AI Team",
    department: byCode.AI._id,
    leader: zara.employee._id,
    members: [zara.employee._id],
  });

  const people = [
    { username: "anika.shah", firstName: "Anika", lastName: "Shah", team: frontend, dept: byCode.ENG, lead: ira, designation: "UI Engineer" },
    { username: "ravi.nair", firstName: "Ravi", lastName: "Nair", team: frontend, dept: byCode.ENG, lead: ira, designation: "Frontend Engineer" },
    { username: "leah.fernandes", firstName: "Leah", lastName: "Fernandes", team: backend, dept: byCode.ENG, lead: kabir, designation: "API Engineer" },
    { username: "arjun.patel", firstName: "Arjun", lastName: "Patel", team: backend, dept: byCode.ENG, lead: kabir, designation: "Platform Engineer" },
    { username: "mira.sen", firstName: "Mira", lastName: "Sen", team: qa, dept: byCode.QA, lead: noor, designation: "QA Engineer", status: "onboarding" },
    { username: "dev.kapoor", firstName: "Dev", lastName: "Kapoor", team: devops, dept: byCode.CLO, lead: ved, designation: "SRE" },
    { username: "sana.qureshi", firstName: "Sana", lastName: "Qureshi", team: ai, dept: byCode.AI, lead: zara, designation: "ML Engineer" },
  ];

  const staff = [];
  let seq = 6;
  for (const p of people) {
    const created = await person({
      username: p.username,
      password: "Employee#2026",
      role: "employee",
      firstName: p.firstName,
      lastName: p.lastName,
      email: `${p.username}@arclight.studio`,
      phone: `+91 98200 2200${seq}`,
      department: p.dept._id,
      team: p.team._id,
      designation: p.designation,
      manager: p.lead.employee._id,
      seq,
      status: p.status || "active",
    });
    staff.push(created);
    p.team.members.push(created.employee._id);
    seq += 1;
  }

  for (const t of [frontend, backend, qa, devops, ai]) {
    t.members = [...new Set(t.members.map(String))].map((id) => id);
    await t.save();
  }

  for (const lead of [ira, kabir, noor, ved, zara]) {
    const team = [frontend, backend, qa, devops, ai].find((t) => String(t.leader) === String(lead.employee._id));
    await Employee.findByIdAndUpdate(lead.employee._id, { team: team._id });
  }

  const pulse = await Task.create({
    title: "PulseHR web workspace — Q3 delivery",
    description: "Ship the employee workspace: directory, attendance, and 2-hour reporting.",
    priority: "critical",
    deadline: new Date(Date.now() + 12 * 864e5),
    status: "in_progress",
    createdBy: admin._id,
    assignedTeam: frontend._id,
  });
  const api = await Task.create({
    title: "People API contracts",
    description: "Stabilize employee, leave, and performance endpoints.",
    priority: "high",
    deadline: new Date(Date.now() + 8 * 864e5),
    status: "in_progress",
    createdBy: admin._id,
    assignedTeam: backend._id,
  });
  const sub = await Task.create({
    title: "Directory filters & profile canvas",
    description: "Smart filters, photo, lifecycle ribbon on the profile.",
    priority: "high",
    deadline: new Date(Date.now() + 5 * 864e5),
    status: "in_progress",
    createdBy: ira.user._id,
    assignedTeam: frontend._id,
    parentTask: pulse._id,
  });

  await TaskAssignment.create([
    { task: pulse._id, employee: ira.employee._id, status: "in_progress", progress: 55 },
    { task: sub._id, employee: staff[0].employee._id, status: "in_progress", progress: 62 },
    { task: sub._id, employee: staff[1].employee._id, status: "started", progress: 20 },
    { task: api._id, employee: kabir.employee._id, status: "in_progress", progress: 48 },
    { task: api._id, employee: staff[2].employee._id, status: "under_review", progress: 90 },
  ]);

  const date = new Date().toISOString().slice(0, 10);
  await TaskReport.create({
    employee: staff[0].employee._id,
    task: sub._id,
    workDone: "Built the directory canvas with department chips and lifecycle ribbon.",
    currentProgress: "62% — filters wired to query params.",
    blockers: "Waiting on photo crop spec from design.",
    nextActivity: "Profile header motion + print-ready PDF card.",
    slot: "10:00",
    date,
    isLate: false,
  });

  for (let i = 0; i < 10; i++) {
    const d = daysAgo(i);
    for (const p of [ira, kabir, staff[0], staff[1], staff[2]]) {
      const checkIn = new Date(`${d}T09:${40 + (i % 3) * 8}:00.000Z`);
      const checkOut = new Date(`${d}T18:10:00.000Z`);
      await Attendance.create({
        employee: p.employee._id,
        date: d,
        checkIn,
        checkOut,
        workingHours: 8.2,
        late: i % 5 === 0,
        status: i % 5 === 0 ? "late" : "present",
      });
    }
  }

  await LeaveRequest.create({
    employee: staff[1].employee._id,
    type: "casual",
    from: new Date(Date.now() + 3 * 864e5),
    to: new Date(Date.now() + 4 * 864e5),
    reason: "Family ceremony in Pune — half week planned.",
    status: "pending",
  });

  await Announcement.create([
    {
      title: "Friday studio hours",
      type: "event",
      body: "Open desk 4–6pm. Bring a demo, not a slide. Kitchen espresso is on Ira.",
      createdBy: admin._id,
    },
    {
      title: "Leave window for Diwali week",
      type: "policy",
      body: "Submit casual leave before Friday. Emergency leave still routes to your lead the same day.",
      createdBy: admin._id,
    },
  ]);

  await Document.create([
    { title: "Employee handbook — 2026", category: "policy", description: "Working hours, reporting cadence, and studio etiquette." },
    { title: "Offer letter template", category: "offer", description: "Standard joining pack used by People Ops." },
    { title: "2-hour reporting guide", category: "guideline", description: "What to write in work done, blockers, and next activity." },
  ]);

  await TrainingProgram.create({
    title: "Secure delivery workshop",
    kind: "workshop",
    description: "Threat modeling for product teams. 90 minutes, no slides-only.",
    assignedTo: [staff[0].employee._id, staff[2].employee._id],
    completions: [],
  });

  const metrics = computePerformance({ attendanceRate: 92, taskCompletion: 78, timelyReporting: 80, productivity: 74 });
  await PerformanceReview.create({ employee: staff[0].employee._id, period: "2026-09", ...metrics, remarks: "Steady craft. Tighten deadline communication." });

  await Message.create({
    from: ira.user._id,
    team: frontend._id,
    text: "Ship directory filters before Thursday review. @anika owns the canvas.",
  });

  await Notification.create({
    user: staff[0].user._id,
    type: "task",
    title: "Directory filters assigned",
    body: "Due in five days. Report at 10:00, 12:00, 14:00, 16:00.",
    link: "/work",
  });

  await EmployeeActivityLog.create({
    employee: staff[0].employee._id,
    actor: admin._id,
    action: "onboarding",
    meta: { note: "Joined Frontend Team" },
  });

  await Promotion.create({
    employee: staff[2].employee._id,
    fromDesignation: "API Engineer",
    toDesignation: "Senior API Engineer",
    kind: "promotion",
    note: "Owned the people API contracts through two releases.",
  });

  console.log("Seed complete.");
  console.log("Admin        harbor.admin / Harbor#2026");
  console.log("Team leader  ira.mehta / Leader#2026");
  console.log("Employee     anika.shah / Employee#2026");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
