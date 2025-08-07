import dotenv from 'dotenv';

dotenv.config();

const fileUploadConfig = {
  // Local storage configuration
  local: {
    uploadPath: process.env.LOCAL_UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed'
    ],
    imageFormats: ['jpeg', 'png', 'gif', 'webp'],
    documentFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'],
    archiveFormats: ['zip', 'rar']
  },

  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'maitexa',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
    maxFileSize: parseInt(process.env.CLOUDINARY_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    transformation: {
      quality: 'auto',
      fetch_format: 'auto'
    }
  },

  // AWS S3 configuration
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    folder: process.env.AWS_S3_FOLDER || 'maitexa',
    maxFileSize: parseInt(process.env.AWS_S3_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'zip', 'rar'],
    acl: 'public-read'
  },

  // General upload settings
  general: {
    defaultStorage: process.env.DEFAULT_STORAGE || 'local', // 'local', 'cloudinary', 's3'
    enableImageOptimization: process.env.ENABLE_IMAGE_OPTIMIZATION === 'true',
    imageQuality: parseInt(process.env.IMAGE_QUALITY) || 80,
    maxWidth: parseInt(process.env.MAX_IMAGE_WIDTH) || 1920,
    maxHeight: parseInt(process.env.MAX_IMAGE_HEIGHT) || 1080,
    generateThumbnails: process.env.GENERATE_THUMBNAILS === 'true',
    thumbnailSize: {
      width: parseInt(process.env.THUMBNAIL_WIDTH) || 300,
      height: parseInt(process.env.THUMBNAIL_HEIGHT) || 300
    },
    preserveOriginal: process.env.PRESERVE_ORIGINAL === 'true',
    cleanupTempFiles: process.env.CLEANUP_TEMP_FILES === 'true'
  },

  // Upload types configuration
  uploadTypes: {
    single: {
      fieldName: 'file',
      maxCount: 1
    },
    multiple: {
      fieldName: 'files',
      maxCount: 10
    },
    named: {
      fields: {
        profile: { maxCount: 1, allowedTypes: ['image'] },
        resume: { maxCount: 1, allowedTypes: ['document'] },
        certificate: { maxCount: 5, allowedTypes: ['image', 'document'] },
        assignment: { maxCount: 10, allowedTypes: ['document', 'archive'] }
      }
    }
  },

  // File validation rules
  validation: {
    maxFileNameLength: 255,
    minFileSize: 1024, // 1KB
    virusScanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true',
    duplicateCheckEnabled: process.env.DUPLICATE_CHECK_ENABLED === 'true'
  }
};

export default fileUploadConfig; 