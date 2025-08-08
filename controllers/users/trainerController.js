import TrainerRepository from "../../repositories/user/trainerRepository.js";
import catchAsync from "../../utils/catchAsync.js";
import FileUploadService from "../../services/FileUploadService.js";
import AppError from "../../utils/appError.js";

const trainerController = {}

// create a trainer
trainerController.createTrainer = catchAsync(async(req, res, next) => {
    const data = req.body

    const trainer = await TrainerRepository.create(data)
    
    if (!trainer) {
        return next(new AppError("Trainer creation failed", 500));
    }

    res.status(200).json({
        status: 'success',
        message: 'trainer created successfully'
    });
})

// fetch all trainers
trainerController.fetchAllTrainers = catchAsync(async (req, res, next) => {
  
  const trainers = await TrainerRepository.findAllTrainers();

  res.status(200).json({
    status: 'success',
    results: trainers.length,
    data: {
      trainers,
    },
  });
});

// Upload profile image for trainer
trainerController.uploadProfileImage = catchAsync(async (req, res, next) => {
  const { trainerId } = req.params;
  
  if (!req.file) {
    return next(new AppError('Please upload a profile image', 400));
  }

  // Check if trainer exists
  const trainer = await TrainerRepository.findById(trainerId);
  if (!trainer) {
    return next(new AppError('Trainer not found', 404));
  }

  // Upload image using FileUploadService
  const fileUploadService = new FileUploadService();
  const uploadResult = await fileUploadService.uploadSingleFile(req.file, {
    uploadType: 'profile',
    storageType: req.body.storageType || 'cloudinary',
    optimizeImage: true,
    generateThumbnail: true
  });

  // Update trainer profile image
  const updatedTrainer = await TrainerRepository.findByIdAndUpdate(
    trainerId,
    { profileImage: uploadResult.url },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image uploaded successfully',
    data: {
      trainer: updatedTrainer,
      imageInfo: {
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        filename: uploadResult.filename
      }
    }
  });
});

// Update profile image for trainer
trainerController.updateProfileImage = catchAsync(async (req, res, next) => {
  const { trainerId } = req.params;
  
  if (!req.file) {
    return next(new AppError('Please upload a new profile image', 400));
  }

  // Check if trainer exists
  const trainer = await TrainerRepository.findById(trainerId);
  if (!trainer) {
    return next(new AppError('Trainer not found', 404));
  }

  // Delete old profile image if exists
  if (trainer.profileImage) {
    try {
      const fileUploadService = new FileUploadService();
      await fileUploadService.deleteFile(trainer.profileImage);
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

  // Update trainer profile image
  const updatedTrainer = await TrainerRepository.findByIdAndUpdate(
    trainerId,
    { profileImage: uploadResult.url },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image updated successfully',
    data: {
      trainer: updatedTrainer,
      imageInfo: {
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        filename: uploadResult.filename
      }
    }
  });
});

// Delete profile image for trainer
trainerController.deleteProfileImage = catchAsync(async (req, res, next) => {
  const { trainerId } = req.params;

  // Check if trainer exists
  const trainer = await TrainerRepository.findById(trainerId);
  if (!trainer) {
    return next(new AppError('Trainer not found', 404));
  }

  if (!trainer.profileImage) {
    return next(new AppError('No profile image to delete', 400));
  }

  // Delete image from storage
  try {
    const fileUploadService = new FileUploadService();
    await fileUploadService.deleteFile(trainer.profileImage);
  } catch (error) {
    console.log('Error deleting profile image:', error);
  }

  // Update trainer to remove profile image
  const updatedTrainer = await TrainerRepository.findByIdAndUpdate(
    trainerId,
    { profileImage: null },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile image deleted successfully',
    data: {
      trainer: updatedTrainer
    }
  });
});

// Get trainer profile with image
trainerController.getTrainerProfile = catchAsync(async (req, res, next) => {
  const { trainerId } = req.params;

  const trainer = await TrainerRepository.findById(trainerId);
  if (!trainer) {
    return next(new AppError('Trainer not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      trainer
    }
  });
});

export default trainerController