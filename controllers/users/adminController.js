
import AdminRepository from "../../repositories/user/AdminRepository.js";
import catchAsync from "../../utils/catchAsync.js";


const adminControllers = {}

adminControllers.fetchAllAdmins = catchAsync(async (req, res, next) => {
  
  const students = AdminRepository.findAllStudents();

  res.status(200).json({
    status: 'success',
    results: students.length,
    data: {
      students,
    },
  });
});



export default studentControllers