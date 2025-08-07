import multer from 'multer';
import fileUploadConfig from '../config/fileUpload.js';
import FileUploadUtils from '../utils/fileUpload.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

/**
 * File upload middleware configurations
 */

// Memory storage for processing files before uploading to cloud storage
const memoryStorage = multer.memoryStorage();

// Disk storage for local file uploads
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.body.uploadType || 'general';
    const uploadPath = FileUploadUtils.getUploadPath(uploadType, 'local');
    
    FileUploadUtils.ensureDirectoryExists(uploadPath)
      .then(() => cb(null, uploadPath))
      .catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    const extension = FileUploadUtils.getFileExtension(file.originalname);
    const uniqueFilename = FileUploadUtils.generateUniqueFilename(file.originalname, extension);
    cb(null, uniqueFilename);
  }
});

/**
 * File filter function
 * @param {Object} req - Express request object
 * @param {Object} file - File object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  try {
    // Get storage type from request or use default
    const storageType = req.body.storageType || fileUploadConfig.general.defaultStorage;
    const config = fileUploadConfig[storageType] || fileUploadConfig.local;

    // Validate file type
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      return cb(new AppError(`File type ${file.mimetype} is not allowed`, 400), false);
    }

    // Validate filename
    FileUploadUtils.validateFilename(file.originalname);

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

/**
 * Create multer instance with memory storage
 * @param {Object} options - Multer options
 * @returns {multer.Multer} Multer instance
 */
const createMemoryMulter = (options = {}) => {
  const {
    maxFileSize = fileUploadConfig.local.maxFileSize,
    maxFiles = 1
  } = options;

  return multer({
    storage: memoryStorage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles
    }
  });
};

/**
 * Create multer instance with disk storage
 * @param {Object} options - Multer options
 * @returns {multer.Multer} Multer instance
 */
const createDiskMulter = (options = {}) => {
  const {
    maxFileSize = fileUploadConfig.local.maxFileSize,
    maxFiles = 1
  } = options;

  return multer({
    storage: diskStorage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles
    }
  });
};

/**
 * Single file upload middleware
 * @param {Object} options - Upload options
 * @returns {Function} Express middleware
 */
export const singleFileUpload = (options = {}) => {
  const {
    storageType = 'memory', // 'memory' or 'disk'
    fieldName = 'file',
    maxFileSize,
    ...multerOptions
  } = options;

  const multerInstance = storageType === 'disk' 
    ? createDiskMulter({ maxFileSize, ...multerOptions })
    : createMemoryMulter({ maxFileSize, ...multerOptions });

  return multerInstance.single(fieldName);
};

/**
 * Multiple files upload middleware
 * @param {Object} options - Upload options
 * @returns {Function} Express middleware
 */
export const multipleFilesUpload = (options = {}) => {
  const {
    storageType = 'memory',
    fieldName = 'files',
    maxFileSize,
    maxFiles = 10,
    ...multerOptions
  } = options;

  const multerInstance = storageType === 'disk'
    ? createDiskMulter({ maxFileSize, maxFiles, ...multerOptions })
    : createMemoryMulter({ maxFileSize, maxFiles, ...multerOptions });

  return multerInstance.array(fieldName, maxFiles);
};

/**
 * Named files upload middleware
 * @param {Object} options - Upload options
 * @returns {Function} Express middleware
 */
export const namedFilesUpload = (options = {}) => {
  const {
    storageType = 'memory',
    fields = fileUploadConfig.uploadTypes.named.fields,
    maxFileSize,
    ...multerOptions
  } = options;

  const multerInstance = storageType === 'disk'
    ? createDiskMulter({ maxFileSize, ...multerOptions })
    : createMemoryMulter({ maxFileSize, ...multerOptions });

  // Convert fields configuration to multer format
  const multerFields = Object.entries(fields).map(([name, config]) => ({
    name,
    maxCount: config.maxCount
  }));

  return multerInstance.fields(multerFields);
};

/**
 * Any files upload middleware (accepts any field name)
 * @param {Object} options - Upload options
 * @returns {Function} Express middleware
 */
export const anyFilesUpload = (options = {}) => {
  const {
    storageType = 'memory',
    maxFileSize,
    maxFiles = 10,
    ...multerOptions
  } = options;

  const multerInstance = storageType === 'disk'
    ? createDiskMulter({ maxFileSize, maxFiles, ...multerOptions })
    : createMemoryMulter({ maxFileSize, maxFiles, ...multerOptions });

  return multerInstance.any();
};

/**
 * Error handling middleware for multer
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          status: 'error',
          message: 'File size exceeds the limit',
          error: error.message
        });
      
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          status: 'error',
          message: 'Too many files uploaded',
          error: error.message
        });
      
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          status: 'error',
          message: 'Unexpected file field',
          error: error.message
        });
      
      default:
        return res.status(400).json({
          status: 'error',
          message: 'File upload error',
          error: error.message
        });
    }
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }

  logger.error('File upload error:', error);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error during file upload'
  });
};

/**
 * Validate uploaded files middleware
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
export const validateUploadedFiles = (options = {}) => {
  return (req, res, next) => {
    try {
      const {
        required = true,
        minFiles = 1,
        maxFiles = 10,
        allowedTypes = [],
        maxFileSize
      } = options;

      const files = req.files || (req.file ? [req.file] : []);

      // Check if files are required
      if (required && (!files || files.length === 0)) {
        return res.status(400).json({
          status: 'error',
          message: 'Files are required'
        });
      }

      // Check file count
      if (files.length < minFiles) {
        return res.status(400).json({
          status: 'error',
          message: `Minimum ${minFiles} file(s) required`
        });
      }

      if (files.length > maxFiles) {
        return res.status(400).json({
          status: 'error',
          message: `Maximum ${maxFiles} files allowed`
        });
      }

      // Validate each file
      for (const file of files) {
        // Check file size
        if (maxFileSize && file.size > maxFileSize) {
          return res.status(400).json({
            status: 'error',
            message: `File ${file.originalname} exceeds size limit`
          });
        }

        // Check file type
        if (allowedTypes.length > 0) {
          const fileType = FileUploadUtils.getFileTypeCategory(file.mimetype);
          if (!allowedTypes.includes(fileType)) {
            return res.status(400).json({
              status: 'error',
              message: `File type '${fileType}' not allowed for ${file.originalname}`
            });
          }
        }
      }

      next();
    } catch (error) {
      logger.error('File validation error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'File validation error'
      });
    }
  };
};

/**
 * Clean up temporary files middleware
 * @returns {Function} Express middleware
 */
export const cleanupTempFiles = () => {
  return (req, res, next) => {
    // Clean up temp files after response is sent
    res.on('finish', () => {
      if (req.files) {
        const filePaths = req.files.map(file => file.path).filter(Boolean);
        if (filePaths.length > 0) {
          FileUploadUtils.cleanupTempFiles(filePaths);
        }
      } else if (req.file && req.file.path) {
        FileUploadUtils.cleanupTempFiles(req.file.path);
      }
    });

    next();
  };
};

export default {
  singleFileUpload,
  multipleFilesUpload,
  namedFilesUpload,
  anyFilesUpload,
  handleMulterError,
  validateUploadedFiles,
  cleanupTempFiles
}; 