// authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import catchAsync from "../../utils/catchAsync.js";


import AppError from "../../utils/appError.js";
import User from "../../models/user/index.js";

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const authController = {};

authController.login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password ) {
    return next(new AppError("Please provide email, password and role", 400));
  }

  const query = { email }; // default query for user

  if (role) {
    query.role = role;
  }

  const user = await User.findOne(query).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Incorrect email, password or role", 401));
  }

  const token = signToken(user._id, user.role);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

authController.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export default authController;
