import LocalStorageService from './storage/LocalStorageService.js';
import CloudinaryStorageService from './storage/CloudinaryStorageService.js';
import S3StorageService from './storage/S3StorageService.js';
import fileUploadConfig from '../config/fileUpload.js';
import FileUploadUtils from '../utils/fileUpload.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

/**
 * Main file upload service
 * Orchestrates different storage providers and upload types
 */
class FileUploadService {
  constructor() {
    this.storageServices = {
      local: new LocalStorageService(),
      cloudinary: new CloudinaryStorageService(),
      s3: new S3StorageService()
    };
    
    this.defaultStorage = fileUploadConfig.general.defaultStorage;
    this.initializeStorageServices();
  }

  /**
   * Initialize storage services
   */
  initializeStorageServices() {
    // Validate default storage configuration
    if (!this.storageServices[this.defaultStorage]?.validateConfig()) {
      logger.warn(`Default storage '${this.defaultStorage}' is not properly configured, falling back to local storage`);
      this.defaultStorage = 'local';
    }

    // Log available storage services
    const availableServices = Object.keys(this.storageServices).filter(
      service => this.storageServices[service].validateConfig()
    );
    
    logger.info(`Available storage services: ${availableServices.join(', ')}`);
    logger.info(`Default storage service: ${this.defaultStorage}`);
  }

  /**
   * Get storage service by type
   * @param {string} storageType - Storage type
   * @returns {BaseStorageService} Storage service instance
   */
  getStorageService(storageType = null) {
    const type = storageType || this.defaultStorage;
    
    if (!this.storageServices[type]) {
      throw new AppError(`Storage service '${type}' not found`, 400);
    }
    
    if (!this.storageServices[type].validateConfig()) {
      throw new AppError(`Storage service '${type}' is not properly configured`, 500);
    }
    
    return this.storageServices[type];
  }

  /**
   * Upload single file
   * @param {Object} file - File object from multer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadSingleFile(file, options = {}) {
    try {
      const {
        storageType = this.defaultStorage,
        uploadType = 'general',
        ...uploadOptions
      } = options;

      // Validate upload type
      FileUploadUtils.validateUploadType('single', 'file');

      // Get storage service
      const storageService = this.getStorageService(storageType);

      // Upload file
      const result = await storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          uploadType,
          ...uploadOptions
        }
      );

      return result;

    } catch (error) {
      logger.error('Error in uploadSingleFile:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of file objects from multer
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Upload results
   */
  async uploadMultipleFiles(files, options = {}) {
    try {
      const {
        storageType = this.defaultStorage,
        uploadType = 'general',
        ...uploadOptions
      } = options;

      // Validate upload type
      const config = FileUploadUtils.validateUploadType('multiple', 'files');
      
      if (files.length > config.maxCount) {
        throw new AppError(`Maximum ${config.maxCount} files allowed`, 400);
      }

      // Get storage service
      const storageService = this.getStorageService(storageType);

      // Upload files
      const results = await storageService.uploadMultipleFiles(files, {
        uploadType,
        ...uploadOptions
      });

      return results;

    } catch (error) {
      logger.error('Error in uploadMultipleFiles:', error);
      throw error;
    }
  }

  /**
   * Upload named files (specific field names)
   * @param {Object} files - Files object from multer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload results
   */
  async uploadNamedFiles(files, options = {}) {
    try {
      const {
        storageType = this.defaultStorage,
        uploadType = 'general',
        ...uploadOptions
      } = options;

      // Validate upload type
      const config = FileUploadUtils.validateUploadType('named');

      const results = {};
      const storageService = this.getStorageService(storageType);

      // Process each field
      for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
        if (files[fieldName]) {
          const fieldFiles = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];
          
          if (fieldFiles.length > fieldConfig.maxCount) {
            throw new AppError(`Maximum ${fieldConfig.maxCount} files allowed for field '${fieldName}'`, 400);
          }

          const fieldResults = [];
          
          for (const file of fieldFiles) {
            // Validate file type if specified
            if (fieldConfig.allowedTypes && fieldConfig.allowedTypes.length > 0) {
              const fileType = FileUploadUtils.getFileTypeCategory(file.mimetype);
              if (!fieldConfig.allowedTypes.includes(fileType)) {
                fieldResults.push({
                  success: false,
                  originalName: file.originalname,
                  error: `File type '${fileType}' not allowed for field '${fieldName}'`
                });
                continue;
              }
            }

            try {
              const result = await storageService.uploadFile(
                file.buffer,
                file.originalname,
                file.mimetype,
                {
                  uploadType: fieldName,
                  ...uploadOptions
                }
              );
              fieldResults.push(result);
            } catch (error) {
              fieldResults.push({
                success: false,
                originalName: file.originalname,
                error: error.message
              });
            }
          }

          results[fieldName] = fieldResults;
        }
      }

