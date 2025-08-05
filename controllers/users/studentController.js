import ParentRepository from "../../repositories/user/parentRepository.js";
import StudentRepository from "../../repositories/user/studentRepository.js";
import catchAsync from "../../utils/catchAsync.js";


const studentControllers = {}


// fetch all students
studentControllers.fetchAllStudents = catchAsync(async (req, res, next) => {
  
  const students = await StudentRepository.findAllStudents();

  res.status(200).json({
    status: 'success',
    results: students.length,
    data: {
      students,
    },
  });
});

// create a new student entry
studentControllers.createStudent = catchAsync(async (req, res, next) => {
  
  const data = req.body
  const studentData = data

   if (false) {
    const parent = await ParentRepository.create(data.parent)
    studentData.parent = parent._id
  }
  
  const student = await StudentRepository.create(studentData);
 

  res.status(200).json({
    status: 'success',
    message: 'user created successfully'
  });
});





export default studentControllers