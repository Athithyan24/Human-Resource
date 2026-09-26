import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Authentication required");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate({
      path: "employee",
      populate: ["department", "team"],
    });
    if (!user || !user.isActive) throw new ApiError(401, "Invalid session");
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Session expired"));
    }
    next(err);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have access to this action"));
    }
    next();
  };
}
