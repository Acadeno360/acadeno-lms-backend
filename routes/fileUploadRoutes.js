import { Router } from 'express';
import FileUploadController from '../controllers/FileUploadController.js';
import {
  singleFileUpload,
  multipleFilesUpload,
  namedFilesUpload,
  anyFilesUpload,
  handleMulterError,
  validateUploadedFiles,
  cleanupTempFiles
} from '../middlewares/fileUpload.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const fileUploadRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResult:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         filename:
 *           type: string
 *           example: "1703123456789_abc12345_document.pdf"
 *         originalName:
 *           type: string
 *           example: "document.pdf"
 *         mimeType:
 *           type: string
 *           example: "application/pdf"
 *         size:
 *           type: number
 *           example: 1024000
 *         url:
 *           type: string
 *           example: "https://example.com/uploads/document.pdf"
 *         thumbnailUrl:
 *           type: string
 *           example: "https://example.com/uploads/thumb_document.jpg"
 *         hash:
 *           type: string
 *           example: "md5hash123456"
 *         uploadType:
 *           type: string
 *           example: "general"
 *         storageType:
 *           type: string
 *           enum: [local, cloudinary, s3]
 *           example: "local"
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *     
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: File uploaded successfully
 *         data:
 *           $ref: '#/components/schemas/FileUploadResult'
 *     
 *     MultipleFileUploadResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: Uploaded 3 files successfully
 *         data:
 *           type: object
 *           properties:
 *             results:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FileUploadResult'
 *             summary:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 3
 *                 successful:
 *                   type: number
 *                   example: 3
 *                 failed:
 *                   type: number
 *                   example: 0
 */

