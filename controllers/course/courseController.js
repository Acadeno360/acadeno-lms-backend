

import CourseRepository from "../../repositories/course/courseRepository.js";
import catchAsync from "../../utils/catchAsync.js";


const courseControllers = {}

courseControllers.createCourse = catchAsync(async (req, res, next) => {
  
  const data = req.body
  const course = await CourseRepository.create(data);

  if (!course) {
    return next(new AppError("Course creation failed", 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'course created successfully'
  });
});



export default courseControllers