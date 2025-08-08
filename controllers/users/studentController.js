import ParentRepository from "../../repositories/user/parentRepository.js";
import StudentRepository from "../../repositories/user/studentRepository.js";
import catchAsync from "../../utils/catchAsync.js";
import FileUploadService from "../../services/FileUploadService.js";
import AppError from "../../utils/appError.js";

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

// Upload profile image for student
studentControllers.uploadProfileImage = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  
  if (!req.file) {
    return next(new AppError('Please upload a profile image', 400));
  }

  // Check if student exists
  const student = await StudentRepository.findById(studentId);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  // Upload image using FileUploadService
  const fileUploadService = new FileUploadService();
  const uploadResult = await fileUploadService.uploadSingleFile(req.file, {
    uploadType: 'profile',
    storageType: req.body.storageType || 'cloudinary',
    optimizeImage: true,
    generateThumbnail: true
  });

  // Update student profile image
  const updatedStudent = await StudentRepository.findByIdAndUpdate(
    studentId,
    { profileImage: uploadResult.url },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image uploaded successfully',
    data: {
      student: updatedStudent,
      imageInfo: {
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        filename: uploadResult.filename
      }
    }
  });
});

// Update profile image for student
studentControllers.updateProfileImage = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  
  if (!req.file) {
    return next(new AppError('Please upload a new profile image', 400));
  }

  // Check if student exists
  const student = await StudentRepository.findById(studentId);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  // Delete old profile image if exists
  if (student.profileImage) {
    try {
      const fileUploadService = new FileUploadService();
      await fileUploadService.deleteFile(student.profileImage);
    } catch (error) {
      console.log('Error deleting old profile image:', error);
    }
  }

  // Upload new image
  const fileUploadService = new FileUploadService();
  const uploadResult = await fileUploadService.uploadSingleFile(req.file, {
    uploadType: 'profile',
    storageType: req.body.storageType || 'cloudinary',
    optimizeImage: true,
    generateThumbnail: true
  });

  // Update student profile image
  const updatedStudent = await StudentRepository.findByIdAndUpdate(
    studentId,
    { profileImage: uploadResult.url },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image updated successfully',
    data: {
      student: updatedStudent,
      imageInfo: {
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        filename: uploadResult.filename
      }
    }
  });
});

// Delete profile image for student
studentControllers.deleteProfileImage = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;

  // Check if student exists
  const student = await StudentRepository.findById(studentId);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  if (!student.profileImage) {
    return next(new AppError('No profile image to delete', 400));
  }

  // Delete image from storage
  try {
    const fileUploadService = new FileUploadService();
    await fileUploadService.deleteFile(student.profileImage);
  } catch (error) {
    console.log('Error deleting profile image:', error);
  }

  // Update student to remove profile image
  const updatedStudent = await StudentRepository.findByIdAndUpdate(
    studentId,
    { profileImage: null },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image deleted successfully',
    data: {
      student: updatedStudent
    }
  });
});

// Get student profile with image
studentControllers.getStudentProfile = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;

  const student = await StudentRepository.findById(studentId);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      student
    }
  });
});

export default studentControllers