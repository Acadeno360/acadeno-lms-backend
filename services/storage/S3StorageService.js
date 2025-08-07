import AWS from 'aws-sdk';
import BaseStorageService from './BaseStorageService.js';
import fileUploadConfig from '../../config/fileUpload.js';
import FileUploadUtils from '../../utils/fileUpload.js';
import AppError from '../../utils/appError.js';
import logger from '../../utils/logger.js';

/**
 * AWS S3 storage service implementation
 * Handles file uploads to AWS S3
 */
class S3StorageService extends BaseStorageService {
  constructor() {
    super();
    this.config = fileUploadConfig.s3;
    this.initializeS3();
  }

  /**
   * Initialize AWS S3 configuration
   */
  initializeS3() {
    this.s3 = new AWS.S3({
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      region: this.config.region
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
        acl = this.config.acl,
        metadata = {}
      } = options;

      // Validate file
      FileUploadUtils.validateFileSize(fileBuffer.length, 's3');
      FileUploadUtils.validateFilename(filename);

      // Check if file type is allowed
      const extension = FileUploadUtils.getFileExtension(filename);
      if (!this.config.allowedFormats.includes(extension.toLowerCase())) {
        throw new AppError(`File type ${extension} is not allowed for S3`, 400);
      }

      // Generate unique filename
      const uniqueFilename = FileUploadUtils.generateUniqueFilename(filename, extension);
      
      // Create S3 key
      const s3Key = `${this.config.folder}/${uploadType}/${uniqueFilename}`;
      
      // Process file based on type
      let processedBuffer = fileBuffer;
      let thumbnailKey = null;
      
      if (mimeType.startsWith('image/') && optimizeImage) {
        processedBuffer = await FileUploadUtils.optimizeImage(fileBuffer, {
          format: extension,
          quality: fileUploadConfig.general.imageQuality
        });
      }

      // Prepare upload parameters
      const uploadParams = {
        Bucket: this.config.bucketName,
        Key: s3Key,
        Body: processedBuffer,
        ContentType: mimeType,
        ACL: acl,
        Metadata: {
          originalName: filename,
          uploadType,
          ...metadata
        }
      };

      // Upload to S3
      const result = await this.s3.upload(uploadParams).promise();

      // Generate thumbnail for images
      if (mimeType.startsWith('image/') && generateThumbnail) {
        const thumbnailBuffer = await FileUploadUtils.generateThumbnail(fileBuffer);
        if (thumbnailBuffer) {
          const thumbnailFilename = `thumb_${uniqueFilename}`;
          thumbnailKey = `${this.config.folder}/${uploadType}/${thumbnailFilename}`;
          
          const thumbnailParams = {
            Bucket: this.config.bucketName,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg',
            ACL: acl,
            Metadata: {
              originalName: `thumb_${filename}`,
              uploadType,
              isThumbnail: 'true',
              ...metadata
            }
          };

          await this.s3.upload(thumbnailParams).promise();
        }
      }

      // Calculate file hash
      const fileHash = await FileUploadUtils.calculateFileHash(fileBuffer);

      const uploadResult = {
        success: true,
        filename: uniqueFilename,
        originalName: filename,
        mimeType,
        size: fileBuffer.length,
        url: result.Location,
        thumbnailUrl: thumbnailKey ? `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${thumbnailKey}` : null,
        s3Key: s3Key,
        thumbnailS3Key: thumbnailKey,
        etag: result.ETag,
        versionId: result.VersionId,
        hash: fileHash,
        uploadType,
        storageType: 's3',
        uploadedAt: new Date().toISOString(),
        s3Data: {
          bucket: result.Bucket,
          key: result.Key,
          location: result.Location
        }
      };

      logger.info(`File uploaded successfully to S3: ${uniqueFilename}`);
      return uploadResult;

    } catch (error) {
      logger.error('Error uploading file to S3:', error);
      throw new AppError('Failed to upload file to S3', 500);
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
   * @param {string} fileId - S3 key or URL
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} Delete result
   */
  async deleteFile(fileId, options = {}) {
    try {
      let s3Key = fileId;
      
      // If fileId is a URL, extract the S3 key
      if (fileId.includes('amazonaws.com')) {
        const urlParts = fileId.split('/');
        const bucketIndex = urlParts.findIndex(part => part.includes('.s3.'));
        if (bucketIndex !== -1 && urlParts[bucketIndex + 1]) {
          s3Key = urlParts.slice(bucketIndex + 1).join('/');
        }
      }

      const deleteParams = {
        Bucket: this.config.bucketName,
        Key: s3Key,
        ...options
      };

      const result = await this.s3.deleteObject(deleteParams).promise();

      // Delete thumbnail if exists
      const dir = s3Key.substring(0, s3Key.lastIndexOf('/'));
      const filename = s3Key.substring(s3Key.lastIndexOf('/') + 1);
      const thumbnailKey = `${dir}/thumb_${filename}`;

      try {
        await this.s3.deleteObject({
          Bucket: this.config.bucketName,
          Key: thumbnailKey
        }).promise();
      } catch (thumbnailError) {
        // Thumbnail might not exist, ignore error
        logger.debug(`Thumbnail not found for deletion: ${thumbnailKey}`);
      }

      logger.info(`File deleted successfully from S3: ${s3Key}`);
      return true;

    } catch (error) {
      logger.error('Error deleting file from S3:', error);
      throw new AppError('Failed to delete file from S3', 500);
    }
  }

  /**
   * Get file information
   * @param {string} fileId - S3 key or URL
   * @param {Object} options - Options
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(fileId, options = {}) {
    try {
      let s3Key = fileId;
      
      // If fileId is a URL, extract the S3 key
      if (fileId.includes('amazonaws.com')) {
        const urlParts = fileId.split('/');
        const bucketIndex = urlParts.findIndex(part => part.includes('.s3.'));
        if (bucketIndex !== -1 && urlParts[bucketIndex + 1]) {
          s3Key = urlParts.slice(bucketIndex + 1).join('/');
        }
      }

      const headParams = {
        Bucket: this.config.bucketName,
        Key: s3Key,
        ...options
      };

      const result = await this.s3.headObject(headParams).promise();

      return {
        s3Key: s3Key,
        url: `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${s3Key}`,
        size: result.ContentLength,
        mimeType: result.ContentType,
        etag: result.ETag,
        lastModified: result.LastModified,
        metadata: result.Metadata
      };

    } catch (error) {
      logger.error('Error getting file info from S3:', error);
      throw new AppError('Failed to get file information from S3', 500);
    }
  }

  /**
   * Generate signed URL for file access
   * @param {string} fileId - S3 key or URL
   * @param {Object} options - URL options
   * @returns {Promise<string>} Signed URL
   */
  async generateSignedUrl(fileId, options = {}) {
    try {
      let s3Key = fileId;
      
      // If fileId is a URL, extract the S3 key
      if (fileId.includes('amazonaws.com')) {
        const urlParts = fileId.split('/');
        const bucketIndex = urlParts.findIndex(part => part.includes('.s3.'));
        if (bucketIndex !== -1 && urlParts[bucketIndex + 1]) {
          s3Key = urlParts.slice(bucketIndex + 1).join('/');
        }
      }

      const {
        expiresIn = 3600, // 1 hour
        operation = 'getObject'
      } = options;

      const params = {
        Bucket: this.config.bucketName,
        Key: s3Key,
        Expires: expiresIn
      };

      return this.s3.getSignedUrl(operation, params);

    } catch (error) {
      logger.error('Error generating signed URL for S3:', error);
      throw new AppError('Failed to generate signed URL', 500);
    }
  }

  /**
   * Check if file exists
   * @param {string} fileId - S3 key or URL
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
    return !!(this.config.accessKeyId && this.config.secretAccessKey && this.config.bucketName);
  }

  /**
   * List files in a folder
   * @param {string} prefix - Folder prefix
   * @param {Object} options - List options
   * @returns {Promise<Array>} List of files
   */
  async listFiles(prefix = '', options = {}) {
    try {
      const {
        maxKeys = 1000,
        continuationToken
      } = options;

      const params = {
        Bucket: this.config.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
        ...(continuationToken && { ContinuationToken: continuationToken })
      };

      const result = await this.s3.listObjectsV2(params).promise();

      return {
        files: result.Contents || [],
        isTruncated: result.IsTruncated,
        nextContinuationToken: result.NextContinuationToken
      };

    } catch (error) {
      logger.error('Error listing files from S3:', error);
      throw new AppError('Failed to list files from S3', 500);
    }
  }
}

export default S3StorageService; 