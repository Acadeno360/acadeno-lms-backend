import { v2 as cloudinary } from 'cloudinary';
import BaseStorageService from './BaseStorageService.js';
import fileUploadConfig from '../../config/fileUpload.js';
import FileUploadUtils from '../../utils/fileUpload.js';
import AppError from '../../utils/appError.js';
import logger from '../../utils/logger.js';

/**
 * Cloudinary storage service implementation
 * Handles file uploads to Cloudinary
 */
class CloudinaryStorageService extends BaseStorageService {
  constructor() {
    super();
    this.config = fileUploadConfig.cloudinary;
    this.initializeCloudinary();
  }

  /**
   * Initialize Cloudinary configuration
   */
  initializeCloudinary() {
    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret
    });
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
        transformation = {}
      } = options;

      // Validate file
      FileUploadUtils.validateFileSize(fileBuffer.length, 'cloudinary');
      FileUploadUtils.validateFilename(filename);

      // Check if file type is allowed
      const extension = FileUploadUtils.getFileExtension(filename);
      if (!this.config.allowedFormats.includes(extension.toLowerCase())) {
        throw new AppError(`File type ${extension} is not allowed for Cloudinary`, 400);
      }

      // Generate unique filename
      const uniqueFilename = FileUploadUtils.generateUniqueFilename(filename, extension);
      
      // Prepare upload options
      const uploadOptions = {
        folder: `${this.config.folder}/${uploadType}`,
        public_id: uniqueFilename.replace(`.${extension}`, ''),
        resource_type: 'auto',
        ...this.config.transformation,
        ...transformation
      };

      // Convert buffer to base64 for Cloudinary
      const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(base64Data, uploadOptions);

      // Generate thumbnail if it's an image and thumbnail generation is enabled
      let thumbnailUrl = null;
      if (mimeType.startsWith('image/') && generateThumbnail) {
        const thumbnailOptions = {
          ...uploadOptions,
          transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' }
          ]
        };
        
        const thumbnailResult = await cloudinary.uploader.upload(base64Data, thumbnailOptions);
        thumbnailUrl = thumbnailResult.secure_url;
      }

      // Calculate file hash
      const fileHash = await FileUploadUtils.calculateFileHash(fileBuffer);

      const uploadResult = {
        success: true,
        filename: uniqueFilename,
        originalName: filename,
        mimeType,
        size: fileBuffer.length,
        url: result.secure_url,
        thumbnailUrl,
        publicId: result.public_id,
        assetId: result.asset_id,
        version: result.version,
        hash: fileHash,
        uploadType,
        storageType: 'cloudinary',
        uploadedAt: new Date().toISOString(),
        cloudinaryData: {
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          etag: result.etag
        }
      };

      logger.info(`File uploaded successfully to Cloudinary: ${uniqueFilename}`);
      return uploadResult;

    } catch (error) {
      logger.error('Error uploading file to Cloudinary:', error);
      throw new AppError('Failed to upload file to Cloudinary', 500);
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
   * @param {string} fileId - Cloudinary public ID or URL
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} Delete result
   */
  async deleteFile(fileId, options = {}) {
    try {
      let publicId = fileId;
      
      // If fileId is a URL, extract the public ID
      if (fileId.includes('cloudinary.com')) {
        const urlParts = fileId.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
          publicId = urlParts[uploadIndex + 2].replace(/\.[^/.]+$/, '');
        }
      }

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'auto',
        ...options
      });

      if (result.result === 'ok' || result.result === 'not found') {
        logger.info(`File deleted successfully from Cloudinary: ${publicId}`);
        return true;
      } else {
        throw new Error(`Failed to delete file: ${result.result}`);
      }

    } catch (error) {
      logger.error('Error deleting file from Cloudinary:', error);
      throw new AppError('Failed to delete file from Cloudinary', 500);
    }
  }

  /**
   * Get file information
   * @param {string} fileId - Cloudinary public ID or URL
   * @param {Object} options - Options
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(fileId, options = {}) {
    try {
      let publicId = fileId;
      
      // If fileId is a URL, extract the public ID
      if (fileId.includes('cloudinary.com')) {
        const urlParts = fileId.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
          publicId = urlParts[uploadIndex + 2].replace(/\.[^/.]+$/, '');
        }
      }

      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'auto',
        ...options
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        created: result.created_at,
        uploadedAt: result.created_at
      };

    } catch (error) {
      logger.error('Error getting file info from Cloudinary:', error);
      throw new AppError('Failed to get file information from Cloudinary', 500);
    }
  }

  /**
   * Generate signed URL for file access
   * @param {string} fileId - Cloudinary public ID or URL
   * @param {Object} options - URL options
   * @returns {Promise<string>} Signed URL
   */
  async generateSignedUrl(fileId, options = {}) {
    try {
      let publicId = fileId;
      
      // If fileId is a URL, extract the public ID
      if (fileId.includes('cloudinary.com')) {
        const urlParts = fileId.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && urlParts[uploadIndex + 2]) {
          publicId = urlParts[uploadIndex + 2].replace(/\.[^/.]+$/, '');
        }
      }

      const {
        transformation = [],
        expiresAt = Math.floor(Date.now() / 1000) + 3600, // 1 hour
        type = 'upload'
      } = options;

      const signature = cloudinary.utils.api_sign_request({
        public_id: publicId,
        transformation: transformation,
        expires_at: expiresAt,
        type: type
      }, this.config.apiSecret);

      return cloudinary.url(publicId, {
        sign_url: true,
        transformation: transformation,
        expires_at: expiresAt,
        type: type,
        signature: signature
      });

    } catch (error) {
      logger.error('Error generating signed URL for Cloudinary:', error);
      throw new AppError('Failed to generate signed URL', 500);
    }
  }

  /**
   * Check if file exists
   * @param {string} fileId - Cloudinary public ID or URL
   * @returns {Promise<boolean>} File exists
   */
  async fileExists(fileId) {
    try {
      await this.getFileInfo(fileId);
      return true;
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
    return !!(this.config.cloudName && this.config.apiKey && this.config.apiSecret);
  }

  /**
   * Create image transformation
   * @param {Object} options - Transformation options
   * @returns {Object} Transformation object
   */
  createTransformation(options = {}) {
    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;

    return {
      width,
      height,
      crop,
      quality,
      fetch_format: format
    };
  }
}

export default CloudinaryStorageService; 