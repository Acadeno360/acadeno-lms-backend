import jwt from "jsonwebtoken";

import catchAsync from "../utils/catchAsync.js";
import UserModel from "../models/user/index.js";
import AppError from "../utils/appError.js";

export const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new AppError("You are not logged in", 401));
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await UserModel.findById(decoded.id);

  if (!user) {
    return next(new AppError("The user no longer exists", 401));
  }

  req.user = user;
  next();
});
