import studentRepository from "../../repositories/user/studentRepository.js";
import catchAsync from "../../utils/catchAsync.js";


const studentControllers = {}

studentControllers.fetchAllStudents = catchAsync(async (req, res, next) => {
  
  const students = studentRepository.findAllStudents();

  res.status(200).json({
    status: 'success',
    results: students.length,
    data: {
      students,
    },
  });
});



export default studentControllers