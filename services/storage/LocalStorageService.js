import path from 'path';
import fs from 'fs-extra';
import BaseStorageService from './BaseStorageService.js';
import fileUploadConfig from '../../config/fileUpload.js';
import FileUploadUtils from '../../utils/fileUpload.js';
import AppError from '../../utils/appError.js';
import logger from '../../utils/logger.js';

/**
 * Local storage service implementation
 * Handles file uploads to local filesystem
 */
class LocalStorageService extends BaseStorageService {
  constructor() {
    super();
    this.config = fileUploadConfig.local;
    this.basePath = this.config.uploadPath;
  }

  /**
   * Upload a single file
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - Filename
   * @param {string} mimeType - MIME type
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(fileBuffer, filename, mimeType, options = {}) {
    try {
      const {
        uploadType = 'general',
        optimizeImage = true,
        generateThumbnail = true,
        preserveOriginal = fileUploadConfig.general.preserveOriginal
      } = options;

      // Validate file
      FileUploadUtils.validateFileSize(fileBuffer.length, 'local');
      FileUploadUtils.validateFileType(mimeType, 'local');
      FileUploadUtils.validateFilename(filename);

      // Generate unique filename
      const extension = FileUploadUtils.getFileExtension(filename);
      const uniqueFilename = FileUploadUtils.generateUniqueFilename(filename, extension);
      
      // Create upload directory
      const uploadPath = FileUploadUtils.getUploadPath(uploadType, 'local');
      await FileUploadUtils.ensureDirectoryExists(uploadPath);
      
      const filePath = path.join(uploadPath, uniqueFilename);
      
      // Process file based on type
      let processedBuffer = fileBuffer;
      let thumbnailPath = null;
      
      if (mimeType.startsWith('image/') && optimizeImage) {
        processedBuffer = await FileUploadUtils.optimizeImage(fileBuffer, {
          format: extension,
          quality: fileUploadConfig.general.imageQuality
        });
      }
      
      // Save main file
      await fs.writeFile(filePath, processedBuffer);
      
      // Generate thumbnail for images
      if (mimeType.startsWith('image/') && generateThumbnail) {
        const thumbnailBuffer = await FileUploadUtils.generateThumbnail(fileBuffer);
        if (thumbnailBuffer) {
          const thumbnailFilename = `thumb_${uniqueFilename}`;
          thumbnailPath = path.join(uploadPath, thumbnailFilename);
          await fs.writeFile(thumbnailPath, thumbnailBuffer);
        }
      }
      
      // Calculate file hash
      const fileHash = await FileUploadUtils.calculateFileHash(fileBuffer);
      
      const result = {
        success: true,
        filename: uniqueFilename,
        originalName: filename,
        mimeType,
        size: fileBuffer.length,
        path: filePath,
        url: `/uploads/${uploadType}/${uniqueFilename}`,
        thumbnailUrl: thumbnailPath ? `/uploads/${uploadType}/thumb_${uniqueFilename}` : null,
        hash: fileHash,
        uploadType,
        storageType: 'local',
        uploadedAt: new Date().toISOString()
      };
      
      logger.info(`File uploaded successfully: ${uniqueFilename}`);
      return result;
      
    } catch (error) {
      logger.error('Error uploading file to local storage:', error);
      throw new AppError('Failed to upload file', 500);
    }
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of file objects
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Upload results
   */
  async uploadMultipleFiles(files, options = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          options
        );
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          originalName: file.originalname,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Delete a file
   * @param {string} fileId - File path or URL
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} Delete result
   */
  async deleteFile(fileId, options = {}) {
    try {
      let filePath = fileId;
      
      // If fileId is a URL, extract the path
      if (fileId.startsWith('/uploads/')) {
        filePath = path.join(this.basePath, fileId.replace('/uploads/', ''));
      }
      
      // Check if file exists
      if (!await fs.pathExists(filePath)) {
        throw new AppError('File not found', 404);
      }
      
      // Delete main file
      await fs.remove(filePath);
      
      // Delete thumbnail if exists
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath);
      const thumbnailPath = path.join(dir, `thumb_${filename}`);
      
      if (await fs.pathExists(thumbnailPath)) {
        await fs.remove(thumbnailPath);
      }
      
      logger.info(`File deleted successfully: ${filePath}`);
      return true;
      
    } catch (error) {
      logger.error('Error deleting file from local storage:', error);
      throw new AppError('Failed to delete file', 500);
    }
  }

  /**
   * Get file information
   * @param {string} fileId - File path or URL
   * @param {Object} options - Options
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(fileId, options = {}) {
    try {
      let filePath = fileId;
      
      // If fileId is a URL, extract the path
      if (fileId.startsWith('/uploads/')) {
        filePath = path.join(this.basePath, fileId.replace('/uploads/', ''));
      }
      
      if (!await fs.pathExists(filePath)) {
        throw new AppError('File not found', 404);
      }
      
      const stats = await fs.stat(filePath);
      const filename = path.basename(filePath);
      
      return {
        filename,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${path.relative(this.basePath, filePath)}`
      };
      
    } catch (error) {
      logger.error('Error getting file info from local storage:', error);
      throw new AppError('Failed to get file information', 500);
    }
  }

  /**
   * Generate signed URL for file access
   * @param {string} fileId - File path or URL
   * @param {Object} options - URL options
   * @returns {Promise<string>} Signed URL
   */
  async generateSignedUrl(fileId, options = {}) {
    // For local storage, return the direct URL
    if (fileId.startsWith('/uploads/')) {
      return `${process.env.BASE_URL || 'http://localhost:8000'}${fileId}`;
    }
    
    return `${process.env.BASE_URL || 'http://localhost:8000'}/uploads/${fileId}`;
  }

  /**
   * Check if file exists
   * @param {string} fileId - File path or URL
   * @returns {Promise<boolean>} File exists
   */
  async fileExists(fileId) {
    try {
      let filePath = fileId;
      
      if (fileId.startsWith('/uploads/')) {
        filePath = path.join(this.basePath, fileId.replace('/uploads/', ''));
      }
      
      return await fs.pathExists(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage configuration
   * @returns {Object} Storage configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Validate storage configuration
   * @returns {boolean} Is valid
   */
  validateConfig() {
    return !!this.config.uploadPath;
  }

  /**
   * Create upload directories
   * @param {Array} uploadTypes - Array of upload types
   */
  async createUploadDirectories(uploadTypes = ['general']) {
    for (const uploadType of uploadTypes) {
      const uploadPath = FileUploadUtils.getUploadPath(uploadType, 'local');
      await FileUploadUtils.ensureDirectoryExists(uploadPath);
    }
  }
}

export default LocalStorageService; 