/**
 * @swagger
 * /api/v1/upload/single:
 *   post:
 *     summary: Upload a single file
 *     description: Upload a single file to the specified storage provider
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: local
 *                 description: Storage provider to use
 *               uploadType:
 *                 type: string
 *                 example: general
 *                 description: Type of upload (general, profile, document, etc.)
 *               optimizeImage:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to optimize images
 *               generateThumbnail:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to generate thumbnails for images
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: Bad request - Invalid file or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.post('/single',
  authenticate,
  singleFileUpload({ storageType: 'memory' }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 1 }),
  cleanupTempFiles(),
  FileUploadController.uploadSingleFile
);

/**
 * @swagger
 * /api/v1/upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     description: Upload multiple files to the specified storage provider
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 10)
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: local
 *                 description: Storage provider to use
 *               uploadType:
 *                 type: string
 *                 example: general
 *                 description: Type of upload
 *               optimizeImage:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to optimize images
 *               generateThumbnail:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to generate thumbnails for images
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileUploadResponse'
 *       400:
 *         description: Bad request - Invalid files or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.post('/multiple',
  authenticate,
  multipleFilesUpload({ storageType: 'memory', maxFiles: 10 }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 10 }),
  cleanupTempFiles(),
  FileUploadController.uploadMultipleFiles
);

/**
 * @swagger
 * /api/v1/upload/named:
 *   post:
 *     summary: Upload named files
 *     description: Upload files with specific field names (profile, resume, certificate, assignment)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: string
 *                 format: binary
 *                 description: Profile image (max 1)
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume document (max 1)
 *               certificate:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Certificate files (max 5)
 *               assignment:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Assignment files (max 10)
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: local
 *                 description: Storage provider to use
 *               optimizeImage:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to optimize images
 *               generateThumbnail:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to generate thumbnails for images
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Files uploaded successfully
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/FileUploadResult'
 *       400:
 *         description: Bad request - Invalid files or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.post('/named',
  authenticate,
  namedFilesUpload({ storageType: 'memory' }),
  handleMulterError,
  cleanupTempFiles(),
  FileUploadController.uploadNamedFiles
);

/**
 * @swagger
 * /api/v1/upload/student:
 *   post:
 *     summary: Upload student-specific files
 *     description: Upload files specifically for a student (profile, resume, certificates)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *                 example: "64c3af23e897ad238cabc123"
 *                 description: Student ID
 *               profile:
 *                 type: string
 *                 format: binary
 *                 description: Student profile image
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Student resume
 *               certificate:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Student certificates
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: local
 *                 description: Storage provider to use
 *               optimizeImage:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to optimize images
 *               generateThumbnail:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to generate thumbnails for images
 *     responses:
 *       200:
 *         description: Student files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Student files uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       example: "64c3af23e897ad238cabc123"
 *                     results:
 *                       type: object
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/FileUploadResult'
 *       400:
 *         description: Bad request - Invalid files or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.post('/student',
  authenticate,
  authorize('admin', 'trainer'),
  namedFilesUpload({ storageType: 'memory' }),
  handleMulterError,
  cleanupTempFiles(),
  FileUploadController.uploadStudentFiles
);

/**
 * @swagger
 * /api/v1/upload/course:
 *   post:
 *     summary: Upload course materials
 *     description: Upload course materials (documents, assignments, etc.)
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - files
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "64c3af23e897ad238cabc126"
 *                 description: Course ID
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Course material files
 *               materialType:
 *                 type: string
 *                 example: "assignment"
 *                 description: Type of material (assignment, document, etc.)
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: local
 *                 description: Storage provider to use
 *               optimizeImage:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to optimize images
 *               generateThumbnail:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to generate thumbnails for images
 *     responses:
 *       200:
 *         description: Course materials uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileUploadResponse'
 *       400:
 *         description: Bad request - Invalid files or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.post('/course',
  authenticate,
  authorize('admin', 'trainer'),
  multipleFilesUpload({ storageType: 'memory', maxFiles: 20 }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 20 }),
  cleanupTempFiles(),
  FileUploadController.uploadCourseMaterials
);

/**
 * @swagger
 * /api/v1/upload/trainer:
 *   post:
 *     summary: Upload trainer profile
 *     description: Upload trainer profile image
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - trainerId
 *               - file
 *             properties:
 *               trainerId:
 *                 type: string
 *                 example: "64c3af23e897ad238cabc125"
 *                 description: Trainer ID
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Trainer profile image
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: local
 *                 description: Storage provider to use
 *               optimizeImage:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to optimize images
 *               generateThumbnail:
 *                 type: boolean
 *                 example: true
 *                 description: Whether to generate thumbnails for images
 *     responses:
 *       200:
 *         description: Trainer profile uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Trainer profile uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     trainerId:
 *                       type: string
 *                       example: "64c3af23e897ad238cabc125"
 *                     result:
 *                       $ref: '#/components/schemas/FileUploadResult'
 *       400:
 *         description: Bad request - Invalid file or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.post('/trainer',
  authenticate,
  authorize('admin'),
  singleFileUpload({ storageType: 'memory', fieldName: 'file' }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 1, allowedTypes: ['image'] }),
  cleanupTempFiles(),
  FileUploadController.uploadTrainerProfile
);

/**
 * @swagger
 * /api/v1/upload/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     description: Delete a file from storage
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID, URL, or path
 *       - in: query
 *         name: storageType
 *         schema:
 *           type: string
 *           enum: [local, cloudinary, s3]
 *         description: Storage type (auto-detected if not provided)
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Invalid file ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.delete('/:fileId',
  authenticate,
  FileUploadController.deleteFile
);

/**
 * @swagger
 * /api/v1/upload/{fileId}/info:
 *   get:
 *     summary: Get file information
 *     description: Get detailed information about a file
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID, URL, or path
 *       - in: query
 *         name: storageType
 *         schema:
 *           type: string
 *           enum: [local, cloudinary, s3]
 *         description: Storage type (auto-detected if not provided)
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                       example: "document.pdf"
 *                     url:
 *                       type: string
 *                       example: "https://example.com/uploads/document.pdf"
 *                     size:
 *                       type: number
 *                       example: 1024000
 *                     mimeType:
 *                       type: string
 *                       example: "application/pdf"
 *                     created:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Bad request - Invalid file ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.get('/:fileId/info',
  authenticate,
  FileUploadController.getFileInfo
);

/**
 * @swagger
 * /api/v1/upload/{fileId}/signed-url:
 *   get:
 *     summary: Generate signed URL
 *     description: Generate a signed URL for secure file access
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID, URL, or path
 *       - in: query
 *         name: storageType
 *         schema:
 *           type: string
 *           enum: [local, cloudinary, s3]
 *         description: Storage type (auto-detected if not provided)
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           default: 3600
 *         description: URL expiration time in seconds
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     signedUrl:
 *                       type: string
 *                       example: "https://example.com/signed-url?token=abc123"
 *                     expiresIn:
 *                       type: integer
 *                       example: 3600
 *       400:
 *         description: Bad request - Invalid file ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.get('/:fileId/signed-url',
  authenticate,
  FileUploadController.generateSignedUrl
);

/**
 * @swagger
 * /api/v1/upload/{fileId}/exists:
 *   get:
 *     summary: Check if file exists
 *     description: Check if a file exists in storage
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: File ID, URL, or path
 *       - in: query
 *         name: storageType
 *         schema:
 *           type: string
 *           enum: [local, cloudinary, s3]
 *         description: Storage type (auto-detected if not provided)
 *     responses:
 *       200:
 *         description: File existence check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Invalid file ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.get('/:fileId/exists',
  authenticate,
  FileUploadController.fileExists
);

/**
 * @swagger
 * /api/v1/upload/config:
 *   get:
 *     summary: Get upload configuration
 *     description: Get current upload configuration and available storage services
 *     tags: [File Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storageType
 *         schema:
 *           type: string
 *           enum: [local, cloudinary, s3]
 *         description: Storage type to get configuration for
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     config:
 *                       type: object
 *                       description: Storage configuration
 *                     availableServices:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["local", "cloudinary"]
 *                     defaultStorage:
 *                       type: string
 *                       example: "local"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.get('/config',
  authenticate,
  FileUploadController.getUploadConfig
);

/**
 * @swagger
 * /api/v1/upload/health:
 *   get:
 *     summary: File upload service health check
 *     description: Check the health status of the file upload service
 *     tags: [File Upload]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: File upload service is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     availableServices:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["local", "cloudinary"]
 *                     defaultStorage:
 *                       type: string
 *                       example: "local"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       500:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
fileUploadRouter.get('/health',
  FileUploadController.healthCheck
);

export default fileUploadRouter; 