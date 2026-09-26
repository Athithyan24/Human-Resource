import { Employee } from "../models/Employee.js";
import { Department } from "../models/Department.js";
import { Team } from "../models/Team.js";

const employeePopulate = [
  { path: "department" },
  { path: "team", populate: { path: "leader" } },
  { path: "manager" },
  { path: "user", select: "username role isActive" },
];

export const employeeRepo = {
  findAll: (filter = {}) => Employee.find(filter).populate(employeePopulate).sort({ createdAt: -1 }),
  findById: (id) => Employee.findById(id).populate(employeePopulate),
};

export const departmentRepo = {
  findAll: () => Department.find().populate("head").sort({ name: 1 }),
};

export const teamRepo = {
  findAll: () =>
    Team.find()
      .populate("department")
      .populate("leader")
      .populate("members")
      .sort({ name: 1 }),
};
