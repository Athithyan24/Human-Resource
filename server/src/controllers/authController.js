import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/tokens.js";

function serialize(user) {
  return {
    id: user._id,
    username: user.username,
    role: user.role,
    employee: user.employee,
  };
}

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).populate({
    path: "employee",
    populate: ["department", "team"],
  });
  if (!user) throw new ApiError(401, "Invalid username or password");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid username or password");
  const token = signToken({ id: user._id, role: user.role });
  res.json({ success: true, token, user: serialize(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: serialize(req.user) });
});