      return results;

    } catch (error) {
      logger.error('Error in uploadNamedFiles:', error);
      throw error;
    }
  }

  /**
   * Delete file
   * @param {string} fileId - File identifier
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} Delete result
   */
  async deleteFile(fileId, options = {}) {
    try {
      const { storageType } = options;
      
      // Determine storage type from fileId if not provided
      let determinedStorageType = storageType;
      if (!determinedStorageType) {
        if (fileId.includes('cloudinary.com')) {
          determinedStorageType = 'cloudinary';
        } else if (fileId.includes('amazonaws.com')) {
          determinedStorageType = 's3';
        } else {
          determinedStorageType = 'local';
        }
      }

      const storageService = this.getStorageService(determinedStorageType);
      return await storageService.deleteFile(fileId, options);

    } catch (error) {
      logger.error('Error in deleteFile:', error);
      throw error;
    }
  }

  /**
   * Get file information
   * @param {string} fileId - File identifier
   * @param {Object} options - Options
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(fileId, options = {}) {
    try {
      const { storageType } = options;
      
      // Determine storage type from fileId if not provided
      let determinedStorageType = storageType;
      if (!determinedStorageType) {
        if (fileId.includes('cloudinary.com')) {
          determinedStorageType = 'cloudinary';
        } else if (fileId.includes('amazonaws.com')) {
          determinedStorageType = 's3';
        } else {
          determinedStorageType = 'local';
        }
      }

      const storageService = this.getStorageService(determinedStorageType);
      return await storageService.getFileInfo(fileId, options);

    } catch (error) {
      logger.error('Error in getFileInfo:', error);
      throw error;
    }
  }

  /**
   * Generate signed URL
   * @param {string} fileId - File identifier
   * @param {Object} options - URL options
   * @returns {Promise<string>} Signed URL
   */
  async generateSignedUrl(fileId, options = {}) {
    try {
      const { storageType } = options;
      
      // Determine storage type from fileId if not provided
      let determinedStorageType = storageType;
      if (!determinedStorageType) {
        if (fileId.includes('cloudinary.com')) {
          determinedStorageType = 'cloudinary';
        } else if (fileId.includes('amazonaws.com')) {
          determinedStorageType = 's3';
        } else {
          determinedStorageType = 'local';
        }
      }

      const storageService = this.getStorageService(determinedStorageType);
      return await storageService.generateSignedUrl(fileId, options);

    } catch (error) {
      logger.error('Error in generateSignedUrl:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param {string} fileId - File identifier
   * @param {string} storageType - Storage type
   * @returns {Promise<boolean>} File exists
   */
  async fileExists(fileId, storageType = null) {
    try {
      const storageService = this.getStorageService(storageType);
      return await storageService.fileExists(fileId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available storage services
   * @returns {Array} List of available storage services
   */
  getAvailableStorageServices() {
    return Object.keys(this.storageServices).filter(
      service => this.storageServices[service].validateConfig()
    );
  }

  /**
   * Get storage service configuration
   * @param {string} storageType - Storage type
   * @returns {Object} Storage configuration
   */
  getStorageConfig(storageType = null) {
    const type = storageType || this.defaultStorage;
    const service = this.storageServices[type];
    
    if (!service) {
      throw new AppError(`Storage service '${type}' not found`, 400);
    }
    
    return service.getConfig();
  }

  /**
   * Create upload directories (for local storage)
   * @param {Array} uploadTypes - Array of upload types
   */
  async createUploadDirectories(uploadTypes = ['general']) {
    const localService = this.storageServices.local;
    if (localService && localService.validateConfig()) {
      await localService.createUploadDirectories(uploadTypes);
    }
  }
}

export default FileUploadService; 