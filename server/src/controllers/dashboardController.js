import { Employee } from "../models/Employee.js";
import { Department } from "../models/Department.js";
import { Team } from "../models/Team.js";
import { Attendance } from "../models/Attendance.js";
import { LeaveRequest } from "../models/LeaveRequest.js";
import { Task } from "../models/Task.js";
import { TaskAssignment } from "../models/TaskAssignment.js";
import { TaskReport } from "../models/TaskReport.js";
import { PerformanceReview } from "../models/PerformanceReview.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export const dashboard = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const emp = req.user.employee;

  if (role === "admin") {
    const [employees, departments, teams, leaves, tasks, attendanceToday, reviews] = await Promise.all([
      Employee.countDocuments({ status: { $ne: "exited" } }),
      Department.countDocuments(),
      Team.countDocuments(),
      LeaveRequest.countDocuments({ status: "pending" }),
      Task.find(),
      Attendance.find({ date: today() }),
      PerformanceReview.find().sort({ createdAt: -1 }).limit(20).populate("employee"),
    ]);
    const completed = tasks.filter((t) => t.status === "completed").length;
    const present = attendanceToday.filter((a) => a.checkIn).length;
    const late = attendanceToday.filter((a) => a.late).length;
    const attTrend = await Attendance.aggregate([
      { $group: { _id: "$date", present: { $sum: 1 }, late: { $sum: { $cond: ["$late", 1, 0] } } } },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);
    const deptGrowth = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);
    const depts = await Department.find();
    const deptMap = Object.fromEntries(depts.map((d) => [String(d._id), d.name]));
    res.json({
      success: true,
      role,
      kpis: {
        employees,
        departments,
        teams,
        pendingLeaves: leaves,
        taskCompletion: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
        attendanceRate: employees ? Math.round((present / employees) * 100) : 0,
        present,
        late,
        performanceIndex: reviews.length
          ? Math.round(reviews.reduce((s, r) => s + (r.score || 0), 0) / reviews.length)
          : 0,
      },
      charts: {
        attendance: attTrend,
        departments: deptGrowth.map((d) => ({ name: deptMap[d._id] || "Unassigned", count: d.count })),
        performance: reviews.map((r) => ({ name: r.employee?.firstName, score: r.score, grade: r.grade })),
      },
    });
  }

  if (role === "team_leader") {
    const teamId = emp.team?._id || emp.team;
    const members = await Employee.find({ team: teamId });
    const memberIds = members.map((m) => m._id);
    const tasks = await Task.find({ assignedTeam: teamId });
    const assignments = await TaskAssignment.find({ employee: { $in: memberIds } }).populate("employee task");
    const pendingReviews = assignments.filter((a) => a.status === "under_review");
    const reports = await TaskReport.find({ employee: { $in: memberIds }, date: today() });
    const att = await Attendance.find({ employee: { $in: memberIds }, date: today() });
    const myAssignments = await TaskAssignment.find({ employee: emp._id }).populate("task");
    res.json({
      success: true,
      role,
      kpis: {
        members: members.length,
        projects: tasks.length,
        pendingReviews: pendingReviews.length,
        lateReports: Math.max(0, members.length * 4 - reports.length),
        present: att.filter((a) => a.checkIn).length,
      },
      members,
      tasks,
      pendingReviews,
      myAssignments,
      reports,
    });
  }

  if (role === "employee") {
    const assignments = await TaskAssignment.find({ employee: emp._id }).populate("task");
    const att = await Attendance.findOne({ employee: emp._id, date: today() });
    const reports = await TaskReport.find({ employee: emp._id, date: today() });
    const review = await PerformanceReview.findOne({ employee: emp._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      role,
      kpis: {
        tasks: assignments.length,
        open: assignments.filter((a) => a.status !== "completed").length,
        reports: reports.length,
        workingHours: att?.workingHours || 0,
        score: review?.score || 0,
        grade: review?.grade || "—",
      },
      assignments,
      attendance: att,
      reports,
      review,
    });
  }
});

export const weeklyAnalytics = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== "admin" && req.user.employee?.team) {
    const members = await Employee.find({
      team: req.user.employee.team._id || req.user.employee.team,
    }).select("_id");
    filter.employee = { $in: members.map((m) => m._id) };
  }
  const reports = await TaskReport.find(filter).sort({ createdAt: -1 }).limit(200).populate("employee");
  const assignments = await TaskAssignment.find(filter.employee ? { employee: filter.employee } : {})
    .populate("employee");
  res.json({ success: true, reports, assignments });
});
