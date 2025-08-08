
import AdminRepository from "../../repositories/user/AdminRepository.js";
import catchAsync from "../../utils/catchAsync.js";
import FileUploadService from "../../services/FileUploadService.js";
import AppError from "../../utils/appError.js";

const adminControllers = {}

// Fetch all admins
adminControllers.fetchAllAdmins = catchAsync(async (req, res, next) => {
  
  const admins = await AdminRepository.findAllAdmins();

  res.status(200).json({
    status: 'success',
    results: admins.length,
    data: {
      admins,
    },
  });
});

// Create a new admin
adminControllers.createAdmin = catchAsync(async (req, res, next) => {
  const data = req.body;
  
  const admin = await AdminRepository.create(data);
  
  if (!admin) {
    return next(new AppError("Admin creation failed", 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Admin created successfully',
    data: {
      admin
    }
  });
});

// Upload profile image for admin
adminControllers.uploadProfileImage = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;
  
  if (!req.file) {
    return next(new AppError('Please upload a profile image', 400));
  }

  // Check if admin exists
  const admin = await AdminRepository.findById(adminId);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // Upload image using FileUploadService
  const fileUploadService = new FileUploadService();
  const uploadResult = await fileUploadService.uploadSingleFile(req.file, {
    uploadType: 'profile',
    storageType: req.body.storageType || 'cloudinary',
    optimizeImage: true,
    generateThumbnail: true
  });

  // Update admin profile image
  const updatedAdmin = await AdminRepository.findByIdAndUpdate(
    adminId,
    { profileImage: uploadResult.url },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image uploaded successfully',
    data: {
      admin: updatedAdmin,
      imageInfo: {
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        filename: uploadResult.filename
      }
    }
  });
});

// Update profile image for admin
adminControllers.updateProfileImage = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;
  
  if (!req.file) {
    return next(new AppError('Please upload a new profile image', 400));
  }

  // Check if admin exists
  const admin = await AdminRepository.findById(adminId);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  // Delete old profile image if exists
  if (admin.profileImage) {
    try {
      const fileUploadService = new FileUploadService();
      await fileUploadService.deleteFile(admin.profileImage);
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

  // Update admin profile image
  const updatedAdmin = await AdminRepository.findByIdAndUpdate(
    adminId,
    { profileImage: uploadResult.url },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image updated successfully',
    data: {
      admin: updatedAdmin,
      imageInfo: {
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        filename: uploadResult.filename
      }
    }
  });
});

// Delete profile image for admin
adminControllers.deleteProfileImage = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;

  // Check if admin exists
  const admin = await AdminRepository.findById(adminId);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  if (!admin.profileImage) {
    return next(new AppError('No profile image to delete', 400));
  }

  // Delete image from storage
  try {
    const fileUploadService = new FileUploadService();
    await fileUploadService.deleteFile(admin.profileImage);
  } catch (error) {
    console.log('Error deleting profile image:', error);
  }

  // Update admin to remove profile image
  const updatedAdmin = await AdminRepository.findByIdAndUpdate(
    adminId,
    { profileImage: null },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image deleted successfully',
    data: {
      admin: updatedAdmin
    }
  });
});

// Get admin profile with image
adminControllers.getAdminProfile = catchAsync(async (req, res, next) => {
  const { adminId } = req.params;

  const admin = await AdminRepository.findById(adminId);
  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

export default adminControllers