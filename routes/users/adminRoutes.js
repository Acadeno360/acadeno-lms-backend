import { Router } from "express";
import adminControllers from "../../controllers/users/adminController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { singleFileUpload, handleMulterError, validateUploadedFiles } from "../../middlewares/fileUpload.js";

const adminRouter = Router()

/**
 * @swagger
 * /api/v1/user/admin/list:
 *   get:
 *     summary: Fetch all admins
 *     description: Retrieve a list of all admins in the system. This endpoint requires admin authentication.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admins list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     admins:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
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
adminRouter.get('/list', authenticate, authorize('admin'), adminControllers.fetchAllAdmins)

/**
 * @swagger
 * /api/v1/user/admin/create:
 *   post:
 *     summary: Create a new admin
 *     description: Create a new admin account with the provided information. This endpoint requires super admin authentication.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin User"
 *                 description: Full name of the admin
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *                 description: Admin's email address
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: Admin's password (min 6 characters)
 *                 minLength: 6
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: Admin's phone number
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *                 description: Admin's gender
 *               profileImage:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *                 description: URL to admin's profile image
 *               privileges:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["full_access", "manage_courses", "manage_payments"]
 *                 description: Admin privileges
 *               isSuperAdmin:
 *                 type: boolean
 *                 example: false
 *                 description: Whether the admin is a super admin
 *     responses:
 *       200:
 *         description: Admin created successfully
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
 *                   example: Admin created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Email already exists
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
adminRouter.post('/create', authenticate, authorize('admin'), adminControllers.createAdmin)

/**
 * @swagger
 * /api/v1/user/admin/{adminId}/profile:
 *   get:
 *     summary: Get admin profile
 *     description: Retrieve a specific admin's profile information including profile image
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
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
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Admin not found
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
adminRouter.get('/:adminId/profile', authenticate, authorize('admin'), adminControllers.getAdminProfile)

/**
 * @swagger
 * /api/v1/user/admin/{adminId}/profile-image:
 *   post:
 *     summary: Upload admin profile image
 *     description: Upload a profile image for a specific admin. Supports image optimization and thumbnail generation.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
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
 *                 description: Profile image file (JPG, PNG, GIF)
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: cloudinary
 *                 description: Storage provider to use
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
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
 *                   example: Profile image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *                     imageInfo:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/v123/profile.jpg"
 *                         thumbnailUrl:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/v123/thumb_profile.jpg"
 *                         filename:
 *                           type: string
 *                           example: "profile.jpg"
 *       400:
 *         description: Bad request - Invalid file or missing file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Admin not found
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
adminRouter.post('/:adminId/profile-image',
  authenticate,
  authorize('admin'),
  singleFileUpload({ storageType: 'memory', fieldName: 'file' }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 1, allowedTypes: ['image'] }),
  adminControllers.uploadProfileImage
)

/**
 * @swagger
 * /api/v1/user/admin/{adminId}/profile-image:
 *   put:
 *     summary: Update admin profile image
 *     description: Update an admin's profile image. This will delete the old image and upload a new one.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
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
 *                 description: New profile image file (JPG, PNG, GIF)
 *               storageType:
 *                 type: string
 *                 enum: [local, cloudinary, s3]
 *                 example: cloudinary
 *                 description: Storage provider to use
 *     responses:
 *       200:
 *         description: Profile image updated successfully
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
 *                   example: Profile image updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *                     imageInfo:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/v123/profile.jpg"
 *                         thumbnailUrl:
 *                           type: string
 *                           example: "https://res.cloudinary.com/example/image/upload/v123/thumb_profile.jpg"
 *                         filename:
 *                           type: string
 *                           example: "profile.jpg"
 *       400:
 *         description: Bad request - Invalid file or missing file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Admin not found
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
adminRouter.put('/:adminId/profile-image',
  authenticate,
  authorize('admin'),
  singleFileUpload({ storageType: 'memory', fieldName: 'file' }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 1, allowedTypes: ['image'] }),
  adminControllers.updateProfileImage
)

/**
 * @swagger
 * /api/v1/user/admin/{adminId}/profile-image:
 *   delete:
 *     summary: Delete admin profile image
 *     description: Remove an admin's profile image from storage and update the admin record
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Profile image deleted successfully
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
 *                   example: Profile image deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Bad request - No profile image to delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Admin not found
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
adminRouter.delete('/:adminId/profile-image',
  authenticate,
  authorize('admin'),
  adminControllers.deleteProfileImage
)

export default adminRouter