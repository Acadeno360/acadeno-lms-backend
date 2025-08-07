import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fileUploadConfig from '../config/fileUpload.js';
import AppError from './appError.js';
import logger from './logger.js';

/**
 * File upload utility functions
 */
class FileUploadUtils {
  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @param {string} extension - File extension
   * @returns {string} Unique filename
   */
  static generateUniqueFilename(originalName, extension) {
    const timestamp = Date.now();
    const randomString = uuidv4().substring(0, 8);
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${timestamp}_${randomString}_${sanitizedName}.${extension}`;
  }

  /**
   * Get file extension from filename
   * @param {string} filename - Filename
   * @returns {string} File extension
   */
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase().substring(1);
  }

  /**
   * Get file type category
   * @param {string} mimeType - MIME type
   * @returns {string} File type category
   */
  static getFileTypeCategory(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/pdf')) return 'document';
    if (mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
    if (mimeType.startsWith('text/')) return 'text';
    return 'other';
  }

  /**
   * Validate file size
   * @param {number} fileSize - File size in bytes
   * @param {string} storageType - Storage type (local, cloudinary, s3)
   * @returns {boolean} Is valid
   */
  static validateFileSize(fileSize, storageType = 'local') {
    const config = fileUploadConfig[storageType] || fileUploadConfig.local;
    const maxSize = config.maxFileSize;
    
    if (fileSize < fileUploadConfig.validation.minFileSize) {
      throw new AppError('File size is too small', 400);
    }
    
    if (fileSize > maxSize) {
      throw new AppError(`File size exceeds maximum limit of ${this.formatFileSize(maxSize)}`, 400);
    }
    
    return true;
  }

  /**
   * Validate file type
   * @param {string} mimeType - MIME type
   * @param {string} storageType - Storage type
   * @returns {boolean} Is valid
   */
  static validateFileType(mimeType, storageType = 'local') {
    const config = fileUploadConfig[storageType] || fileUploadConfig.local;
    const allowedTypes = config.allowedMimeTypes;
    
    if (!allowedTypes.includes(mimeType)) {
      throw new AppError(`File type ${mimeType} is not allowed`, 400);
    }
    
    return true;
  }

  /**
   * Validate filename
   * @param {string} filename - Filename
   * @returns {boolean} Is valid
   */
  static validateFilename(filename) {
    if (!filename || filename.length === 0) {
      throw new AppError('Filename is required', 400);
    }
    
    if (filename.length > fileUploadConfig.validation.maxFileNameLength) {
      throw new AppError('Filename is too long', 400);
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      throw new AppError('Filename contains invalid characters', 400);
    }
    
    return true;
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create directory if it doesn't exist
   * @param {string} dirPath - Directory path
   */
  static async ensureDirectoryExists(dirPath) {
    try {
      await fs.ensureDir(dirPath);
    } catch (error) {
      logger.error(`Error creating directory ${dirPath}:`, error);
      throw new AppError('Failed to create upload directory', 500);
    }
  }

  /**
   * Clean up temporary files
   * @param {string|Array} filePaths - File path(s) to delete
   */
  static async cleanupTempFiles(filePaths) {
    if (!fileUploadConfig.general.cleanupTempFiles) return;
    
    const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
    
    for (const filePath of paths) {
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
          logger.info(`Cleaned up temp file: ${filePath}`);
        }
      } catch (error) {
        logger.error(`Error cleaning up temp file ${filePath}:`, error);
      }
    }
  }

  /**
   * Optimize image using Sharp
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Object} options - Optimization options
   * @returns {Buffer} Optimized image buffer
   */
  static async optimizeImage(imageBuffer, options = {}) {
    if (!fileUploadConfig.general.enableImageOptimization) {
      return imageBuffer;
    }

    try {
      const {
        quality = fileUploadConfig.general.imageQuality,
        maxWidth = fileUploadConfig.general.maxWidth,
        maxHeight = fileUploadConfig.general.maxHeight,
        format = 'jpeg'
      } = options;

      let sharpInstance = sharp(imageBuffer);

      // Resize if needed
      const metadata = await sharpInstance.metadata();
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert format and set quality
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
        default:
          sharpInstance = sharpInstance.jpeg({ quality });
      }

      return await sharpInstance.toBuffer();
    } catch (error) {
      logger.error('Error optimizing image:', error);
      return imageBuffer; // Return original if optimization fails
    }
  }

  /**
   * Generate thumbnail
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Object} options - Thumbnail options
   * @returns {Buffer} Thumbnail buffer
   */
  static async generateThumbnail(imageBuffer, options = {}) {
    if (!fileUploadConfig.general.generateThumbnails) {
      return null;
    }

    try {
      const {
        width = fileUploadConfig.general.thumbnailSize.width,
        height = fileUploadConfig.general.thumbnailSize.height,
        quality = fileUploadConfig.general.imageQuality
      } = options;

      const thumbnail = await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toBuffer();

      return thumbnail;
    } catch (error) {
      logger.error('Error generating thumbnail:', error);
      return null;
    }
  }

  /**
   * Calculate file hash for duplicate detection
   * @param {Buffer} fileBuffer - File buffer
   * @returns {string} File hash
   */
  static async calculateFileHash(fileBuffer) {
    const crypto = await import('crypto');
    return crypto.createHash('md5').update(fileBuffer).digest('hex');
  }

  /**
   * Sanitize filename
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Get upload path for specific type
   * @param {string} uploadType - Upload type (profile, resume, etc.)
   * @param {string} storageType - Storage type
   * @returns {string} Upload path
   */
  static getUploadPath(uploadType = 'general', storageType = 'local') {
    if (storageType === 'local') {
      const basePath = fileUploadConfig.local.uploadPath;
      return path.join(basePath, uploadType);
    }
    return uploadType;
  }

  /**
   * Validate upload type configuration
   * @param {string} uploadType - Upload type
   * @param {string} fieldName - Field name
   * @returns {Object} Upload type configuration
   */
  static validateUploadType(uploadType, fieldName) {
    const config = fileUploadConfig.uploadTypes[uploadType];
    
    if (!config) {
      throw new AppError(`Invalid upload type: ${uploadType}`, 400);
    }

    if (uploadType === 'named' && !config.fields[fieldName]) {
      throw new AppError(`Invalid field name: ${fieldName}`, 400);
    }

    return config;
  }
}

export default FileUploadUtils; 