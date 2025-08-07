import FileUploadService from '../services/FileUploadService.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

/**
 * File upload controller
 * Handles all file upload operations
 */
class FileUploadController {
  constructor() {
    this.fileUploadService = new FileUploadService();
  }

  /**
   * Upload single file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  uploadSingleFile = catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const {
      storageType,
      uploadType = 'general',
      optimizeImage = true,
      generateThumbnail = true
    } = req.body;

    const result = await this.fileUploadService.uploadSingleFile(req.file, {
      storageType,
      uploadType,
      optimizeImage,
      generateThumbnail
    });

    res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: result
    });
  });

  /**
   * Upload multiple files
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  uploadMultipleFiles = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    const {
      storageType,
      uploadType = 'general',
      optimizeImage = true,
      generateThumbnail = true
    } = req.body;

    const results = await this.fileUploadService.uploadMultipleFiles(req.files, {
      storageType,
      uploadType,
      optimizeImage,
      generateThumbnail
    });

    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    res.status(200).json({
      status: 'success',
      message: `Uploaded ${successfulUploads.length} files successfully`,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successfulUploads.length,
          failed: failedUploads.length
        }
      }
    });
  });

  /**
   * Upload named files
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  uploadNamedFiles = catchAsync(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    const {
      storageType,
      optimizeImage = true,
      generateThumbnail = true
    } = req.body;

    const results = await this.fileUploadService.uploadNamedFiles(req.files, {
      storageType,
      optimizeImage,
      generateThumbnail
    });

    res.status(200).json({
      status: 'success',
      message: 'Files uploaded successfully',
      data: results
    });
  });

  /**
   * Delete file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  deleteFile = catchAsync(async (req, res, next) => {
    const { fileId } = req.params;
    const { storageType } = req.query;

    if (!fileId) {
      return next(new AppError('File ID is required', 400));
    }

    const result = await this.fileUploadService.deleteFile(fileId, { storageType });

    res.status(200).json({
      status: 'success',
      message: 'File deleted successfully',
      data: { deleted: result }
    });
  });

  /**
   * Get file information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  getFileInfo = catchAsync(async (req, res, next) => {
    const { fileId } = req.params;
    const { storageType } = req.query;

    if (!fileId) {
      return next(new AppError('File ID is required', 400));
    }

    const fileInfo = await this.fileUploadService.getFileInfo(fileId, { storageType });

    res.status(200).json({
      status: 'success',
      data: fileInfo
    });
  });

  /**
   * Generate signed URL
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  generateSignedUrl = catchAsync(async (req, res, next) => {
    const { fileId } = req.params;
    const { storageType, expiresIn = 3600 } = req.query;

    if (!fileId) {
      return next(new AppError('File ID is required', 400));
    }

    const signedUrl = await this.fileUploadService.generateSignedUrl(fileId, {
      storageType,
      expiresIn: parseInt(expiresIn)
    });

    res.status(200).json({
      status: 'success',
      data: {
        signedUrl,
        expiresIn: parseInt(expiresIn)
      }
    });
  });

  /**
   * Check if file exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  fileExists = catchAsync(async (req, res, next) => {
    const { fileId } = req.params;
    const { storageType } = req.query;

    if (!fileId) {
      return next(new AppError('File ID is required', 400));
    }

    const exists = await this.fileUploadService.fileExists(fileId, storageType);

    res.status(200).json({
      status: 'success',
      data: { exists }
    });
  });

  /**
   * Get upload configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  getUploadConfig = catchAsync(async (req, res, next) => {
    const { storageType } = req.query;

    const config = this.fileUploadService.getStorageConfig(storageType);
    const availableServices = this.fileUploadService.getAvailableStorageServices();

    res.status(200).json({
      status: 'success',
      data: {
        config,
        availableServices,
        defaultStorage: this.fileUploadService.defaultStorage
      }
    });
  });

  /**
   * Health check for file upload service
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  healthCheck = catchAsync(async (req, res, next) => {
    const availableServices = this.fileUploadService.getAvailableStorageServices();
    const defaultStorage = this.fileUploadService.defaultStorage;

    res.status(200).json({
      status: 'success',
      message: 'File upload service is healthy',
      data: {
        availableServices,
        defaultStorage,
        timestamp: new Date().toISOString()
      }
    });
  });

  /**
   * Upload student-specific files
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  uploadStudentFiles = catchAsync(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    const {
      storageType,
      studentId,
      optimizeImage = true,
      generateThumbnail = true
    } = req.body;

    // Validate student ID
    if (!studentId) {
      return next(new AppError('Student ID is required', 400));
    }

    const results = await this.fileUploadService.uploadNamedFiles(req.files, {
      storageType,
      uploadType: 'student',
      optimizeImage,
      generateThumbnail,
      metadata: { studentId }
    });

    res.status(200).json({
      status: 'success',
      message: 'Student files uploaded successfully',
      data: {
        studentId,
        results
      }
    });
  });

  /**
   * Upload course materials
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  uploadCourseMaterials = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    const {
      storageType,
      courseId,
      materialType = 'general',
      optimizeImage = true,
      generateThumbnail = true
    } = req.body;

    // Validate course ID
    if (!courseId) {
      return next(new AppError('Course ID is required', 400));
    }

    const results = await this.fileUploadService.uploadMultipleFiles(req.files, {
      storageType,
      uploadType: 'course',
      optimizeImage,
      generateThumbnail,
      metadata: { courseId, materialType }
    });

    const successfulUploads = results.filter(result => result.success);

    res.status(200).json({
      status: 'success',
      message: `Uploaded ${successfulUploads.length} course materials successfully`,
      data: {
        courseId,
        materialType,
        results,
        summary: {
          total: results.length,
          successful: successfulUploads.length,
          failed: results.length - successfulUploads.length
        }
      }
    });
  });

  /**
   * Upload trainer profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  uploadTrainerProfile = catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const {
      storageType,
      trainerId,
      optimizeImage = true,
      generateThumbnail = true
    } = req.body;

    // Validate trainer ID
    if (!trainerId) {
      return next(new AppError('Trainer ID is required', 400));
    }

    const result = await this.fileUploadService.uploadSingleFile(req.file, {
      storageType,
      uploadType: 'trainer',
      optimizeImage,
      generateThumbnail,
      metadata: { trainerId }
    });

    res.status(200).json({
      status: 'success',
      message: 'Trainer profile uploaded successfully',
      data: {
        trainerId,
        result
      }
    });
  });
}

export default new FileUploadController(); 