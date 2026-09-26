import { body } from "express-validator";

export const loginRules = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const departmentRules = [
  body("name").trim().notEmpty().withMessage("Department name is required"),
  body("code").trim().notEmpty().withMessage("Department code is required"),
];

export const teamRules = [
  body("name").trim().notEmpty().withMessage("Team name is required"),
  body("department").notEmpty().withMessage("Department is required"),
];

export const userAccountRules = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
];

export const taskRules = [
  body("title").trim().notEmpty().withMessage("Task title is required"),
];

export const leaveRules = [
  body("type").isIn(["casual", "sick", "emergency"]).withMessage("Invalid leave type"),
  body("from").notEmpty().withMessage("Start date is required"),
  body("to").notEmpty().withMessage("End date is required"),
];

export const reportRules = [
  body("workDone").trim().notEmpty().withMessage("Work done is required"),
  body("slot").notEmpty().withMessage("Report slot is required"),
];
