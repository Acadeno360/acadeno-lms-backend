import { Router } from "express";
import studentControllers from "../../controllers/users/studentController.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { singleFileUpload, handleMulterError, validateUploadedFiles } from "../../middlewares/fileUpload.js";

const studentRouter = Router()

/**
 * @swagger
 * /api/v1/user/student/list:
 *   get:
 *     summary: Fetch all students
 *     description: Retrieve a list of all students in the system. This endpoint requires authentication and appropriate authorization.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of students per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [enrolled, paused, completed]
 *         description: Filter students by enrollment status
 *       - in: query
 *         name: batchCode
 *         schema:
 *           type: string
 *         description: Filter students by batch code
 *     responses:
 *       200:
 *         description: Successfully retrieved students list
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
 *                   example: 25
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
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
studentRouter.get('/list', authenticate, authorize('admin', 'trainer'), studentControllers.fetchAllStudents)

/**
 * @swagger
 * /api/v1/user/student/create:
 *   post:
 *     summary: Create a new student
 *     description: Create a new student account with the provided information. This endpoint requires admin authentication.
 *     tags: [Students]
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
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Full name of the student
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *                 description: Student's email address
 *               password:
 *                 type: string
 *                 example: "password123"
 *                 description: Student's password (min 6 characters)
 *                 minLength: 6
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: Student's phone number
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *                 description: Student's gender
 *               profileImage:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *                 description: URL to student's profile image
 *               parent:
 *                 type: object
 *                 description: Parent information (optional)
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Jane Doe"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "jane.doe@example.com"
 *                   phone:
 *                     type: string
 *                     example: "+1234567891"
 *               assignedTrainer:
 *                 type: string
 *                 example: "64c3af23e897ad238cabc125"
 *                 description: Reference to assigned trainer
 *               course:
 *                 type: string
 *                 example: "64c3af23e897ad238cabc126"
 *                 description: Reference to enrolled course
 *               currentStatus:
 *                 type: string
 *                 enum: [enrolled, paused, completed]
 *                 example: "enrolled"
 *                 description: Student's enrollment status
 *               fee:
 *                 type: object
 *                 properties:
 *                   total:
 *                     type: number
 *                     example: 5000
 *                     description: Total course fee
 *                   paid:
 *                     type: number
 *                     example: 0
 *                     description: Amount paid initially
 *               resumeUrl:
 *                 type: string
 *                 example: "https://example.com/resume.pdf"
 *                 description: URL to student's resume
 *               address:
 *                 type: object
 *                 properties:
 *                   addressLine:
 *                     type: string
 *                     example: "123 Main Street"
 *                   pin:
 *                     type: number
 *                     example: 12345
 *               batchCode:
 *                 type: string
 *                 example: "BATCH2024A"
 *                 description: Student's batch code
 *     responses:
 *       200:
 *         description: Student created successfully
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
 *                   example: user created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     student:
 *                       $ref: '#/components/schemas/Student'
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
studentRouter.post('/create', authenticate, authorize('admin'), studentControllers.createStudent)

/**
 * @swagger
 * /api/v1/user/student/{studentId}/profile:
 *   get:
 *     summary: Get student profile
 *     description: Retrieve a specific student's profile information including profile image
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student profile retrieved successfully
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
 *                     student:
 *                       $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student not found
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
studentRouter.get('/:studentId/profile', authenticate, authorize('admin', 'trainer'), studentControllers.getStudentProfile)

/**
 * @swagger
 * /api/v1/user/student/{studentId}/profile-image:
 *   post:
 *     summary: Upload student profile image
 *     description: Upload a profile image for a specific student. Supports image optimization and thumbnail generation.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
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
 *                     student:
 *                       $ref: '#/components/schemas/Student'
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
 *         description: Student not found
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
studentRouter.post('/:studentId/profile-image',
  authenticate,
  authorize('admin', 'trainer'),
  singleFileUpload({ storageType: 'memory', fieldName: 'file' }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 1, allowedTypes: ['image'] }),
  studentControllers.uploadProfileImage
)

/**
 * @swagger
 * /api/v1/user/student/{studentId}/profile-image:
 *   put:
 *     summary: Update student profile image
 *     description: Update a student's profile image. This will delete the old image and upload a new one.
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
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
 *                     student:
 *                       $ref: '#/components/schemas/Student'
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
 *         description: Student not found
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
studentRouter.put('/:studentId/profile-image',
  authenticate,
  authorize('admin', 'trainer'),
  singleFileUpload({ storageType: 'memory', fieldName: 'file' }),
  handleMulterError,
  validateUploadedFiles({ required: true, maxFiles: 1, allowedTypes: ['image'] }),
  studentControllers.updateProfileImage
)

/**
 * @swagger
 * /api/v1/user/student/{studentId}/profile-image:
 *   delete:
 *     summary: Delete student profile image
 *     description: Remove a student's profile image from storage and update the student record
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
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
 *                     student:
 *                       $ref: '#/components/schemas/Student'
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
 *         description: Student not found
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
studentRouter.delete('/:studentId/profile-image',
  authenticate,
  authorize('admin', 'trainer'),
  studentControllers.deleteProfileImage
)

export default studentRouter