/**
 * Base storage service interface
 * Defines the contract for all storage providers
 */
class BaseStorageService {
  /**
   * Upload a single file
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - Filename
   * @param {string} mimeType - MIME type
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(fileBuffer, filename, mimeType, options = {}) {
    throw new Error('uploadFile method must be implemented');
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of file objects
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Upload results
   */
  async uploadMultipleFiles(files, options = {}) {
    throw new Error('uploadMultipleFiles method must be implemented');
  }

  /**
   * Delete a file
   * @param {string} fileId - File identifier (URL, path, or ID)
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} Delete result
   */
  async deleteFile(fileId, options = {}) {
    throw new Error('deleteFile method must be implemented');
  }

  /**
   * Get file information
   * @param {string} fileId - File identifier
   * @param {Object} options - Options
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(fileId, options = {}) {
    throw new Error('getFileInfo method must be implemented');
  }

  /**
   * Generate signed URL for file access
   * @param {string} fileId - File identifier
   * @param {Object} options - URL options
   * @returns {Promise<string>} Signed URL
   */
  async generateSignedUrl(fileId, options = {}) {
    throw new Error('generateSignedUrl method must be implemented');
  }

  /**
   * Check if file exists
   * @param {string} fileId - File identifier
   * @returns {Promise<boolean>} File exists
   */
  async fileExists(fileId) {
    throw new Error('fileExists method must be implemented');
  }

  /**
   * Get storage configuration
   * @returns {Object} Storage configuration
   */
  getConfig() {
    throw new Error('getConfig method must be implemented');
  }

  /**
   * Validate storage configuration
   * @returns {boolean} Is valid
   */
  validateConfig() {
    throw new Error('validateConfig method must be implemented');
  }
}

export default BaseStorageService; 